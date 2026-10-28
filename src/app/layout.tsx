import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miki App Store - เว็บกดของแอพพรี สำหรับลูกค้าและตัวแทน",
  description: "ระบบจำหน่ายและแจกจ่ายแอปพรีเมียมราคาส่ง จัดส่งอัตโนมัติ รวดเร็ว ปลอดภัย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF8] text-[#5C3D2E] pb-24">
        {children}
      </body>
    </html>
  );
}
