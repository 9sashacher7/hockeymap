'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function sq(table, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

const CAT_INFO = {
  'trenery':  { name: 'Тренеры', icon: '👤', description: 'Частные тренеры по хоккею', table: 'coaches' },
  'shkoly':   { name: 'Хоккейные школы и секции', icon: '🎓', description: 'Школы и секции для детей и взрослых', table: 'hockey_schools' },
  'sbory':    { name: 'Сборы и лагеря', icon: '📋', description: 'Хоккейные сборы и летние лагеря', table: 'hockey_camps' },
}

export default function PeopleCategoryPage() {
  const params = useParams()
  const slug = params?.slug
  const cat = CAT_INFO[slug]
  const [items, setItems] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    if (!cat) return
    Promise.all([
      sq(cat.table, 'order=is_featured.desc,created_at.desc&select=*,city:cities(name)'),
      sq('cities', 'order=name'),
    ]).then(([data, cityList]) => {
      setItems(Array.isArray(data) ? data : [])
      setCities(Array.isArray(cityList) ? cityList : [])
      setLoading(false)
    })
  }, [slug])

  if (!cat) return (
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'80px 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h1 style={{fontSize:'24px',fontWeight:700}}>Раздел не найден</h1>
      <Link href="/" style={{color:'#1d4ed8',textDecoration:'none',marginTop:'16px',display:'inline-block'}}>← На главную</Link>
    </main>
  )

  const filtered = selectedCity ? items.filter(i => String(i.city_id) === selectedCity) : items

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <div style={{margin:'24px 0 32px'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>{cat.icon}</div>
        <h1 style={{fontSize:'32px',fontWeight:900,marginBottom:'8px'}}>{cat.name}</h1>
        <p style={{color:'#64748b',fontSize:'15px'}}>{cat.description}</p>
      </div>

      <div style={{display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap',alignItems:'center'}}>
        <select value={selectedCity} onChange={e=>setSelectedCity(e.target.value)}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
          <option value="">Все города</option>
          {cities.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <a href="/add-people" style={{padding:'10px 20px',background:'#1d4ed8',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'14px',fontWeight:600}}>
          + Добавить
        </a>
      </div>

      {loading ? (
        <div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0'}}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚧</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Скоро здесь появятся записи</h2>
          <p style={{color:'#94a3b8',fontSize:'14px',marginBottom:'24px'}}>Станьте первым кто добавит информацию</p>
          <a href="/add-people" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>+ Добавить</a>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {filtered.map(item=>(
            <div key={item.id} style={{border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',background:'white'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:'8px',marginBottom:'8px',flexWrap:'wrap',alignItems:'center'}}>
                    <span style={{fontWeight:700,fontSize:'18px'}}>{item.name}</span>
                    {item.is_verified&&<span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>✓ Проверено</span>}
                    {item.is_featured&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>⭐ Топ</span>}
                  </div>
                  {item.city&&<div style={{fontSize:'13px',color:'#64748b',marginBottom:'8px'}}>📍 {item.city.name}</div>}
                  <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                    {item.specialization&&<span>🎯 {item.specialization}</span>}
                    {item.experience&&<span>📅 Опыт: {item.experience}</span>}
                    {item.age_from&&item.age_to&&<span>👶 Возраст: {item.age_from}–{item.age_to} лет</span>}
                    {item.camp_type&&<span>🏕 Тип: {item.camp_type}</span>}
                    {item.dates&&<span>📆 {item.dates}</span>}
                    {item.address&&<span>🏠 {item.address}</span>}
                    {item.description&&<span style={{marginTop:'4px',color:'#475569'}}>{item.description}</span>}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
                  {item.phone&&<a href={`tel:${item.phone}`} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center'}}>📞 Позвонить</a>}
                  {item.telegram&&<a href={item.telegram.startsWith('http')?item.telegram:`https://t.me/${item.telegram.replace('@','')}`} target="_blank" rel="noreferrer"
                    style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center'}}>💬 Написать</a>}
                  {item.website&&<a href={item.website} target="_blank" rel="noreferrer"
                    style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center'}}>🌐 Сайт</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
