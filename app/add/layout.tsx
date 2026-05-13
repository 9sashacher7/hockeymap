import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Добавить хоккейный магазин или сервис | HockeyMap',
  description: 'Добавь хоккейный магазин, заточку или мастерскую на карту России.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
