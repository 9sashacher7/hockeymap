import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Поиск хоккейных сервисов | HockeyMap',
  description: 'Найди хоккейный магазин, заточку, тренера или школу по всей России на HockeyMap.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
