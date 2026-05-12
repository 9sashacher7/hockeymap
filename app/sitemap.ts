import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE_URL = 'https://hockeymap.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: cities }, { data: categories }] = await Promise.all([
    supabase.from('cities').select('slug'),
    supabase.from('categories').select('slug'),
  ])

  const staticPages = [
    { url: BASE_URL, priority: 1.0 },
    { url: `${BASE_URL}/add`, priority: 0.7 },
    { url: `${BASE_URL}/add-online`, priority: 0.7 },
    { url: `${BASE_URL}/add-people`, priority: 0.7 },
    { url: `${BASE_URL}/search`, priority: 0.8 },
    { url: `${BASE_URL}/moskva`, priority: 0.9 },
    { url: `${BASE_URL}/spb`, priority: 0.9 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
  ]

  const categoryPages = (categories ?? []).map(c => ({
    url: `${BASE_URL}/category/${c.slug}`,
    priority: 0.9,
  }))

  const cityPages = (cities ?? []).map(c => ({
    url: `${BASE_URL}/city/${c.slug}`,
    priority: 0.8,
  }))

  const onlineSlugs = ['baraholki','internet-magaziny','statistika','avito','poleznoe']
  const onlinePages = onlineSlugs.map(slug => ({
    url: `${BASE_URL}/online/${slug}`,
    priority: 0.8,
  }))

  const peopleSlugs = ['trenery','shkoly','sbory']
  const peoplePages = peopleSlugs.map(slug => ({
    url: `${BASE_URL}/people/${slug}`,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...cityPages, ...onlinePages, ...peoplePages].map(p => ({
    ...p,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }))
}
