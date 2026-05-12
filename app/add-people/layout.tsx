import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Добавить тренера или школу | HockeyMap',
  description: 'Добавь тренера по хоккею, школу или лагерь на HockeyMap. Помоги хоккеистам найти обучение.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
