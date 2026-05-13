import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HockeyMap — навигатор хоккейных сервисов России",
  description: "Найди хоккейный магазин, заточку коньков, мастерскую, тренера или школу в своём городе. Все хоккейные сервисы России на одном сайте.",
  keywords: "хоккейный магазин, заточка коньков, хоккейная мастерская, тренер по хоккею, хоккейная школа",
  openGraph: {
    title: "HockeyMap — навигатор хоккейных сервисов России",
    description: "Магазины, заточки, мастерские, тренеры — найди нужное в своём городе",
    siteName: "HockeyMap",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer style={{borderTop:'1px solid #e2e8f0',padding:'20px',textAlign:'center',fontSize:'13px',color:'#94a3b8',marginTop:'auto'}}>
          <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap',alignItems:'center'}}>
            <span>© 2026 HockeyMap</span>
            <a href="/privacy" style={{color:'#64748b',textDecoration:'none'}}>Политика конфиденциальности</a>
            <a href="/contact" style={{color:'#64748b',textDecoration:'none'}}>Написать нам</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
