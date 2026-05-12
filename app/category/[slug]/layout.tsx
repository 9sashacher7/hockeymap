import type { Metadata } from 'next'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = await fetch(`${SURL}/rest/v1/categories?slug=eq.${slug}&limit=1`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  const cats = await res.json()
  const name = cats[0]?.name ?? 'Сервисы'
  return {
    title: `${name} — хоккейные сервисы России | HockeyMap`,
    description: `${name} для хоккеистов по всей России. Адреса, телефоны, отзывы на HockeyMap.`,
    openGraph: { title: `${name} | HockeyMap`, description: `${name} для хоккеистов на HockeyMap` }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
