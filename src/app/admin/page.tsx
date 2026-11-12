import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { getAdminDashboardStats } from '@/lib/actions/adminActions';
import { getAdminInitDataCached } from '@/lib/storeCache';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin');
  }

  const [stats, adminMeta] = await Promise.all([
    getAdminDashboardStats(),
    getAdminInitDataCached(),
  ]);

  const { storeSetting, categories } = adminMeta;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminClient
          initialStats={stats}
          initialSettings={storeSetting}
          categories={categories}
          initialProducts={[]}
        />
      </main>
    </div>
  );
}
