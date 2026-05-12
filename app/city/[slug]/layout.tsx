import type { Metadata } from 'next'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const res = await fetch(`${SURL}/rest/v1/cities?slug=eq.${slug}&limit=1`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  const data = await res.json()
  const name = data[0]?.name ?? 'Город'
  return {
    title: `Хоккей в ${name} — магазины, заточка, тренеры | HockeyMap`,
    description: `Хоккейные магазины, заточка коньков, мастерские и тренеры в ${name}. Адреса, телефоны, отзывы на HockeyMap.`,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
