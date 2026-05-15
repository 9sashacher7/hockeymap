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

async function sbPost(table, data) {
  const res = await fetch(`${SURL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data)
  })
  return res.ok
}

const CAT_INFO = {
  'trenery':  { name: 'Тренеры', icon: '👤', description: 'Частные тренеры по хоккею', table: 'coaches', idField: 'coach_id' },
  'shkoly':   { name: 'Хоккейные школы и секции', icon: '🎓', description: 'Школы и секции для детей и взрослых', table: 'hockey_schools', idField: 'school_id' },
  'sbory':    { name: 'Сборы и лагеря', icon: '📋', description: 'Хоккейные сборы и летние лагеря', table: 'hockey_camps', idField: 'camp_id' },
}

function getInitials(name) {
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
}

function Avatar({ name, verified }) {
  const colors = ['#1d4ed8','#0891b2','#16a34a','#7c3aed','#dc2626','#d97706']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{width:'56px',height:'56px',borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'18px',flexShrink:0,position:'relative'}}>
      {getInitials(name)}
      {verified && <div style={{position:'absolute',bottom:0,right:0,width:'18px',height:'18px',background:'#16a34a',borderRadius:'50%',border:'2px solid white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px'}}>✓</div>}
    </div>
  )
}

function Stars({ rating, size = 16, interactive = false, onSelect }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{display:'flex',gap:'2px'}}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={()=>interactive&&onSelect&&onSelect(i)}
          onMouseEnter={()=>interactive&&setHover(i)}
          onMouseLeave={()=>interactive&&setHover(0)}
          style={{fontSize:size+'px',cursor:interactive?'pointer':'default',color:(hover||rating)>=i?'#f59e0b':'#e2e8f0'}}>
          ★
        </span>
      ))}
    </div>
  )
}

function ReviewForm({ itemId, idField, onSuccess }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!name || !rating) return
    setLoading(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_name: name, rating, text: text || null, [idField]: itemId })
    })
    const data = await res.json()
    if (data.error) { alert(data.error); setLoading(false); return }
    const ok = res.ok
    if (ok) { setDone(true); onSuccess() }
    setLoading(false)
  }

  if (done) return <div style={{padding:'12px',background:'#f0fdf4',borderRadius:'10px',fontSize:'14px',color:'#16a34a',textAlign:'center'}}>✓ Отзыв опубликован!</div>

  return (
    <div style={{padding:'16px',background:'#f8fafc',borderRadius:'12px',marginTop:'12px'}}>
      <div style={{fontWeight:600,fontSize:'14px',marginBottom:'12px'}}>Оставить отзыв</div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        <input placeholder="Ваше имя *" value={name} onChange={e=>setName(e.target.value)}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}} />
        <div>
          <div style={{fontSize:'12px',color:'#64748b',marginBottom:'6px'}}>Оценка *</div>
          <Stars rating={rating} size={28} interactive onSelect={setRating} />
        </div>
        <textarea placeholder="Комментарий (необязательно)" value={text} onChange={e=>setText(e.target.value)} rows={3}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none',resize:'none'}} />
        <button onClick={submit} disabled={!name||!rating||loading}
          style={{padding:'10px',borderRadius:'10px',border:'none',background:name&&rating?'#1d4ed8':'#e2e8f0',color:name&&rating?'white':'#94a3b8',fontWeight:600,fontSize:'14px',cursor:name&&rating?'pointer':'default'}}>
          {loading?'Отправляем...':'Опубликовать'}
        </button>
      </div>
    </div>
  )
}

function ItemCard({ item, idField, cat }) {
  const [reviews, setReviews] = useState([])
  const [showReviews, setShowReviews] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [reportText, setReportText] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [editDone, setEditDone] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  async function submitEdit() {
    setEditLoading(true)
    // Отправляем только изменённые поля
    const fields = ['name','phone','website','address','description','specialization','experience','price_per_hour','age_from','age_to','dates']
    const changed: any = {}
    fields.forEach(f => {
      if (editForm[f] !== undefined && editForm[f] !== '' && editForm[f] !== String(item[f]||'')) {
        changed[f] = editForm[f]
      }
    })
    await fetch(`${SURL}/rest/v1/people_submissions`, {
      method: 'POST',
      headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        type: 'edit',
        target_id: item.id,
        people_type: idField === 'coach_id' ? 'coach' : idField === 'school_id' ? 'school' : 'camp',
        name: item.name,
        ...changed,
        change_summary: (()=>{
          const labels = {name:'Имя',phone:'Телефон',website:'Сайт',address:'Адрес',description:'Описание',specialization:'Специализация',experience:'Опыт',price_per_hour:'Цена (руб/час)',age_from:'Возраст от',age_to:'Возраст до',dates:'Даты'}
          return Object.entries(changed).map(function(e){
            const label = labels[e[0]]||e[0]
            const oldVal = item[e[0]]||'—'
            return label+': '+oldVal+' → '+e[1]
          }).join(', ')
        })(),
      })
    })
    setEditLoading(false)
    setEditDone(true)
    setShowEdit(false)
  }

  async function submitReport() {
    setReportLoading(true)
    await fetch(`${SURL}/rest/v1/people_submissions`, {
      method: 'POST',
      headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        type: 'report',
        people_type: idField === 'coach_id' ? 'coach' : idField === 'school_id' ? 'school' : 'camp',
        name: item.name,
        description: reportText,
      })
    })
    setReportLoading(false)
    setReportDone(true)
    setShowReport(false)
    setReportText('')
  }

  async function loadReviews() {
    const data = await sq('reviews', `${idField}=eq.${item.id}&is_approved=eq.true&order=created_at.desc`)
    setReviews(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    loadReviews()
    if (typeof window !== 'undefined' && window.location.hash === '#coach-'+item.id) {
      setTimeout(() => {
        document.getElementById('coach-'+item.id)?.scrollIntoView({behavior:'smooth', block:'start'})
      }, 500)
    }
  }, [item.id])

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null

  return (
    <div id={'coach-'+item.id} style={{border:'1px solid '+(item.is_featured?'#fde68a':item.is_verified?'#bbf7d0':'#e2e8f0'),borderRadius:'14px',padding:'20px',background:'white',borderLeft:'4px solid '+(item.is_featured?'#f59e0b':item.is_verified?'#16a34a':'#e2e8f0')}}>
      <div style={{display:'flex',gap:'16px',alignItems:'flex-start'}}>
        <Avatar name={item.name} verified={item.is_verified} />
        <div style={{flex:1}}>
          <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'6px',flexWrap:'wrap'}}>
            <span style={{fontWeight:800,fontSize:'18px'}}>{item.name}</span>
            {item.is_featured&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>⭐ Топ</span>}
            {item.is_verified&&<span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>✓ Проверено</span>}
            {avgRating&&(
              <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                <span style={{color:'#f59e0b',fontSize:'14px'}}>★</span>
                <span style={{fontWeight:700,fontSize:'14px'}}>{avgRating}</span>
                <span style={{fontSize:'12px',color:'#94a3b8'}}>({reviews.length})</span>
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'8px'}}>
            {item.city&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Город:</span> {item.city.name}</div>}
            {item.specialization&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Специализация:</span> {item.specialization}</div>}
            {item.experience&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Опыт:</span> {item.experience}</div>}
            {item.price_per_hour&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Цена:</span> <span style={{fontWeight:800,color:'#1d4ed8'}}>{parseInt(item.price_per_hour).toLocaleString('ru-RU')} руб/час</span></div>}
            {item.age_from&&item.age_to&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Возраст:</span> {item.age_from}–{item.age_to} лет</div>}
            {item.camp_type&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Тип:</span> {({'children':'Детский','adult':'Взрослый','mixed':'Смешанный','amateur':'Любительский','professional':'Профессиональный'})[item.camp_type]||item.camp_type}</div>}
            {item.dates&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Даты:</span> {item.dates}</div>}
            {item.price&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Стоимость:</span> {item.price}</div>}
            {item.address&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Адрес:</span> {item.address}</div>}
            {item.description&&<div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}><span style={{fontWeight:700,color:'#0f172a'}}>О себе:</span> {item.description}</div>}
          </div>

          <div style={{marginTop:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>setShowForm(!showForm)}
                style={{flex:1,padding:'10px',borderRadius:'10px',border:'none',background:showForm?'#1d4ed8':'#1d4ed8',color:'white',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
                {showForm?'Отмена':'+ Оставить отзыв'}
              </button>
              {reviews.length>0&&(
                <button onClick={()=>setShowReviews(!showReviews)}
                  style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',fontSize:'14px',fontWeight:600,cursor:'pointer',color:'#475569'}}>
                  {showReviews?'Скрыть':'Отзывы ('+reviews.length+')'}
                </button>
              )}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{
                  const url = window.location.origin + window.location.pathname + '#coach-' + item.id
                  navigator.clipboard.writeText(url)
                  alert('Ссылка скопирована!')
                }}
                style={{flex:1,padding:'8px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'white',fontSize:'13px',cursor:'pointer',color:'#64748b'}}>
                🔗 Поделиться
              </button>
              <button onClick={()=>{setShowEdit(!showEdit);setShowReport(false)}}
                style={{flex:1,padding:'8px',borderRadius:'10px',border:'1px solid #e2e8f0',background:showEdit?'#f1f5f9':'white',fontSize:'13px',cursor:'pointer',color:'#374151'}}>
                ✏️ Редактировать
              </button>
              <button onClick={()=>{setShowReport(!showReport);setShowEdit(false)}}
                style={{padding:'8px 12px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',fontSize:'13px',cursor:'pointer',color:'#dc2626'}}>
                ⚠️
              </button>
            </div>
          </div>

          {editDone&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',color:'#16a34a',marginTop:'8px'}}>✓ Спасибо! Изменения отправлены на проверку</div>}
          {reportDone&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'10px 14px',fontSize:'13px',color:'#16a34a',marginTop:'8px'}}>✓ Спасибо! Сообщение отправлено</div>}

          {showEdit&&(
            <div style={{background:'#f8fafc',borderRadius:'10px',padding:'14px',border:'1px solid #e2e8f0',marginTop:'8px',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{fontSize:'12px',fontWeight:600,color:'#374151',marginBottom:'4px'}}>Редактировать данные</div>
              {[
                ['name', idField==='coach_id'?'Имя и Фамилия':'Название'],
                ['phone','Телефон'],
                ['telegram','Telegram'],
                ['website','Сайт'],
                ['address','Адрес'],
                ...(idField==='coach_id'?[['specialization','Специализация'],['experience','Опыт'],['price_per_hour','Цена за час (руб)']]: []),
                ...(idField==='school_id'||idField==='camp_id'?[['age_from','Возраст от'],['age_to','Возраст до']]: []),
                ...(idField==='camp_id'?[['dates','Даты проведения']]: []),
                ['description','Описание'],
              ].map(([f,pl])=>(
                <input key={f} placeholder={pl} defaultValue={item[f]||''}
                  onChange={e=>setEditForm(prev=>({...prev,[f]:e.target.value}))}
                  style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',outline:'none',width:'100%',boxSizing:'border-box'}} />
              ))}
              <button onClick={submitEdit} disabled={editLoading}
                style={{padding:'10px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                {editLoading?'Отправляем...':'Отправить на проверку'}
              </button>
            </div>
          )}

          {showReport&&(
            <div style={{background:'#fff7ed',borderRadius:'10px',padding:'14px',border:'1px solid #fed7aa',marginTop:'8px',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{fontSize:'12px',fontWeight:600,color:'#374151'}}>Что не так?</div>
              <textarea placeholder="Опишите ошибку..." value={reportText} onChange={e=>setReportText(e.target.value)} rows={3}
                style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'13px',resize:'none',outline:'none'}} />
              <button onClick={submitReport} disabled={reportLoading||!reportText.trim()}
                style={{padding:'10px',borderRadius:'8px',border:'none',background:reportText.trim()?'#dc2626':'#e2e8f0',color:reportText.trim()?'white':'#94a3b8',fontSize:'13px',fontWeight:600,cursor:reportText.trim()?'pointer':'default'}}>
                {reportLoading?'Отправляем...':'Отправить'}
              </button>
            </div>
          )}

          {showReviews&&reviews.length>0&&(
            <div style={{marginTop:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
              {reviews.map(r=>(
                <div key={r.id} style={{padding:'12px',background:'#f8fafc',borderRadius:'10px'}}>
                  <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'4px'}}>
                    <span style={{fontWeight:600,fontSize:'13px'}}>{r.author_name}</span>
                    <Stars rating={r.rating} size={13} />
                    <span style={{fontSize:'11px',color:'#94a3b8',marginLeft:'auto'}}>{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  {r.text&&<div style={{fontSize:'13px',color:'#475569'}}>{r.text}</div>}
                </div>
              ))}
            </div>
          )}

          {showForm&&<ReviewForm itemId={item.id} idField={idField} onSuccess={()=>{loadReviews();setShowForm(false);setShowReviews(true)}} />}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
          {item.phone&&<a href={'tel:'+item.phone} style={{padding:'10px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center',whiteSpace:'nowrap'}}>📞 Позвонить</a>}
          {item.telegram&&<a href={item.telegram.startsWith('http')?item.telegram:'https://t.me/'+item.telegram.replace('@','')} target="_blank" rel="noreferrer"
            style={{padding:'10px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center',whiteSpace:'nowrap'}}>💬 Написать</a>}
          {item.website&&<a href={item.website} target="_blank" rel="noreferrer"
            style={{padding:'10px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',textDecoration:'none',color:'#0f172a',fontSize:'13px',fontWeight:600,textAlign:'center',whiteSpace:'nowrap'}}>🌐 Сайт</a>}
        </div>
      </div>
    </div>
  )
}

export default function PeopleCategoryPage() {
  const params = useParams()
  const slug = params?.slug
  const cat = CAT_INFO[slug]
  const [items, setItems] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('')
  const [searchName, setSearchName] = useState('')

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
      <h1 style={{fontSize:'24px',fontWeight:700}}>Раздел не найден</h1>
      <Link href="/" style={{color:'#1d4ed8',textDecoration:'none',marginTop:'16px',display:'inline-block'}}>← На главную</Link>
    </main>
  )

  const specs = [...new Set(items.filter(i=>i.specialization).map(i=>i.specialization))]
  const verifiedCount = items.filter(i=>i.is_verified).length
  const cityCount = [...new Set(items.filter(i=>i.city_id).map(i=>i.city_id))].length

  let filtered = items
  if (searchName) filtered = filtered.filter(i => i.name.toLowerCase().includes(searchName.toLowerCase()))
  if (selectedCity) filtered = filtered.filter(i => String(i.city_id) === selectedCity)
  if (selectedSpec) filtered = filtered.filter(i => i.specialization === selectedSpec)
  if (selectedPrice && slug === 'trenery') {
    filtered = filtered.filter(i => {
      const p = parseInt(i.price_per_hour)
      if (!p) return false
      if (selectedPrice === 'low') return p <= 1500
      if (selectedPrice === 'mid') return p > 1500 && p <= 3000
      if (selectedPrice === 'high') return p > 3000
      return true
    })
  }

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <div style={{margin:'24px 0 32px'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>{cat.icon}</div>
        <h1 style={{fontSize:'32px',fontWeight:900,marginBottom:'8px'}}>{cat.name}</h1>
        <p style={{color:'#64748b',fontSize:'15px',marginBottom:'16px'}}>{cat.description}</p>
        {!loading&&items.length>0&&(
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <div style={{background:'#eff6ff',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:800,color:'#1d4ed8'}}>{items.length}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>тренеров</div>
            </div>
            <div style={{background:'#f0fdf4',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:800,color:'#16a34a'}}>{verifiedCount}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>проверено</div>
            </div>
            <div style={{background:'#f8fafc',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:800,color:'#475569'}}>{cityCount}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>городов</div>
            </div>
          </div>
        )}
      </div>

      <div style={{marginBottom:'12px'}}>
        <input placeholder="Поиск по имени тренера..." value={searchName} onChange={e=>setSearchName(e.target.value)}
          style={{width:'100%',padding:'12px 16px',borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'15px',outline:'none',boxSizing:'border-box'}} />
      </div>
      <div style={{display:'flex',gap:'10px',marginBottom:'24px',flexWrap:'wrap',alignItems:'center'}}>
        <select value={selectedCity} onChange={e=>setSelectedCity(e.target.value)}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
          <option value="">Все города</option>
          {cities.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        {slug==='trenery'&&(
          <select value={selectedSpec} onChange={e=>setSelectedSpec(e.target.value)}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Все специализации</option>
            <option value="Вратари">Вратари</option>
            <option value="Защитники">Защитники</option>
            <option value="Нападающие">Нападающие</option>
            <option value="Взрослые">Взрослые</option>
            <option value="Дети">Дети</option>
            <option value="Все возраста">Все возраста</option>
          </select>
        )}
        {slug==='trenery'&&(
          <select value={selectedPrice} onChange={e=>setSelectedPrice(e.target.value)}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Любая цена</option>
            <option value="low">До 1 500 руб/час</option>
            <option value="mid">1 500 — 3 000 руб/час</option>
            <option value="high">От 3 000 руб/час</option>
          </select>
        )}
        <a href="/add-people" style={{padding:'10px 20px',background:'#1d4ed8',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'14px',fontWeight:600,marginLeft:'auto'}}>+ Добавить</a>
      </div>

      {loading ? (
        <div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0'}}>Загрузка...</div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Ничего не найдено</h2>
          <p style={{color:'#94a3b8',marginBottom:'24px'}}>Попробуй изменить фильтры или добавь первым</p>
          <a href="/add-people" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>+ Добавить</a>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {filtered.map(item=>(
            <ItemCard key={item.id} item={item} idField={cat.idField} cat={cat} />
          ))}
        </div>
      )}
    </main>
  )
}
