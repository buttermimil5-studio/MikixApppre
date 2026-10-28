'use server';

import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, createSessionToken, COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  try {
    const username = (formData.get('username') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }

    const token = await createSessionToken({
      id: user.id,
      username: user.username,
      role: user.role,
      profileName: user.profileName,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileName: user.profileName,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const username = (formData.get('username') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const profileName = (formData.get('profileName') as string)?.trim() || username;
    const salesChannel = (formData.get('salesChannel') as string)?.trim() || '';

    if (!username || !password) {
      return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
    }

    if (username.length < 3) {
      return { success: false, error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' };
    }

    if (password.length < 6) {
      return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: 'ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น' };
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        profileName,
        salesChannel,
        role: 'AGENT',
        creditBalance: 100.0, // โบนัสต้อนรับตัวแทนใหม่ 100 เครดิตสำหรับทดลองกดสินค้า
        frameTheme: 'BUNNY',
        frameAccessory: 'BOW',
      },
    });

    const token = await createSessionToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      profileName: newUser.profileName,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        profileName: newUser.profileName,
      },
    };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function updateProfileAction(data: {
  profileName: string;
  salesChannel: string;
  frameTheme: string;
  frameAccessory: string;
  avatarUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        profileName: data.profileName,
        salesChannel: data.salesChannel,
        frameTheme: data.frameTheme,
        frameAccessory: data.frameAccessory,
        avatarUrl: data.avatarUrl || user.avatarUrl,
      },
    });

    return { success: true, user: updated };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'ไม่สามารถอัปเดตโปรไฟล์ได้' };
  }
}
