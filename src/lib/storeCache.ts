import prisma from './prisma';

interface CachedStoreData {
  data: any;
  timestamp: number;
}

const globalStoreCache = global as unknown as {
  __mikiStoreDataCache?: CachedStoreData;
  __mikiSettingCache?: { data: any; timestamp: number };
};

const CACHE_TTL_MS = 60 * 1000;

export async function getStoreDataCached(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    globalStoreCache.__mikiStoreDataCache &&
    now - globalStoreCache.__mikiStoreDataCache.timestamp < CACHE_TTL_MS
  ) {
    return globalStoreCache.__mikiStoreDataCache.data;
  }

  const [storeSetting, categories, contacts, rawProducts, bankAccounts] = await Promise.all([
    prisma.storeSetting.findUnique({
      where: { id: 'default' },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.storeContact.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        accountStocks: {
          where: { status: { in: ['ACTIVE', 'FULL'] } },
          select: {
            profileSlots: {
              where: { status: 'AVAILABLE' },
              select: { productId: true },
            },
          },
        },
        assignedSlots: {
          where: {
            status: 'AVAILABLE',
            accountStock: { status: { in: ['ACTIVE', 'FULL'] } },
          },
          select: { id: true },
        },
      },
      orderBy: [{ isBestseller: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const activeSetting = storeSetting || {
    id: 'default',
    storeName: 'Miki App Store',
    isOpen: true,
    closedNotice: null,
    slip2goSecretKey: null,
  };

  const result = { storeSetting: activeSetting, categories, contacts, rawProducts, bankAccounts };
  globalStoreCache.__mikiStoreDataCache = {
    data: result,
    timestamp: now,
  };

  return result;
}

export async function getStoreSettingCached(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    globalStoreCache.__mikiSettingCache &&
    now - globalStoreCache.__mikiSettingCache.timestamp < CACHE_TTL_MS
  ) {
    return globalStoreCache.__mikiSettingCache.data;
  }

  const setting = await prisma.storeSetting.findUnique({
    where: { id: 'default' },
  });

  const activeSetting = setting || {
    id: 'default',
    storeName: 'Miki App Store',
    isOpen: true,
    closedNotice: null,
    slip2goSecretKey: null,
  };

  globalStoreCache.__mikiSettingCache = {
    data: activeSetting,
    timestamp: now,
  };

  return activeSetting;
}

export function invalidateStoreCache() {
  delete globalStoreCache.__mikiStoreDataCache;
  delete globalStoreCache.__mikiSettingCache;
}
