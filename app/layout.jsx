import "./globals.css";

export const metadata = {
  title: "PixAI — چت هوش مصنوعی",
  description: "گفت‌وگوی آنلاین با هوش مصنوعی در PixAI"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
