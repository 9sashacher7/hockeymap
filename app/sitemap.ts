import { MetadataRoute } from 'next'

const BASE_URL = 'https://hockeymap.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  let cities: any[] = []
  let categories: any[] = []
  
  try {
    const [citiesRes, catsRes] = await Promise.all([
      fetch(`${SURL}/rest/v1/cities?select=slug`, { headers: { apikey: SKEY!, Authorization: `Bearer ${SKEY!}` } }),
      fetch(`${SURL}/rest/v1/categories?select=slug`, { headers: { apikey: SKEY!, Authorization: `Bearer ${SKEY!}` } }),
    ])
    cities = await citiesRes.json()
    categories = await catsRes.json()
  } catch(e) {
    console.error('Sitemap fetch error:', e)
  }

  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${BASE_URL}/add`, priority: 0.7 },
    { url: `${BASE_URL}/add-online`, priority: 0.7 },
    { url: `${BASE_URL}/add-people`, priority: 0.7 },
    { url: `${BASE_URL}/search`, priority: 0.8 },
    { url: `${BASE_URL}/moskva`, priority: 0.9 },
    { url: `${BASE_URL}/spb`, priority: 0.9 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
  ]

  const categoryPages = (Array.isArray(categories) ? categories : []).map(c => ({
    url: `${BASE_URL}/category/${c.slug}`,
    priority: 0.9,
  }))

  const cityPages = (Array.isArray(cities) ? cities : []).map(c => ({
    url: `${BASE_URL}/city/${c.slug}`,
    priority: 0.8,
  }))

  const onlineSlugs = ['baraholki','internet-magaziny','statistika','avito','poleznoe']
  const onlinePages = onlineSlugs.map(slug => ({
    url: `${BASE_URL}/online/${slug}`,
    priority: 0.8,
  }))

  const peopleSlugs = ['trenery','shkoly','sbory','turniry']
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
