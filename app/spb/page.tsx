import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Хоккейные сервисы Санкт-Петербурга — магазины, заточка, тренеры | HockeyMap',
  description: 'Хоккейные магазины, заточка коньков, мастерские и тренеры в Санкт-Петербурге. Адреса, телефоны, отзывы.',
  openGraph: { title: 'Хоккейные сервисы Санкт-Петербурга — магазины, заточка, тренеры | HockeyMap', description: 'Хоккейные магазины, заточка коньков, мастерские и тренеры в Санкт-Петербурге. Адреса, телефоны, отзывы.' }
}

'use client'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = [
  { id: null, name: 'Все' },
  { id: 1, name: 'Магазины' },
  { id: 2, name: 'Заточка коньков' },
  { id: 3, name: 'Мастерские' },
  { id: 4, name: 'Катки и арены' },
]

export default function SpbPage() {
  const [places, setPlaces] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  useEffect(() => {
    const fetchPlaces = async () => {
      let query = supabase
        .from('places')
        .select('*, category:categories(name, slug)')
        .eq('city_id', 2)
        .order('is_featured', { ascending: false })
        .order('rating_avg', { ascending: false })

      if (activeCategory !== null) {
        query = query.eq('category_id', activeCategory)
      }

      const { data } = await query
      setPlaces(data || [])
    }
    fetchPlaces()
  }, [activeCategory])

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'48px',fontWeight:900,letterSpacing:'2px',margin:'16px 0 8px'}}>САНКТ-ПЕТЕРБУРГ</h1>
      <p style={{color:'#94a3b8',marginBottom:'24px'}}>Хоккейные сервисы города</p>

      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'32px'}}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding:'8px 16px',
              borderRadius:'8px',
              border:'1px solid',
              borderColor: activeCategory === cat.id ? '#1d4ed8' : '#e2e8f0',
              background: activeCategory === cat.id ? '#1d4ed8' : 'white',
              color: activeCategory === cat.id ? 'white' : '#374151',
              cursor:'pointer',
              fontSize:'14px',
              fontWeight:500
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {!places || places.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#94a3b8'}}>
          <p>Места не найдены</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {places.map((place: any) => (
            <div key={place.id} style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'10px',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#1d4ed8',fontSize:'14px',flexShrink:0}}>
                {place.name.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'15px'}}>{place.name}</div>
                <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>
                  {place.category?.name}{place.address ? ` · ${place.address}` : ''}
                </div>
              </div>
              {place.rating_avg > 0 && (
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontWeight:600}}>★ {place.rating_avg}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8'}}>{place.rating_count} отз.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
