import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixAI — گفت‌وگوی هوشمند",
  description: "چت هوش مصنوعی آنلاین PixAI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
