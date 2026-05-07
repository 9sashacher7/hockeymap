'use client'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { use } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [category, setCategory] = useState<any>(null)
  const [places, setPlaces] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [activeCity, setActiveCity] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single()
      const { data: citiesData } = await supabase.from('cities').select('*').order('name')
      setCategory(cat)
      setCities(citiesData || [])
      const { data: placesData } = await supabase
        .from('places')
        .select('*, category:categories(name,slug), city:cities(name,slug)')
        .eq('category_id', cat?.id)
        .order('rating_avg', { ascending: false })
      setPlaces(placesData || [])
    }
    load()
  }, [slug])

  useEffect(() => {
    const filter = async () => {
      if (!category) return
      let query = supabase
        .from('places')
        .select('*, category:categories(name,slug), city:cities(name,slug)')
        .eq('category_id', category.id)
        .order('rating_avg', { ascending: false })
      if (activeCity) query = query.eq('city_id', activeCity.id)
      const { data } = await query
      setPlaces(data || [])
    }
    filter()
  }, [activeCity, category])

  const filtered = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'48px',fontWeight:900,letterSpacing:'2px',margin:'16px 0 8px'}}>
        {category?.name.toUpperCase()}
      </h1>
      <p style={{color:'#94a3b8',marginBottom:'24px'}}>
        {activeCity ? activeCity.name : 'Все города'} · {places.length} мест
      </p>

      <div style={{position:'relative',display:'inline-block',marginBottom:'32px'}}>
        <button
          onClick={() => setOpen(!open)}
          style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:'14px',fontWeight:500,minWidth:'200px',justifyContent:'space-between'}}
        >
          <span>{activeCity ? activeCity.name : 'Все города'}</span>
          <span style={{fontSize:'10px',color:'#94a3b8'}}>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,background:'white',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',zIndex:100,minWidth:'220px'}}>
            <div style={{padding:'8px'}}>
              <input autoFocus placeholder="Поиск города..." value={search} onChange={e => setSearch(e.target.value)}
                style={{width:'100%',padding:'8px 10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{maxHeight:'200px',overflowY:'auto'}}>
              <div onClick={() => { setActiveCity(null); setOpen(false); setSearch('') }}
                style={{padding:'10px 16px',cursor:'pointer',fontSize:'14px',fontWeight:activeCity===null?600:400,background:activeCity===null?'#eff6ff':'white',color:activeCity===null?'#1d4ed8':'#374151'}}>
                Все города
              </div>
              {filtered.map((city: any) => (
                <div key={city.id} onClick={() => { setActiveCity(city); setOpen(false); setSearch('') }}
                  style={{padding:'10px 16px',cursor:'pointer',fontSize:'14px',fontWeight:activeCity?.id===city.id?600:400,background:activeCity?.id===city.id?'#eff6ff':'white',color:activeCity?.id===city.id?'#1d4ed8':'#374151'}}>
                  {city.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {places.map((place: any) => (
          <div key={place.id} onClick={() => setSelected(place)}
            style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px',cursor:'pointer',transition:'border-color 0.2s'}}
            onMouseEnter={e => (e.currentTarget.style.borderColor='#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.borderColor='#e2e8f0')}
          >
            <div style={{width:'44px',height:'44px',borderRadius:'10px',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#1d4ed8',fontSize:'14px',flexShrink:0}}>
              {place.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:'15px'}}>{place.name}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>
                {place.city?.name}{place.address ? ` · ${place.address}` : ''}
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

      {selected && (
        <div onClick={() => setSelected(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e => e.stopPropagation()} style={{background:'white',borderRadius:'16px',padding:'32px',maxWidth:'480px',width:'100%',position:'relative'}}>
            <button onClick={() => setSelected(null)} style={{position:'absolute',top:'16px',right:'16px',border:'none',background:'none',cursor:'pointer',fontSize:'20px',color:'#94a3b8'}}>✕</button>
            <div style={{width:'56px',height:'56px',borderRadius:'12px',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#1d4ed8',fontSize:'18px',marginBottom:'16px'}}>
              {selected.name.slice(0,2).toUpperCase()}
            </div>
            <h2 style={{fontSize:'22px',fontWeight:700,margin:'0 0 4px'}}>{selected.name}</h2>
            <p style={{color:'#64748b',fontSize:'14px',margin:'0 0 20px'}}>{selected.category?.name}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {selected.address && (
                <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                  <span style={{fontSize:'18px'}}>📍</span>
                  <span style={{fontSize:'14px',color:'#374151'}}>{selected.address}</span>
                </div>
              )}
              {selected.phone && (
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <span style={{fontSize:'18px'}}>📞</span>
                  <a href={`tel:${selected.phone}`} style={{fontSize:'14px',color:'#1d4ed8',textDecoration:'none'}}>{selected.phone}</a>
                </div>
              )}
              {selected.city?.name && (
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <span style={{fontSize:'18px'}}>🏙</span>
                  <span style={{fontSize:'14px',color:'#374151'}}>{selected.city.name}</span>
                </div>
              )}
              {selected.rating_avg > 0 && (
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <span style={{fontSize:'18px'}}>⭐</span>
                  <span style={{fontSize:'14px',color:'#374151'}}>{selected.rating_avg} · {selected.rating_count} отзывов</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
