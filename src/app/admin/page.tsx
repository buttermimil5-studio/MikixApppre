import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import {
  getAdminDashboardStats,
  getStoreSettings,
} from '@/lib/actions/adminActions';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin');
  }

  // Fast initial load: only load dashboard stats, settings & categories!
  // All other heavy tab data (stocks, orders, users, slips, logs) are loaded on-demand
  // when the admin clicks that tab. This prevents Vercel timeouts and serverless database pooling errors!
  const [stats, storeSetting, categories] = await Promise.all([
    getAdminDashboardStats(),
    getStoreSettings(),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminClient
          initialStats={stats}
          initialSettings={storeSetting}
          categories={categories}
        />
      </main>
    </div>
  );
}
