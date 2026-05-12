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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
