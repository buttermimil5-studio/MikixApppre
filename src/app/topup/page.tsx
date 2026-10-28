import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { TopupClient } from './TopupClient';


export default async function TopupPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/topup');
  }

  const [storeSetting, bankAccounts, recentTopups] = await Promise.all([
    prisma.storeSetting.findUnique({
      where: { id: 'default' },
    }),
    prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.topupTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <TopupClient
          user={user}
          storeSetting={storeSetting}
          bankAccounts={bankAccounts}
          recentTopups={recentTopups}
        />
      </main>
    </div>
  );
}
