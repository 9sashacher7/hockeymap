import type { Metadata } from 'next'

const NAMES: Record<string,string> = {trenery:'Тренеры по хоккею',shkoly:'Хоккейные школы и секции',sbory:'Сборы и лагеря'}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = NAMES[slug] ?? 'Люди и обучение'
  return {
    title: `${name} — найти в России | HockeyMap`,
    description: `${name} по всей России. Контакты, отзывы, цены на HockeyMap.`,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
