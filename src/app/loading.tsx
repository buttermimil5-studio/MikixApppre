import React from 'react';
import { BakeryLoadingModal } from '@/components/BakeryLoadingModal';

export default function Loading() {
  return <BakeryLoadingModal message="กำลังโหลดหน้าเว็บ..." subMessage="กรุณารอสักครู่นะคะ~" />;
}
