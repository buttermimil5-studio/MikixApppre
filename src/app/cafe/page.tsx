import React from 'react';
import { CafeClient } from './CafeClient';

export const metadata = {
  title: 'Mori Bakery & Cafe (森のベーカリー) - คาเฟ่เบเกอรี่โฮมเมดสไตล์ญี่ปุ่น',
  description: 'ร้านคาเฟ่เบเกอรี่โฮมเมดสไตล์ญี่ปุ่น อบสดใหม่ด้วยเนยสดแท้และนมฮอกไกโดทุกเช้า',
};

export default function CafePage() {
  return <CafeClient />;
}
