import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'miki_app_jwt_secret_token_session_2026'
);

const COOKIE_NAME = 'miki_session';

export interface UserSession {
  id: string;
  username: string;
  role: string;
  profileName: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as string,
      profileName: payload.profileName as string,
    };
  } catch {
    return null;
  }
}

interface UserCacheEntry {
  user: any;
  timestamp: number;
}

const globalUserCache = global as unknown as {
  __mikiUserCache?: Map<string, UserCacheEntry>;
};

if (!globalUserCache.__mikiUserCache) {
  globalUserCache.__mikiUserCache = new Map<string, UserCacheEntry>();
}

export function invalidateUserCache(userId?: string) {
  if (userId) {
    globalUserCache.__mikiUserCache?.delete(userId);
  } else {
    globalUserCache.__mikiUserCache?.clear();
  }
}

export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    const now = Date.now();
    const cached = globalUserCache.__mikiUserCache?.get(session.id);
    if (cached && now - cached.timestamp < 15000) {
      return cached.user;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        role: true,
        profileName: true,
        creditBalance: true,
        salesChannel: true,
        avatarUrl: true,
        frameTheme: true,
        frameAccessory: true,
      },
    });

    if (user) {
      globalUserCache.__mikiUserCache?.set(session.id, {
        user,
        timestamp: now,
      });
    }

    return user;
  } catch (error) {
    if ((error as any)?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error getting current user:', error);
    return null;
  }
});

export { COOKIE_NAME };
