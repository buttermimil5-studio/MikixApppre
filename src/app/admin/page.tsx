import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import {
  getAdminDashboardStats,
  getAdminStocks,
  getAdminProducts,
  getAdminUsers,
  getAdminTopupTransactions,
  getStoreSettings,
  getAdminAuditLogs,
  getAdminOrders,
  getBankAccounts,
  getStoreContacts,
  getAdminMusicTracks,
} from '@/lib/actions/adminActions';
import { AdminClient } from './AdminClient';


export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?redirect=/admin');
  }

  const [
    stats,
    stocks,
    products,
    users,
    topups,
    storeSetting,
    auditLogs,
    categories,
    orders,
    bankAccounts,
    storeContacts,
    musicTracks,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getAdminStocks(),
    getAdminProducts(),
    getAdminUsers(),
    getAdminTopupTransactions(),
    getStoreSettings(),
    getAdminAuditLogs(),
    prisma.category.findMany(),
    getAdminOrders(),
    getBankAccounts(),
    getStoreContacts(),
    getAdminMusicTracks(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminClient
          initialStats={stats}
          initialStocks={stocks}
          initialProducts={products}
          initialUsers={users}
          initialTopups={topups}
          initialSettings={storeSetting}
          initialAuditLogs={auditLogs}
          categories={categories}
          initialOrders={orders}
          initialBankAccounts={bankAccounts}
          initialContacts={storeContacts}
          initialMusicTracks={musicTracks}
        />
      </main>
    </div>
  );
}

