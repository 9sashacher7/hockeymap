'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY!, Authorization: `Bearer ${SKEY!}` }
  })
  return res.json()
}

export default function TournamentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cities, setCities] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    sq('tournaments', 'select=*,city:cities(name)&order=created_at.desc').then(data => {
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    })
    sq('cities', 'order=name').then(setCities)
  }, [])

  const filtered = items.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    const matchCity = !selectedCity || String(t.city_id) === selectedCity
    return matchSearch && matchCity
  })

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',margin:'16px 0 24px'}}>
        <div>
          <h1 style={{fontSize:'32px',fontWeight:900,margin:'0 0 4px'}}>🏆 Турниры и соревнования</h1>
          <p style={{color:'#64748b',fontSize:'14px',margin:0}}>Хоккейные турниры по всей России</p>
        </div>
        <a href="/add-people" style={{padding:'10px 20px',background:'#1d4ed8',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'14px',fontWeight:600}}>+ Добавить</a>
      </div>

      <div style={{display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap'}}>
        <input placeholder="Поиск турнира..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{flex:1,minWidth:'200px',padding:'12px 16px',borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'15px',outline:'none'}} />
        <select value={selectedCity} onChange={e=>setSelectedCity(e.target.value)}
          style={{padding:'12px 16px',borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
          <option value="">Все города</option>
          {cities.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#94a3b8'}}>Загружаем...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Турниров пока нет</h2>
          <p style={{color:'#94a3b8',marginBottom:'24px'}}>Добавь первым!</p>
          <a href="/add-people" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>+ Добавить турнир</a>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {filtered.map(t => (
            <div key={t.id} style={{border:'1px solid '+(t.is_featured?'#fde68a':t.is_verified?'#bbf7d0':'#e2e8f0'),borderRadius:'14px',padding:'20px',background:'white',borderLeft:'4px solid '+(t.is_featured?'#f59e0b':t.is_verified?'#16a34a':'#e2e8f0')}}>
              <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                <div style={{width:'52px',height:'52px',borderRadius:'12px',background:'#fef9c3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>🏆</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'6px',flexWrap:'wrap'}}>
                    <span style={{fontWeight:800,fontSize:'18px'}}>{t.name}</span>
                    {t.is_verified&&<span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>✓ Проверено</span>}
                    {t.is_featured&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>⭐ Топ</span>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'8px'}}>
                    {t.city&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Город:</span> {t.city.name}</div>}
                    {(t.date_from||t.date_to)&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Даты:</span> {t.date_from}{t.date_to&&t.date_from!==t.date_to?' — '+t.date_to:''}</div>}
                    {t.format&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Формат:</span> {t.format}</div>}
                    {t.age_from&&t.age_to&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Возраст:</span> {t.age_from}–{t.age_to} лет</div>}
                    {t.teams_count&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Команд:</span> {t.teams_count}</div>}
                    {t.price&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Стоимость:</span> {t.price}</div>}
                    {t.address&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Адрес:</span> {t.address}</div>}
                    {t.description&&<div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{t.description}</div>}
                  </div>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {t.phone&&<a href={'tel:'+t.phone} style={{padding:'8px 14px',borderRadius:'10px',border:'none',background:'#0f172a',textDecoration:'none',color:'white',fontSize:'13px',fontWeight:600}}>📞 Позвонить</a>}
                    {t.telegram&&<a href={t.telegram.startsWith('http')?t.telegram:'https://t.me/'+t.telegram.replace('@','')} target="_blank" rel="noreferrer"
                      style={{padding:'8px 14px',borderRadius:'10px',border:'none',background:'#1d4ed8',textDecoration:'none',color:'white',fontSize:'13px',fontWeight:600}}>💬 Написать</a>}
                    {t.website&&<a href={t.website} target="_blank" rel="noreferrer"
                      style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,background:'white'}}>🌐 Сайт</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
