import React from 'react';
import { BakeryLoadingModal } from '@/components/BakeryLoadingModal';

export default function AdminLoading() {
  return <BakeryLoadingModal message="กำลังเปิดระบบจัดการหลังบ้าน..." subMessage="ระบบกำลังเตรียมข้อมูลแดชบอร์ด..." />;
}
