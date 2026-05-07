'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [places, setPlaces] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [city, setCity] = useState<any>(null)
  const [selectedCat, setSelectedCat] = useState('all')
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const cities = await sq('cities', `slug=eq.${slug}&limit=1`)
      const c = cities[0]
      if (!c) return
      setCity(c)
      const pl = await sq('places', `city_id=eq.${c.id}&select=*,category:categories(name,slug)&order=is_featured.desc,rating_avg.desc`)
      setPlaces(pl || [])
      const cats = await sq('categories', 'order=name')
      setCategories(cats || [])
    }
    load()
  }, [slug])

  const filtered = selectedCat === 'all' ? places : places.filter((p: any) => p.category?.slug === selectedCat)

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>← Главная</Link>
      <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '2px', margin: '16px 0 4px', textTransform: 'uppercase' }}>
        {city?.name ?? 'Загрузка...'}
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{filtered.length} мест</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button onClick={() => setSelectedCat('all')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', background: selectedCat === 'all' ? '#1d4ed8' : '#f1f5f9', color: selectedCat === 'all' ? 'white' : '#374151' }}>
          Все
        </button>
        {categories.map((c: any) => (
          <button key={c.slug} onClick={() => setSelectedCat(c.slug)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', background: selectedCat === c.slug ? '#1d4ed8' : '#f1f5f9', color: selectedCat === c.slug ? 'white' : '#374151' }}>
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((place: any) => (
          <div key={place.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
            <div onClick={() => setOpenId(openId === place.id ? null : place.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', cursor: 'pointer', background: openId === place.id ? '#f8fafc' : 'white' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1d4ed8', fontSize: '13px', flexShrink: 0 }}>
                {place.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{place.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {place.category?.name}{place.address ? ` · ${place.address}` : ''}
                </div>
              </div>
              {place.rating_avg > 0 && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 600 }}>★ {place.rating_avg}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{place.rating_count} отз.</div>
                </div>
              )}
              <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>{openId === place.id ? '▲' : '▼'}</span>
            </div>
            {openId === place.id && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {place.address && <div style={{ display: 'flex', gap: '10px' }}><span>📍</span><span style={{ fontSize: '14px' }}>{place.address}</span></div>}
                {place.phone && <div style={{ display: 'flex', gap: '10px' }}><span>📞</span><a href={`tel:${place.phone}`} style={{ fontSize: '14px', color: '#1d4ed8', textDecoration: 'none' }}>{place.phone}</a></div>}
                {place.website && <div style={{ display: 'flex', gap: '10px' }}><span>🌐</span><a href={place.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#1d4ed8', textDecoration: 'none' }}>{place.website}</a></div>}
                {place.description && <div style={{ fontSize: '14px', color: '#374151' }}>{place.description}</div>}
                {place.is_verified && <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>✓ Проверено</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && city && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏒</div>
          <p>Мест пока нет</p>
        </div>
      )}
    </main>
  )
}
