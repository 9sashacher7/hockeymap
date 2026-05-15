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

async function postReview(placeId: number, name: string, rating: number, text: string) {
  await fetch(`${SURL}/rest/v1/reviews`, {
    method: 'POST',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ place_id: placeId, author_name: name, rating, text, is_approved: false })
  })
}

function ReviewForm({ placeId, onSubmit }: { placeId: number, onSubmit: () => void }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setLoading(true)
    await postReview(placeId, name, rating, text)
    setLoading(false)
    setDone(true)
    onSubmit()
  }

  if (done) return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#16a34a', textAlign: 'center' }}>
      ✓ Спасибо за отзыв!
    </div>
  )

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '10px' }}>Оставить отзыв</div>
      <input placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} onClick={() => setRating(i)} style={{ fontSize: '22px', cursor: 'pointer', color: i <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
        ))}
      </div>
      <textarea placeholder="Расскажите об опыте..." value={text} onChange={e => setText(e.target.value)} rows={3}
        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '8px', resize: 'none', boxSizing: 'border-box' }} />
      <button onClick={handleSubmit} disabled={loading || !name.trim()}
        style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: name.trim() ? '#1d4ed8' : '#e2e8f0', color: name.trim() ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: name.trim() ? 'pointer' : 'default' }}>
        {loading ? 'Отправляем...' : 'Отправить'}
      </button>
    </div>
  )
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [places, setPlaces] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [category, setCategory] = useState<any>(null)
  const [selectedCity, setSelectedCity] = useState('all')
  const [openId, setOpenId] = useState<number | null>(null)
  const [reviews, setReviews] = useState<Record<number, any[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [editId, setEditId] = useState<number|null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editDone, setEditDone] = useState<number|null>(null)
  const [reportId, setReportId] = useState<number|null>(null)
  const [reportText, setReportText] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportDone, setReportDone] = useState<number|null>(null)

  useEffect(() => {
    async function load() {
      const cats = await sq('categories', `slug=eq.${slug}&limit=1`)
      const cat = cats[0]
      if (!cat) return
      setCategory(cat)
      const pl = await sq('places', `category_id=eq.${cat.id}&select=*,city:cities(name,slug)&order=is_featured.desc,rating_avg.desc`)
      setPlaces(pl || [])
      const ct = await sq('cities', 'order=name')
      setCities(ct || [])
    }
    load()
  }, [slug])

  async function loadReviews(placeId: number) {
    const data = await sq('reviews', `place_id=eq.${placeId}&is_approved=eq.true&order=created_at.desc&limit=10`)
    setReviews(prev => ({ ...prev, [placeId]: data || [] }))
  }

  function handleOpen(placeId: number) {
    if (openId === placeId) { setOpenId(null) }
    else { setOpenId(placeId); loadReviews(placeId) }
  }

  async function submitEdit(place: any) {
    setEditLoading(true)
    await fetch(`${SURL}/rest/v1/submissions`, {
      method: 'POST',
      headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        type: 'edit', place_id: place.id,
        name: editForm.name || place.name,
        address: editForm.address ?? place.address,
        phone: editForm.phone ?? place.phone,
        website: editForm.website ?? place.website,
        hours: editForm.hours ?? place.hours,
        description: editForm.description ?? place.description,
        category_id: place.category_id,
        city_id: place.city?.id || null,
      })
    })
    setEditLoading(false)
    setEditDone(place.id)
    setEditId(null)
  }

  async function submitReport(place: any) {
    setReportLoading(true)
    await fetch(`${SURL}/rest/v1/submissions`, {
      method: 'POST',
      headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        type: 'report', place_id: place.id,
        name: place.name, category_id: place.category_id, city_id: place.city?.id || null,
        description: reportText,
      })
    })
    setReportLoading(false)
    setReportDone(place.id)
    setReportId(null)
    setReportText('')
  }

  function yandexNavUrl(place: any) {
    if (place.latitude && place.longitude) {
      return `yandexnavi://map_search?text=${encodeURIComponent(place.name)}&ll=${place.longitude},${place.latitude}&z=16`
    }
    if (place.address) {
      return `https://yandex.ru/maps/?text=${encodeURIComponent(place.address + ' ' + (place.city?.name ?? ''))}`
    }
    return null
  }

  const filtered = places.filter((p: any) => {
    const matchesCity = selectedCity === 'all' || p.city?.slug === selectedCity
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || p.name?.toLowerCase().includes(q) || (p.address ?? '').toLowerCase().includes(q)
    return matchesCity && matchesSearch
  })

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>← Главная</Link>
      <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '2px', margin: '16px 0 4px', textTransform: 'uppercase' }}>
        {category?.name ?? 'Загрузка...'}
      </h1>
        <a href="/add" style={{display:"inline-block",marginTop:"12px",marginBottom:"8px",padding:"10px 22px",background:"#1d4ed8",color:"white",borderRadius:"12px",textDecoration:"none",fontWeight:600,fontSize:"14px"}}>+ Добавить место</a>
      <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{filtered.length} мест</p>
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'16px'}}>
        <div style={{background:'#eff6ff',borderRadius:'10px',padding:'8px 16px',textAlign:'center'}}>
          <div style={{fontSize:'20px',fontWeight:800,color:'#1d4ed8'}}>{places.length}</div>
          <div style={{fontSize:'12px',color:'#64748b'}}>всего</div>
        </div>
          <div style={{background:'#f8fafc',borderRadius:'10px',padding:'8px 16px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:800,color:'#475569'}}>{[...new Set(places.filter((p:any)=>p.city).map((p:any)=>p.city?.name))].length}</div>
            <div style={{fontSize:'12px',color:'#64748b'}}>городов</div>
          </div>
      </div>
      <div style={{marginBottom:'16px'}}>
        <input placeholder="Поиск по названию..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
          style={{width:'100%',padding:'12px 16px',borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'15px',outline:'none',boxSizing:'border-box'}} />
      </div>

      <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', marginBottom: '24px', width: '220px' }}>
        <option value="all">Все города</option>
        {cities.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
      </select>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {filtered.map((place: any) => {
          const navUrl = yandexNavUrl(place)
          return (
            <div key={place.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
              <div onClick={() => handleOpen(place.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px', cursor: 'pointer', background: openId === place.id ? '#f8fafc' : 'white' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1d4ed8', fontSize: '15px', flexShrink: 0 }}>
                  {place.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{place.name}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                    {place.city?.name}{place.address ? ` · ${place.address}` : ''}
                  </div>
                  {(place.is_top || place.is_popular || place.is_network) && (
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginTop:'4px'}}>
                      {place.is_top && <span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'1px 6px',fontSize:'10px',fontWeight:700}}>🏆 Топ</span>}
                      {place.is_popular && <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'1px 6px',fontSize:'10px',fontWeight:700}}>👥 Популярный</span>}
                      {place.is_network && <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:'6px',padding:'1px 6px',fontSize:'10px',fontWeight:700}}>🏙️ Сеть</span>}
                    </div>
                  )}
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
                <div style={{ borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {place.address && <div style={{ display: 'flex', gap: '10px' }}><span>📍</span><span style={{ fontSize: '14px' }}>{place.address}</span></div>}
                    {place.hours && <div style={{ display: 'flex', gap: '10px' }}><span>🕐</span><span style={{ fontSize: '14px', color: '#374151' }}>{place.hours}</span></div>}
                    {place.phone && <div style={{ display: 'flex', gap: '10px' }}><span>📞</span><a href={`tel:${place.phone}`} style={{ fontSize: '14px', color: '#1d4ed8', textDecoration: 'none' }}>{place.phone}</a></div>}
                    {place.website && <div style={{ display: 'flex', gap: '10px' }}><span>🌐</span><a href={place.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#1d4ed8', textDecoration: 'none' }}>{place.website}</a></div>}
                    {place.description && <div style={{ fontSize: '14px', color: '#374151' }}>{place.description}</div>}
                    {place.is_verified && <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>✓ Проверено</div>}
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'4px'}}>
                      {place.is_top && <span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>🏆 Топ магазин</span>}
                      {place.is_popular && <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>👥 Популярный</span>}
                      {place.is_network && <span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>🏙️ Сеть магазинов</span>}
                    </div>
                    {navUrl && (
                      <a href={navUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#1d4ed8', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, justifyContent: 'center' }}>
                        🗺️ Как проехать
                      </a>
                    )}

                    <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                      <button onClick={()=>{setEditId(editId===place.id?null:place.id);setEditForm({});setReportId(null)}}
                        style={{flex:1,padding:'9px',borderRadius:'10px',border:'1px solid #e2e8f0',background:editId===place.id?'#f1f5f9':'white',fontSize:'13px',fontWeight:600,cursor:'pointer',color:'#374151'}}>
                        ✏️ Редактировать
                      </button>
                      <button onClick={()=>{setReportId(reportId===place.id?null:place.id);setReportText('');setEditId(null)}}
                        style={{padding:'9px 14px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',fontSize:'13px',cursor:'pointer',color:'#dc2626'}}>
                        ⚠️
                      </button>
                    </div>

                    {editDone===place.id&&(
                      <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'12px',fontSize:'13px',color:'#16a34a',textAlign:'center'}}>
                        ✓ Спасибо! Изменения отправлены на проверку
                      </div>
                    )}

                    {editId===place.id&&(
                      <div style={{background:'#f8fafc',borderRadius:'10px',padding:'14px',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{fontSize:'12px',fontWeight:600,color:'#374151',marginBottom:'4px'}}>Редактировать данные</div>
                        {[['name','Название'],['address','Адрес'],['phone','Телефон'],['website','Сайт'],['hours','Часы работы'],['description','Описание']].map(([f,pl])=>(
                          <input key={f} placeholder={pl} defaultValue={place[f]||''}
                            onChange={e=>setEditForm((prev:any)=>({...prev,[f]:e.target.value}))}
                            style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',outline:'none'}} />
                        ))}
                        <button onClick={()=>submitEdit(place)} disabled={editLoading}
                          style={{padding:'10px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                          {editLoading?'Отправляем...':'Отправить на проверку'}
                        </button>
                      </div>
                    )}

                    {reportDone===place.id&&(
                      <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'12px',fontSize:'13px',color:'#16a34a',textAlign:'center'}}>
                        ✓ Спасибо! Сообщение отправлено
                      </div>
                    )}

                    {reportId===place.id&&(
                      <div style={{background:'#fff7ed',borderRadius:'10px',padding:'14px',border:'1px solid #fed7aa',display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{fontSize:'12px',fontWeight:600,color:'#374151'}}>Что не так?</div>
                        <textarea placeholder="Опишите ошибку..." value={reportText} onChange={e=>setReportText(e.target.value)} rows={3}
                          style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',resize:'none',outline:'none'}} />
                        <button onClick={()=>submitReport(place)} disabled={reportLoading||!reportText.trim()}
                          style={{padding:'10px',borderRadius:'8px',border:'none',background:reportText.trim()?'#dc2626':'#e2e8f0',color:reportText.trim()?'white':'#94a3b8',fontSize:'13px',fontWeight:600,cursor:reportText.trim()?'pointer':'default'}}>
                          {reportLoading?'Отправляем...':'Отправить'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
                      Отзывы {reviews[place.id] ? `(${reviews[place.id].length})` : ''}
                    </div>
                    {!reviews[place.id] ? (
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Загрузка...</div>
                    ) : reviews[place.id].length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Отзывов пока нет — будь первым!</div>
                    ) : (
                      reviews[place.id].map((r: any) => (
                        <div key={r.id} style={{ background: 'white', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.author_name}</span>
                            <span style={{ color: '#f59e0b', fontSize: '13px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          </div>
                          {r.text && <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{r.text}</p>}
                        </div>
                      ))
                    )}
                    <ReviewForm placeId={place.id} onSubmit={() => loadReviews(place.id)} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && category && (
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚧</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Скоро здесь появятся места</h2>
          <p style={{color:'#94a3b8',marginBottom:'24px'}}>Мы собираем лучшие ресурсы для хоккеистов и хоккейного сообщества</p>
          <a href="/add" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>+ Добавить место</a>
        </div>
      )}
    </main>
  )
}
