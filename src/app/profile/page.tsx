import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { getStoreSettingCached } from '@/lib/storeCache';
import { ProfileClient } from './ProfileClient';


export default async function ProfilePage() {
  const [user, storeSetting] = await Promise.all([
    getCurrentUser(),
    getStoreSettingCached(),
  ]);

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // Calculate monthly & all-time stats for the current agent & agent leaderboard
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Group all orders by user for this month to determine agent rankings, plus count all-time orders
  const [totalOrdersCount, monthlyAgentOrders] = await Promise.all([
    prisma.order.count({
      where: { userId: user.id },
    }),
    prisma.order.groupBy({
      by: ['userId'],
      where: {
        purchasedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: { in: ['ACTIVE', 'EXPIRED'] },
      },
      _count: { id: true },
      _sum: { amountPaid: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    }),
  ]);

  const agentIndex = monthlyAgentOrders.findIndex((item) => item.userId === user.id);
  const monthlyRank = agentIndex !== -1 ? agentIndex + 1 : null;
  const monthlyOrdersCount = agentIndex !== -1 ? monthlyAgentOrders[agentIndex]._count.id : 0;
  const monthlySalesAmount = agentIndex !== -1 ? (monthlyAgentOrders[agentIndex]._sum.amountPaid || 0) : 0;
  const totalActiveAgents = monthlyAgentOrders.length;

  const agentStats = {
    creditBalance: user.creditBalance,
    totalOrdersCount,
    monthlyOrdersCount,
    monthlySalesAmount,
    monthlyRank,
    totalActiveAgents,
    monthName: now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
        <ProfileClient user={user} agentStats={agentStats} />
      </main>
    </div>
  );
}
