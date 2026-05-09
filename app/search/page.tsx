'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = use(searchParams)
  const router = useRouter()
  const [query, setQuery] = useState(q ?? '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (q) search(q)
  }, [q])

  async function search(text: string) {
    if (!text.trim()) return
    setLoading(true)
    setSearched(true)
    const data = await sq('places', `select=*,city:cities(name,slug),category:categories(name,slug)&or=(name.ilike.*${encodeURIComponent(text)}*,address.ilike.*${encodeURIComponent(text)}*,description.ilike.*${encodeURIComponent(text)}*)&order=rating_avg.desc&limit=30`)
    setResults(data || [])
    setLoading(false)
  }

  function handleSearch() {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>← Главная</Link>
      <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '16px 0 24px' }}>Поиск</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Например: заточка Москва, хоккейный магазин СПБ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
        />
        <button onClick={handleSearch}
          style={{ padding: '12px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Найти
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Ищем...</div>}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏒</div>
          <p>Ничего не найдено — попробуй другой запрос</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Найдено: {results.length} мест</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((place: any) => (
              <div key={place.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1d4ed8', fontSize: '13px', flexShrink: 0 }}>
                  {place.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{place.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {place.category?.name} · {place.city?.name}{place.address ? ` · ${place.address}` : ''}
                  </div>
                  {place.hours && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>🕐 {place.hours}</div>}
                  {place.phone && <div style={{ fontSize: '12px', marginTop: '2px' }}><a href={`tel:${place.phone}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>📞 {place.phone}</a></div>}
                </div>
                {place.rating_avg > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 600 }}>★ {place.rating_avg}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{place.rating_count} отз.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
