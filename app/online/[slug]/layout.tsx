import type { Metadata } from 'next'

const NAMES: Record<string,string> = {baraholki:'Барахолки','internet-magaziny':'Интернет-магазины',statistika:'Статистика и сервисы',avito:'Авито-магазины',poleznoe:'Ещё полезное'}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = NAMES[slug] ?? 'Онлайн сервисы'
  return {
    title: `${name} — хоккейные онлайн сервисы | HockeyMap`,
    description: `${name} для хоккеистов России на HockeyMap.`,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
