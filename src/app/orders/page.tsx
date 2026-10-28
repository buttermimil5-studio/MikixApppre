import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { getUserOrdersAction } from '@/lib/actions/purchaseActions';
import { OrdersClient } from './OrdersClient';


export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/orders');
  }

  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: 'default' },
  });

  const ordersRes = await getUserOrdersAction();
  const orders = ordersRes.orders || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <OrdersClient orders={orders} />
      </main>
    </div>
  );
}
