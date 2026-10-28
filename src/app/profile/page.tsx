import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';


export default async function ProfilePage() {
  const [user, storeSetting] = await Promise.all([
    getCurrentUser(),
    prisma.storeSetting.findUnique({
      where: { id: 'default' },
    }),
  ]);

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
        <ProfileClient user={user} />
      </main>
    </div>
  );
}
