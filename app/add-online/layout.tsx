import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Добавить онлайн сервис | HockeyMap',
  description: 'Добавь хоккейный интернет-магазин или полезный сервис на HockeyMap.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
