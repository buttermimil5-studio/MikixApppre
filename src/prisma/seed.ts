import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const DEFAULT_SECRET = 'miki_super_secure_vault_key_2026_32b';
const KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || DEFAULT_SECRET)
  .digest();

function encryptCredentials(plainText: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

function encryptStockCredentials(email: string, pass: string) {
  const emailEnc = encryptCredentials(email);
  const passEnc = encryptCredentials(pass);
  return {
    encryptedEmail: emailEnc.encrypted,
    iv: emailEnc.iv,
    tag: emailEnc.tag,
    encryptedPassword: passEnc.encrypted,
    passwordIv: passEnc.iv,
    passwordTag: passEnc.tag,
  };
}

async function main() {
  console.log('Seeding database...');

  // 1. Store Setting
  const storeSetting = await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Miki App Store - แอพพรีเมียมราคาส่ง',
      bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      announcementNote: 'ประกาศ: ร้านเปิดให้บริการตามปกติ ระบบกดรับรหัสอัตโนมัติ 24 ชม. รับประกันตลอดอายุการใช้งาน ติดต่อสอบถามหรือแจ้งปัญหาได้ที่ LINE: @miki.store',
      contactLine: '@miki.store',
      contactFacebook: 'Miki App Premium Store',
      contactInstagram: 'miki.appshop',
      isOpen: true,
      closedNotice: 'ขออภัย ร้านค้าปิดทำการชั่วคราวเพื่ออัปเดตระบบสต็อก จะเปิดในเวลา 09:00 น.',
      bankName: 'ธนาคารกสิกรไทย (KBank)',
      bankAccountName: 'บจก. มิคิ แอพสโตร์',
      bankAccountNumber: '098-7-65432-1',
      promptPayNumber: '0891234567',
      slip2goApiKey: '',
      slip2goSecretKey: '',
    },
  });

  console.log('Store setting ready:', storeSetting.storeName);

  // 2. Users (Admin & Agent)
  const adminPasswordHash = await bcrypt.hash('mikiadmin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      profileName: 'แอดมินมิคิ (Master)',
      creditBalance: 99999.0,
      frameTheme: 'BEAR',
      frameAccessory: 'BOW',
      salesChannel: 'LINE: @miki.store (Admin)',
    },
  });

  const agentPasswordHash = await bcrypt.hash('miki123', 10);
  const agent = await prisma.user.upsert({
    where: { username: 'agent_miki' },
    update: {},
    create: {
      username: 'agent_miki',
      passwordHash: agentPasswordHash,
      role: 'AGENT',
      profileName: 'ตัวแทนมิคิจัง',
      creditBalance: 500.0, // มีเครดิต 500 บาทสำหรับทดสอบซื้อได้ทันที
      frameTheme: 'BUNNY',
      frameAccessory: 'CHERRY',
      salesChannel: 'IG: @miki.reseller | LINE: agent_miki',
    },
  });

  console.log('Admin and Agent ready:', admin.username, agent.username);

  // 3. Categories
  const catStreaming = await prisma.category.upsert({
    where: { id: 'cat-streaming' },
    update: {},
    create: {
      id: 'cat-streaming',
      name: 'สตรีมมิ่ง & ซีรีส์',
      iconName: 'Tv',
      sortOrder: 1,
    },
  });

  const catWork = await prisma.category.upsert({
    where: { id: 'cat-work' },
    update: {},
    create: {
      id: 'cat-work',
      name: 'ทำงาน & ออกแบบ',
      iconName: 'Palette',
      sortOrder: 2,
    },
  });

  const catMusic = await prisma.category.upsert({
    where: { id: 'cat-music' },
    update: {},
    create: {
      id: 'cat-music',
      name: 'ฟังเพลง & พอดแคสต์',
      iconName: 'Headphones',
      sortOrder: 3,
    },
  });

  // 4. Products & Stocks
  // Product 1: Netflix 30 วัน (จอเดี่ยว)
  const p1 = await prisma.product.upsert({
    where: { id: 'prod-netflix-30' },
    update: {},
    create: {
      id: 'prod-netflix-30',
      categoryId: catStreaming.id,
      name: 'Netflix Premium 4K (จอเดี่ยว 30 วัน)',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&auto=format&fit=crop&q=80',
      price: 89.0,
      durationDays: 30,
      rules: '1. ห้ามเปลี่ยนอีเมลและรหัสผ่านโดยเด็ดขาด\n2. เข้าใช้งานเฉพาะโปรไฟล์ที่ระบุเท่านั้น ห้ามเข้าโปรไฟล์ของผู้อื่น\n3. ห้ามล็อกอินเกิน 1 เครื่องพร้อมกัน\n4. มีปัญหาการรับชมติดต่อแอดมินพร้อมแคปหน้าจอคำสั่งซื้อ',
      usageGuide: '1. เข้าแอปพลิเคชัน Netflix หรือเว็บไซต์ netflix.com\n2. กรอกอีเมลและรหัสผ่านที่ได้รับหลังชำระเงิน\n3. เลือกเข้าชมเฉพาะชื่อโปรไฟล์และ PIN ตามที่ระบบกำหนด\n4. เพลิดเพลินกับภาพยนตร์และซีรีส์ระดับ 4K UHD Ultra HD',
      otpEnabled: true,
      lineOaUrl: 'https://line.me/R/ti/p/@miki.store',
      isActive: true,
    },
  });

  // Stock for Netflix (1 Shared Account with 4 profile slots)
  const nfCreds = encryptStockCredentials('netflix.family.miki01@gmail.com', 'MikiNfPass@2026!');
  
  const existingStock1 = await prisma.accountStock.findFirst({
    where: { productId: p1.id },
  });

  if (!existingStock1) {
    const stock1 = await prisma.accountStock.create({
      data: {
        productId: p1.id,
        encryptedEmail: nfCreds.encryptedEmail,
        encryptedPassword: nfCreds.encryptedPassword,
        iv: nfCreds.iv,
        tag: nfCreds.tag,
        passwordIv: nfCreds.passwordIv,
        passwordTag: nfCreds.passwordTag,
        notes: 'Netflix Family Account 1 - ตัดรอบวันที่ 28 ทุกเดือน',
        totalSlots: 4,
        status: 'ACTIVE',
        profileSlots: {
          create: [
            { slotName: 'โปรไฟล์ 1 (Pink Bunny)', slotPin: '1234', status: 'AVAILABLE' },
            { slotName: 'โปรไฟล์ 2 (Brown Bear)', slotPin: '2345', status: 'AVAILABLE' },
            { slotName: 'โปรไฟล์ 3 (Sweet Cherry)', slotPin: '3456', status: 'AVAILABLE' },
            { slotName: 'โปรไฟล์ 4 (Whipped Cream)', slotPin: '4567', status: 'AVAILABLE' },
          ],
        },
      },
    });
    console.log('Created Netflix stock with 4 profile slots:', stock1.id);
  } else {
    await prisma.accountStock.update({
      where: { id: existingStock1.id },
      data: {
        encryptedEmail: nfCreds.encryptedEmail,
        encryptedPassword: nfCreds.encryptedPassword,
        iv: nfCreds.iv,
        tag: nfCreds.tag,
        passwordIv: nfCreds.passwordIv,
        passwordTag: nfCreds.passwordTag,
      },
    });
  }

  // Product 2: YouTube Premium 30 วัน (เมลร้าน)
  const p2 = await prisma.product.upsert({
    where: { id: 'prod-yt-30' },
    update: {},
    create: {
      id: 'prod-yt-30',
      categoryId: catStreaming.id,
      name: 'YouTube Premium 30 วัน (เมลร้าน)',
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop&q=80',
      price: 45.0,
      durationDays: 30,
      rules: '1. บัญชีสำหรับรับชมแบบไม่มีโฆษณา และใช้งาน YouTube Music ได้\n2. ห้ามเปลี่ยนรหัสผ่านหรือข้อมูลความปลอดภัย\n3. ห้ามกดออกจากกลุ่มครอบครัว',
      usageGuide: '1. ล็อกอินเข้าแอปพลิเคชัน YouTube ด้วยอีเมลและรหัสผ่านที่ได้รับ\n2. หากระบบถามยืนยัน OTP ให้กดปุ่ม "ขอ OTP ผ่าน LINE OA" เพื่อรับรหัสทันที',
      otpEnabled: true,
      lineOaUrl: 'https://line.me/R/ti/p/@miki.store',
      isActive: true,
    },
  });

  const existingStock2 = await prisma.accountStock.findFirst({
    where: { productId: p2.id },
  });

  const ytCreds = encryptStockCredentials('yt.miki.premium01@gmail.com', 'YtMiki@Secure2026');
  if (!existingStock2) {
    await prisma.accountStock.create({
      data: {
        productId: p2.id,
        encryptedEmail: ytCreds.encryptedEmail,
        encryptedPassword: ytCreds.encryptedPassword,
        iv: ytCreds.iv,
        tag: ytCreds.tag,
        passwordIv: ytCreds.passwordIv,
        passwordTag: ytCreds.passwordTag,
        notes: 'YT Premium บัญชีเดี่ยว 01',
        totalSlots: 1,
        status: 'ACTIVE',
        profileSlots: {
          create: [{ slotName: 'บัญชีเต็มสิทธิ์', status: 'AVAILABLE' }],
        },
      },
    });
  } else {
    await prisma.accountStock.update({
      where: { id: existingStock2.id },
      data: {
        encryptedEmail: ytCreds.encryptedEmail,
        encryptedPassword: ytCreds.encryptedPassword,
        iv: ytCreds.iv,
        tag: ytCreds.tag,
        passwordIv: ytCreds.passwordIv,
        passwordTag: ytCreds.passwordTag,
      },
    });
  }

  // Product 3: Canva Pro 30 วัน
  const p3 = await prisma.product.upsert({
    where: { id: 'prod-canva-30' },
    update: {},
    create: {
      id: 'prod-canva-30',
      categoryId: catWork.id,
      name: 'Canva Pro 30 วัน (เต็มสิทธิ์)',
      imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&auto=format&fit=crop&q=80',
      price: 39.0,
      durationDays: 30,
      rules: '1. ใช้งานได้ทุกฟีเจอร์พรีเมียม เทมเพลต รูปภาพ และฟอนต์ไม่จำกัด\n2. ห้ามนำบัญชีไปขายต่อในลักษณะกลุ่มที่ไม่ได้รับอนุญาต',
      usageGuide: '1. ล็อกอินที่ canva.com หรือผ่านแอป Canva บนมือถือ/แท็บเล็ต\n2. เลือกทีมโปรเพื่อเริ่มออกแบบงานได้ทันที',
      otpEnabled: false,
      lineOaUrl: null,
      isActive: true,
    },
  });

  const existingStock3 = await prisma.accountStock.findFirst({
    where: { productId: p3.id },
  });

  const canvaCreds = encryptStockCredentials('canva.miki.pro01@gmail.com', 'CanvaPro#2026!');
  if (!existingStock3) {
    await prisma.accountStock.create({
      data: {
        productId: p3.id,
        encryptedEmail: canvaCreds.encryptedEmail,
        encryptedPassword: canvaCreds.encryptedPassword,
        iv: canvaCreds.iv,
        tag: canvaCreds.tag,
        passwordIv: canvaCreds.passwordIv,
        passwordTag: canvaCreds.passwordTag,
        notes: 'Canva Pro บัญชี 01',
        totalSlots: 1,
        status: 'ACTIVE',
        profileSlots: {
          create: [{ slotName: 'เต็มสิทธิ์ Pro', status: 'AVAILABLE' }],
        },
      },
    });
  } else {
    await prisma.accountStock.update({
      where: { id: existingStock3.id },
      data: {
        encryptedEmail: canvaCreds.encryptedEmail,
        encryptedPassword: canvaCreds.encryptedPassword,
        iv: canvaCreds.iv,
        tag: canvaCreds.tag,
        passwordIv: canvaCreds.passwordIv,
        passwordTag: canvaCreds.passwordTag,
      },
    });
  }

  // Product 4: Spotify Premium 30 วัน
  const p4 = await prisma.product.upsert({
    where: { id: 'prod-spotify-30' },
    update: {},
    create: {
      id: 'prod-spotify-30',
      categoryId: catMusic.id,
      name: 'Spotify Premium 30 วัน (จอเดี่ยว)',
      imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=400&auto=format&fit=crop&q=80',
      price: 49.0,
      durationDays: 30,
      rules: '1. ฟังเพลงไม่มีโฆษณาคั่น ดาวน์โหลดฟังออฟไลน์ได้\n2. ห้ามเปลี่ยนรหัสผ่านหรือข้อมูลส่วนตัว',
      usageGuide: '1. เข้าสู่ระบบแอป Spotify ด้วยอีเมลและรหัสผ่านที่ได้รับ\n2. เริ่มฟังเพลงและสร้างเพลย์ลิสต์ได้ทันที',
      otpEnabled: false,
      lineOaUrl: null,
      isActive: true,
    },
  });

  const existingStock4 = await prisma.accountStock.findFirst({
    where: { productId: p4.id },
  });

  const spotCreds = encryptStockCredentials('spotify.miki01@gmail.com', 'SpotifyPass2026!');
  if (!existingStock4) {
    await prisma.accountStock.create({
      data: {
        productId: p4.id,
        encryptedEmail: spotCreds.encryptedEmail,
        encryptedPassword: spotCreds.encryptedPassword,
        iv: spotCreds.iv,
        tag: spotCreds.tag,
        passwordIv: spotCreds.passwordIv,
        passwordTag: spotCreds.passwordTag,
        notes: 'Spotify Premium บัญชี 01',
        totalSlots: 1,
        status: 'ACTIVE',
        profileSlots: {
          create: [{ slotName: 'บัญชีส่วนตัว', status: 'AVAILABLE' }],
        },
      },
    });
  } else {
    await prisma.accountStock.update({
      where: { id: existingStock4.id },
      data: {
        encryptedEmail: spotCreds.encryptedEmail,
        encryptedPassword: spotCreds.encryptedPassword,
        iv: spotCreds.iv,
        tag: spotCreds.tag,
        passwordIv: spotCreds.passwordIv,
        passwordTag: spotCreds.passwordTag,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
