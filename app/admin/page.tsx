'use client'
import { useState } from 'react'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ADMIN_PASSWORD = 'hockey2025'

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
async function sbPatch(table, id, data) {
  const res = await fetch(`${SURL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data)
  })
  return res.ok
}
async function sbDelete(table, id) {
  const res = await fetch(`${SURL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.ok
}
function slugify(str) {
  return str.toLowerCase()
    .replace(/[а-яё]/g, c => ({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[c] || c))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '')
}

const ONLINE_CATS = [
  { slug: 'baraholki', name: 'Барахолки' },
  { slug: 'internet-magaziny', name: 'Интернет-магазины' },
  { slug: 'statistika', name: 'Статистика и сервисы' },
  { slug: 'avito', name: 'Авито-магазины' },
  { slug: 'poleznoe', name: 'Ещё полезное' },
]

const inp = {padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none',boxSizing:'border-box'}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('offline')
  const [topTab, setTopTab] = useState('offline')
  const [verifiedTab, setVerifiedTab] = useState('online')
  const [verifiedCat, setVerifiedCat] = useState('')
  const [verifiedPeopleType, setVerifiedPeopleType] = useState('coach')
  const [submissions, setSubmissions] = useState([])
  const [onlineSubmissions, setOnlineSubmissions] = useState([])
  const [peopleSubmissions, setPeopleSubmissions] = useState([])
  const [allPlaces, setAllPlaces] = useState([])
  const [allServices, setAllServices] = useState([])
  const [allCoaches, setAllCoaches] = useState([])
  const [allSchools, setAllSchools] = useState([])
  const [allCamps, setAllCamps] = useState([])
  const [history, setHistory] = useState([])
  const [reviews, setReviews] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [offCat, setOffCat] = useState('')
  const [offSearch, setOffSearch] = useState('')
  const [offSelected, setOffSelected] = useState(null)
  const [offFrom, setOffFrom] = useState('')
  const [offUntil, setOffUntil] = useState('')
  const [offPrice, setOffPrice] = useState('')
  const [offNotes, setOffNotes] = useState('')
  const [onCat, setOnCat] = useState('')
  const [onSearch, setOnSearch] = useState('')
  const [onSelected, setOnSelected] = useState(null)
  const [onFrom, setOnFrom] = useState('')
  const [onUntil, setOnUntil] = useState('')
  const [onPrice, setOnPrice] = useState('')
  const [onNotes, setOnNotes] = useState('')
  const [peopleType, setPeopleType] = useState('')
  const [peopleSearch, setPeopleSearch] = useState('')
  const [peopleSelected, setPeopleSelected] = useState(null)
  const [peopleFrom, setPeopleFrom] = useState('')
  const [peopleUntil, setPeopleUntil] = useState('')
  const [peoplePrice, setPeoplePrice] = useState('')
  const [peopleNotes, setPeopleNotes] = useState('')

  async function loadData() {
    const [subs, onlineSubs, peopleSubs, cityList, catList, places, services, coaches, schools, camps, hist, revs] = await Promise.all([
      sq('submissions', 'order=created_at.desc'),
      sq('online_submissions', 'order=created_at.desc'),
      sq('people_submissions', 'order=created_at.desc'),
      sq('cities', 'order=name'),
      sq('categories', 'order=name'),
      sq('places', 'select=id,name,city_id,category_id,featured_until,featured_from&order=name'),
      sq('online_services', 'select=id,name,category_slug,featured_until,featured_from,is_verified&order=name'),
      sq('coaches', 'select=id,name,city_id,featured_until,featured_from,is_verified&order=name'),
      sq('hockey_schools', 'select=id,name,city_id,featured_until,featured_from,is_verified&order=name'),
      sq('hockey_camps', 'select=id,name,city_id,featured_until,featured_from,is_verified&order=name'),
      sq('featured_history', 'order=created_at.desc&limit=50'),
      sq('reviews', 'select=id,author_name,rating,text,created_at,place_id,place:places(name)&order=created_at.desc'),
    ])
    setSubmissions(Array.isArray(subs) ? subs : [])
    setOnlineSubmissions(Array.isArray(onlineSubs) ? onlineSubs : [])
    setPeopleSubmissions(Array.isArray(peopleSubs) ? peopleSubs : [])
    setCities(Array.isArray(cityList) ? cityList : [])
    setCategories(Array.isArray(catList) ? catList : [])
    setAllPlaces(Array.isArray(places) ? places : [])
    setAllServices(Array.isArray(services) ? services : [])
    setAllCoaches(Array.isArray(coaches) ? coaches : [])
    setAllSchools(Array.isArray(schools) ? schools : [])
    setAllCamps(Array.isArray(camps) ? camps : [])
    setHistory(Array.isArray(hist) ? hist : [])
    setReviews(Array.isArray(revs) ? revs : [])
  }

  function login() {
    if (password === ADMIN_PASSWORD) { setAuth(true); loadData() }
    else setMessage('Неверный пароль')
  }

  const getCityName = id => cities.find(c => c.id === id)?.name || ''
  const getCatName = id => categories.find(c => c.id === id)?.name || ''

  async function approve(sub) {
    setLoading(true)
    let cityId = sub.city_id
    if (!cityId && sub.custom_city) {
      const slug = slugify(sub.custom_city)
      const cityRes = await fetch(`${SURL}/rest/v1/cities`, {
        method: 'POST',
        headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ name: sub.custom_city, slug })
      })
      const cityData = await cityRes.json()
      cityId = Array.isArray(cityData) ? cityData[0]?.id : cityData?.id
    }
    const ok = await sbPost('places', {
      name: sub.name, slug: slugify(sub.name) + '-' + sub.id,
      city_id: cityId, category_id: sub.category_id,
      address: sub.address||null, phone: sub.phone||null, website: sub.website||null,
      hours: sub.hours?{info:sub.hours}:null, description: sub.description||null,
      is_online: false, is_verified: true, is_featured: false, rating_avg: 0, rating_count: 0,
    })
    if (ok) { await sbDelete('submissions', sub.id); setMessage('Место добавлено'); loadData() }
    else setMessage('Ошибка')
    setLoading(false)
  }

  async function approveOnline(sub) {
    setLoading(true)
    const ok = await sbPost('online_services', {
      name: sub.name, type: 'other', url: sub.url||null,
      description: sub.description||null, category_slug: sub.category_slug||null,
      is_verified: false, is_featured: false, subscribers_count: null,
    })
    if (ok) { await sbDelete('online_submissions', sub.id); setMessage('Сервис добавлен'); loadData() }
    else setMessage('Ошибка')
    setLoading(false)
  }

  async function approvePeople(sub) {
    setLoading(true)
    let cityId = sub.city_id
    if (!cityId && sub.custom_city) {
      const slug = slugify(sub.custom_city)
      const cityRes = await fetch(`${SURL}/rest/v1/cities`, {
        method: 'POST',
        headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ name: sub.custom_city, slug })
      })
      const cityData = await cityRes.json()
      cityId = Array.isArray(cityData) ? cityData[0]?.id : cityData?.id
    }
    const slug = slugify(sub.name) + '-' + sub.id
    let table = 'coaches'
    let data = { name: sub.name, slug, city_id: cityId, specialization: sub.specialization||null, experience: sub.experience||null, phone: sub.phone||null, telegram: sub.telegram||null, description: sub.description||null, is_verified: true, is_featured: false }
    if (sub.type === 'school') {
      table = 'hockey_schools'
      data = { name: sub.name, slug, city_id: cityId, age_from: sub.age_from||null, age_to: sub.age_to||null, phone: sub.phone||null, website: sub.website||null, address: sub.address||null, description: sub.description||null, is_verified: true, is_featured: false }
    } else if (sub.type === 'camp') {
      table = 'hockey_camps'
      data = { name: sub.name, slug, city_id: cityId, age_from: sub.age_from||null, age_to: sub.age_to||null, camp_type: sub.camp_type||null, dates: sub.dates||null, phone: sub.phone||null, website: sub.website||null, description: sub.description||null, is_verified: true, is_featured: false }
    }
    const ok = await sbPost(table, data)
    if (ok) { await sbDelete('people_submissions', sub.id); setMessage('Добавлено'); loadData() }
    else setMessage('Ошибка')
    setLoading(false)
  }

  async function reject(sub, table = 'submissions') {
    if (!confirm('Удалить?')) return
    setLoading(true)
    await sbDelete(table, sub.id)
    setMessage('Удалено'); loadData(); setLoading(false)
  }

  async function deleteReview(r) {
    if (!confirm('Удалить отзыв?')) return
    setLoading(true)
    await sbDelete('reviews', r.id)
    setReviews(prev => prev.filter(x => x.id !== r.id))
    setMessage('Отзыв удалён'); setLoading(false)
  }

  async function toggleVerified(s) {
    const newVal = !s.is_verified
    setAllServices(prev => prev.map(x => x.id===s.id ? {...x, is_verified:newVal} : x))
    await sbPatch('online_services', s.id, { is_verified: newVal })
    setMessage(newVal ? 'Плашка выставлена' : 'Плашка снята')
  }

  async function toggleVerifiedPeople(item, type) {
    const newVal = !item.is_verified
    const table = type==='coach'?'coaches':type==='school'?'hockey_schools':'hockey_camps'
    if (type==='coach') setAllCoaches(prev => prev.map(x => x.id===item.id ? {...x, is_verified:newVal} : x))
    else if (type==='school') setAllSchools(prev => prev.map(x => x.id===item.id ? {...x, is_verified:newVal} : x))
    else setAllCamps(prev => prev.map(x => x.id===item.id ? {...x, is_verified:newVal} : x))
    await sbPatch(table, item.id, { is_verified: newVal })
    setMessage(newVal ? 'Плашка выставлена' : 'Плашка снята')
  }

  async function doSetFeaturedPlace() {
    if (!offSelected || !offUntil) return
    const inCat = allPlaces.filter(p => p.category_id===offSelected.category_id && p.featured_until && new Date(p.featured_until)>new Date() && p.id!==offSelected.id)
    if (inCat.length >= 3) { setMessage('В этой категории уже 3 места в топе'); return }
    setLoading(true)
    const from = offFrom || new Date().toISOString().split('T')[0]
    const ok = await sbPatch('places', offSelected.id, { featured_from: from, featured_until: offUntil, is_featured: true })
    if (ok) {
      await sbPost('featured_history', { place_id: offSelected.id, place_name: offSelected.name, category_name: getCatName(offSelected.category_id), featured_from: from, featured_until: offUntil, price: parseFloat(offPrice)||0, notes: offNotes||null })
      setMessage('Поднято в топ')
      setOffSelected(null); setOffSearch(''); setOffFrom(''); setOffUntil(''); setOffPrice(''); setOffNotes(''); loadData()
    } else setMessage('Ошибка')
    setLoading(false)
  }

  async function doSetFeaturedService() {
    if (!onSelected || !onUntil) return
    const inCat = allServices.filter(s => s.category_slug===onSelected.category_slug && s.featured_until && new Date(s.featured_until)>new Date() && s.id!==onSelected.id)
    if (inCat.length >= 3) { setMessage('В этой категории уже 3 сервиса в топе'); return }
    setLoading(true)
    const from = onFrom || new Date().toISOString().split('T')[0]
    const ok = await sbPatch('online_services', onSelected.id, { featured_from: from, featured_until: onUntil, is_featured: true })
    if (ok) {
      await sbPost('featured_history', { online_service_id: onSelected.id, place_name: onSelected.name, category_name: onSelected.category_slug, featured_from: from, featured_until: onUntil, price: parseFloat(onPrice)||0, notes: onNotes||null })
      setMessage('Поднято в топ')
      setOnSelected(null); setOnSearch(''); setOnFrom(''); setOnUntil(''); setOnPrice(''); setOnNotes(''); loadData()
    } else setMessage('Ошибка')
    setLoading(false)
  }

  async function doSetFeaturedPeople() {
    if (!peopleSelected || !peopleUntil || !peopleType) return
    setLoading(true)
    const table = peopleType==='coach'?'coaches':peopleType==='school'?'hockey_schools':'hockey_camps'
    const from = peopleFrom || new Date().toISOString().split('T')[0]
    const ok = await sbPatch(table, peopleSelected.id, { featured_from: from, featured_until: peopleUntil, is_featured: true })
    if (ok) {
      await sbPost('featured_history', { place_name: peopleSelected.name, category_name: peopleType==='coach'?'Тренер':peopleType==='school'?'Школа':'Лагерь', featured_from: from, featured_until: peopleUntil, price: parseFloat(peoplePrice)||0, notes: peopleNotes||null })
      setMessage('Поднято в топ')
      setPeopleSelected(null); setPeopleSearch(''); setPeopleFrom(''); setPeopleUntil(''); setPeoplePrice(''); setPeopleNotes(''); loadData()
    } else setMessage('Ошибка')
    setLoading(false)
  }

  async function removeFeaturedPlace(id) {
    setLoading(true)
    await sbPatch('places', id, { featured_until: null, featured_from: null, is_featured: false })
    setMessage('Убрано из топа'); loadData(); setLoading(false)
  }

  async function removeFeaturedService(id) {
    setLoading(true)
    await sbPatch('online_services', id, { featured_until: null, featured_from: null, is_featured: false })
    setMessage('Убрано из топа'); loadData(); setLoading(false)
  }

  async function removeFeaturedPeople(id, type) {
    setLoading(true)
    const table = type==='coach'?'coaches':type==='school'?'hockey_schools':'hockey_camps'
    await sbPatch(table, id, { featured_until: null, featured_from: null, is_featured: false })
    setMessage('Убрано из топа'); loadData(); setLoading(false)
  }

  const offFiltered = allPlaces.filter(p => (!offCat||String(p.category_id)===offCat) && (!offSearch||p.name.toLowerCase().includes(offSearch.toLowerCase()))).slice(0,10)
  const offFeatured = allPlaces.filter(p => (!offCat||String(p.category_id)===offCat) && p.featured_until && new Date(p.featured_until)>new Date())
  const onFiltered = allServices.filter(s => (!onCat||s.category_slug===onCat) && (!onSearch||s.name.toLowerCase().includes(onSearch.toLowerCase()))).slice(0,10)
  const onFeatured = allServices.filter(s => (!onCat||s.category_slug===onCat) && s.featured_until && new Date(s.featured_until)>new Date())
  const peopleItems = peopleType==='coach' ? allCoaches : peopleType==='school' ? allSchools : peopleType==='camp' ? allCamps : []
  const peopleFiltered = peopleItems.filter(p => !peopleSearch || p.name.toLowerCase().includes(peopleSearch.toLowerCase())).slice(0,10)
  const peopleFeatured = [
    ...allCoaches.filter(p=>p.featured_until&&new Date(p.featured_until)>new Date()).map(p=>({...p,_type:'coach'})),
    ...allSchools.filter(p=>p.featured_until&&new Date(p.featured_until)>new Date()).map(p=>({...p,_type:'school'})),
    ...allCamps.filter(p=>p.featured_until&&new Date(p.featured_until)>new Date()).map(p=>({...p,_type:'camp'})),
  ]
  const verifiedServices = allServices.filter(s => !verifiedCat||s.category_slug===verifiedCat)

  const tabs = [
    {key:'offline',label:'Офлайн места ('+submissions.length+')',color:'#1d4ed8'},
    {key:'online',label:'Онлайн сервисы ('+onlineSubmissions.length+')',color:'#1d4ed8'},
    {key:'people',label:'Люди и обучение ('+peopleSubmissions.length+')',color:'#0891b2'},
    {key:'top',label:'Топ',color:'#f59e0b'},
    {key:'verified',label:'Проверено',color:'#16a34a'},
    {key:'reviews',label:'Отзывы ('+reviews.length+')',color:'#7c3aed'},
  ]

  if (!auth) return (
    <main style={{maxWidth:'400px',margin:'100px auto',padding:'0 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h1 style={{fontSize:'24px',fontWeight:800,marginBottom:'24px'}}>Админ-панель</h1>
      <input type="password" placeholder="Пароль" value={password}
        onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
        style={{...inp,width:'100%',marginBottom:'12px'}} />
      <button onClick={login} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'#1d4ed8',color:'white',fontSize:'15px',fontWeight:600,cursor:'pointer'}}>Войти</button>
      {message&&<p style={{color:'red',marginTop:'12px'}}>{message}</p>}
    </main>
  )

  const SubCard = ({sub, onApprove, onReject, children}) => (
    <div style={{border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',background:'white',marginBottom:'12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:'16px'}}>
        <div style={{flex:1}}>{children}</div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
          <button onClick={onApprove} disabled={loading} style={{padding:'10px 20px',borderRadius:'10px',border:'none',background:'#16a34a',color:'white',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>Одобрить</button>
          <button onClick={onReject} disabled={loading} style={{padding:'10px 20px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>Отклонить</button>
        </div>
      </div>
      <div style={{fontSize:'11px',color:'#cbd5e1',marginTop:'12px'}}>{new Date(sub.created_at).toLocaleString('ru-RU')}</div>
    </div>
  )

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <h1 style={{fontSize:'28px',fontWeight:800,marginBottom:'24px'}}>🏒 Админ-панель</h1>
      <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:tab===t.key?t.color:'#f1f5f9',color:tab===t.key?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>
            {t.label}
          </button>
        ))}
      </div>

      {message&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'12px 16px',marginBottom:'24px',color:'#166534'}}>{message}</div>}

      {tab==='offline'&&(submissions.length===0
        ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Новых заявок нет</div>
        : submissions.map(sub=>(
          <SubCard key={sub.id} sub={sub} onApprove={()=>approve(sub)} onReject={()=>reject(sub)}>
            <div style={{display:'flex',gap:'8px',marginBottom:'8px',flexWrap:'wrap'}}>
              <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:600}}>{getCatName(sub.category_id)}</span>
              <span style={{background:'#f1f5f9',color:'#475569',borderRadius:'6px',padding:'2px 10px',fontSize:'12px'}}>{sub.custom_city||getCityName(sub.city_id)}</span>
            </div>
            <div style={{fontWeight:700,fontSize:'18px',marginBottom:'8px'}}>{sub.name}</div>
            <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
              {sub.address&&<span>📍 {sub.address}</span>}
              {sub.phone&&<span>📞 {sub.phone}</span>}
              {sub.website&&<span>🌐 {sub.website}</span>}
              {sub.description&&<span>💬 {sub.description}</span>}
            </div>
            {(sub.submitter_name||sub.submitter_contact)&&<div style={{marginTop:'8px',padding:'8px',background:'#f8fafc',borderRadius:'8px',fontSize:'12px',color:'#94a3b8'}}>От: {sub.submitter_name||'—'} {sub.submitter_contact?'· '+sub.submitter_contact:''}</div>}
          </SubCard>
        ))
      )}

      {tab==='online'&&(onlineSubmissions.length===0
        ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Новых заявок нет</div>
        : onlineSubmissions.map(sub=>(
          <SubCard key={sub.id} sub={sub} onApprove={()=>approveOnline(sub)} onReject={()=>reject(sub,'online_submissions')}>
            <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:600}}>{sub.category_slug}</span>
            <div style={{fontWeight:700,fontSize:'18px',margin:'8px 0'}}>{sub.name}</div>
            <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
              {sub.url&&<span>🌐 <a href={sub.url} target="_blank" rel="noreferrer" style={{color:'#1d4ed8'}}>{sub.url}</a></span>}
              {sub.description&&<span>💬 {sub.description}</span>}
            </div>
            {(sub.submitter_name||sub.submitter_contact)&&<div style={{marginTop:'8px',padding:'8px',background:'#f8fafc',borderRadius:'8px',fontSize:'12px',color:'#94a3b8'}}>От: {sub.submitter_name||'—'} {sub.submitter_contact?'· '+sub.submitter_contact:''}</div>}
          </SubCard>
        ))
      )}

      {tab==='people'&&(peopleSubmissions.length===0
        ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Новых заявок нет</div>
        : peopleSubmissions.map(sub=>(
          <SubCard key={sub.id} sub={sub} onApprove={()=>approvePeople(sub)} onReject={()=>reject(sub,'people_submissions')}>
            <div style={{display:'flex',gap:'8px',marginBottom:'8px',flexWrap:'wrap'}}>
              <span style={{background:'#e0f2fe',color:'#0891b2',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:600}}>
                {sub.type==='coach'?'Тренер':sub.type==='school'?'Школа/секция':'Сбор/лагерь'}
              </span>
              {sub.custom_city&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 10px',fontSize:'12px'}}>Новый город: {sub.custom_city}</span>}
            </div>
            <div style={{fontWeight:700,fontSize:'18px',marginBottom:'8px'}}>{sub.name}</div>
            <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
              {sub.specialization&&<span>🎯 {sub.specialization}</span>}
              {sub.experience&&<span>📅 {sub.experience}</span>}
              {sub.age_from&&<span>👶 {sub.age_from}–{sub.age_to} лет</span>}
              {sub.dates&&<span>📆 {sub.dates}</span>}
              {sub.address&&<span>📍 {sub.address}</span>}
              {sub.phone&&<span>📞 {sub.phone}</span>}
              {sub.telegram&&<span>💬 {sub.telegram}</span>}
              {sub.description&&<span>📝 {sub.description}</span>}
            </div>
            {(sub.submitter_name||sub.submitter_contact)&&<div style={{marginTop:'8px',padding:'8px',background:'#f8fafc',borderRadius:'8px',fontSize:'12px',color:'#94a3b8'}}>От: {sub.submitter_name||'—'} {sub.submitter_contact?'· '+sub.submitter_contact:''}</div>}
          </SubCard>
        ))
      )}

      {tab==='top'&&(
        <div>
          <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
            {[['offline','Офлайн места'],['online','Онлайн сервисы'],['people','Люди и обучение']].map(([t,l])=>(
              <button key={t} onClick={()=>setTopTab(t)} style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:topTab===t?'#0f172a':'#f1f5f9',color:topTab===t?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>{l}</button>
            ))}
          </div>

          {topTab==='offline'&&(
            <div>
              <div style={{padding:'20px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'14px',marginBottom:'24px'}}>
                <div style={{fontWeight:700,fontSize:'16px',marginBottom:'16px'}}>Поднять место в топ</div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>1. Выбери категорию</div>
                  <select value={offCat} onChange={e=>{setOffCat(e.target.value);setOffSelected(null);setOffSearch('')}} style={{...inp,width:'100%'}}>
                    <option value="">Все категории</option>
                    {categories.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>2. Найди место</div>
                  <input placeholder="Поиск..." value={offSearch} onChange={e=>{setOffSearch(e.target.value);setOffSelected(null)}} style={{...inp,width:'100%',marginBottom:'8px'}} />
                  {offFiltered.length>0&&!offSelected&&(
                    <div style={{border:'1px solid #e2e8f0',borderRadius:'10px',background:'white',maxHeight:'200px',overflowY:'auto'}}>
                      {offFiltered.map(p=>(
                        <div key={p.id} onClick={()=>{setOffSelected(p);setOffSearch(p.name)}} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',fontSize:'14px'}}>
                          <span>{p.name}</span><span style={{color:'#94a3b8',fontSize:'12px'}}>{getCatName(p.category_id)} · {getCityName(p.city_id)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {offSelected&&<div style={{padding:'10px',background:'#dbeafe',borderRadius:'10px',fontSize:'14px',color:'#1d4ed8',display:'flex',justifyContent:'space-between'}}>
                    <span>{offSelected.name}</span><span onClick={()=>{setOffSelected(null);setOffSearch('')}} style={{cursor:'pointer'}}>×</span>
                  </div>}
                </div>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>С какой даты</div><input type="date" value={offFrom} onChange={e=>setOffFrom(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>До какой даты *</div><input type="date" value={offUntil} onChange={e=>setOffUntil(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Цена (руб)</div><input placeholder="0" value={offPrice} onChange={e=>setOffPrice(e.target.value)} style={{...inp,width:'100%'}} /></div>
                </div>
                <input placeholder="Заметки" value={offNotes} onChange={e=>setOffNotes(e.target.value)} style={{...inp,width:'100%',marginBottom:'12px'}} />
                <button onClick={doSetFeaturedPlace} disabled={!offSelected||!offUntil||loading} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:offSelected&&offUntil?'#f59e0b':'#e2e8f0',color:offSelected&&offUntil?'white':'#94a3b8',fontWeight:600,cursor:'pointer'}}>Поднять в топ</button>
              </div>
              <div style={{fontWeight:700,marginBottom:'12px'}}>Сейчас в топе ({offFeatured.length}/3)</div>
              {offFeatured.map(p=>(
                <div key={p.id} style={{border:'1px solid #fde68a',borderRadius:'12px',padding:'14px 18px',background:'#fffbeb',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <div><div style={{fontWeight:700}}>{p.name}</div><div style={{fontSize:'13px',color:'#92400e'}}>{p.featured_from?new Date(p.featured_from).toLocaleDateString('ru-RU'):''} — {new Date(p.featured_until).toLocaleDateString('ru-RU')}</div></div>
                  <button onClick={()=>removeFeaturedPlace(p.id)} style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>Убрать</button>
                </div>
              ))}
            </div>
          )}

          {topTab==='online'&&(
            <div>
              <div style={{padding:'20px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'14px',marginBottom:'24px'}}>
                <div style={{fontWeight:700,fontSize:'16px',marginBottom:'16px'}}>Поднять сервис в топ</div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>1. Выбери категорию</div>
                  <select value={onCat} onChange={e=>{setOnCat(e.target.value);setOnSelected(null);setOnSearch('')}} style={{...inp,width:'100%'}}>
                    <option value="">Все категории</option>
                    {ONLINE_CATS.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>2. Найди сервис</div>
                  <input placeholder="Поиск..." value={onSearch} onChange={e=>{setOnSearch(e.target.value);setOnSelected(null)}} style={{...inp,width:'100%',marginBottom:'8px'}} />
                  {onFiltered.length>0&&!onSelected&&(
                    <div style={{border:'1px solid #e2e8f0',borderRadius:'10px',background:'white',maxHeight:'200px',overflowY:'auto'}}>
                      {onFiltered.map(s=>(
                        <div key={s.id} onClick={()=>{setOnSelected(s);setOnSearch(s.name)}} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',fontSize:'14px'}}>
                          <span>{s.name}</span><span style={{color:'#94a3b8',fontSize:'12px'}}>{s.category_slug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {onSelected&&<div style={{padding:'10px',background:'#dbeafe',borderRadius:'10px',fontSize:'14px',color:'#1d4ed8',display:'flex',justifyContent:'space-between'}}>
                    <span>{onSelected.name}</span><span onClick={()=>{setOnSelected(null);setOnSearch('')}} style={{cursor:'pointer'}}>×</span>
                  </div>}
                </div>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>С какой даты</div><input type="date" value={onFrom} onChange={e=>setOnFrom(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>До какой даты *</div><input type="date" value={onUntil} onChange={e=>setOnUntil(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Цена (руб)</div><input placeholder="0" value={onPrice} onChange={e=>setOnPrice(e.target.value)} style={{...inp,width:'100%'}} /></div>
                </div>
                <input placeholder="Заметки" value={onNotes} onChange={e=>setOnNotes(e.target.value)} style={{...inp,width:'100%',marginBottom:'12px'}} />
                <button onClick={doSetFeaturedService} disabled={!onSelected||!onUntil||loading} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:onSelected&&onUntil?'#f59e0b':'#e2e8f0',color:onSelected&&onUntil?'white':'#94a3b8',fontWeight:600,cursor:'pointer'}}>Поднять в топ</button>
              </div>
              <div style={{fontWeight:700,marginBottom:'12px'}}>Сейчас в топе ({onFeatured.length}/3)</div>
              {onFeatured.map(s=>(
                <div key={s.id} style={{border:'1px solid #fde68a',borderRadius:'12px',padding:'14px 18px',background:'#fffbeb',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <div><div style={{fontWeight:700}}>{s.name}</div><div style={{fontSize:'13px',color:'#92400e'}}>{s.featured_from?new Date(s.featured_from).toLocaleDateString('ru-RU'):''} — {new Date(s.featured_until).toLocaleDateString('ru-RU')}</div></div>
                  <button onClick={()=>removeFeaturedService(s.id)} style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>Убрать</button>
                </div>
              ))}
            </div>
          )}

          {topTab==='people'&&(
            <div>
              <div style={{padding:'20px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'14px',marginBottom:'24px'}}>
                <div style={{fontWeight:700,fontSize:'16px',marginBottom:'16px'}}>Поднять в топ — Люди и обучение</div>
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>1. Выбери тип</div>
                  <select value={peopleType} onChange={e=>{setPeopleType(e.target.value);setPeopleSelected(null);setPeopleSearch('')}} style={{...inp,width:'100%'}}>
                    <option value="">Выбери тип</option>
                    <option value="coach">Тренер</option>
                    <option value="school">Школа/секция</option>
                    <option value="camp">Сбор/лагерь</option>
                  </select>
                </div>
                {peopleType&&<div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'6px'}}>2. Найди</div>
                  <input placeholder="Поиск..." value={peopleSearch} onChange={e=>{setPeopleSearch(e.target.value);setPeopleSelected(null)}} style={{...inp,width:'100%',marginBottom:'8px'}} />
                  {peopleFiltered.length>0&&!peopleSelected&&(
                    <div style={{border:'1px solid #e2e8f0',borderRadius:'10px',background:'white',maxHeight:'200px',overflowY:'auto'}}>
                      {peopleFiltered.map(p=>(
                        <div key={p.id} onClick={()=>{setPeopleSelected(p);setPeopleSearch(p.name)}} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',fontSize:'14px'}}>
                          <span>{p.name}</span><span style={{color:'#94a3b8',fontSize:'12px'}}>{getCityName(p.city_id)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {peopleSelected&&<div style={{padding:'10px',background:'#dbeafe',borderRadius:'10px',fontSize:'14px',color:'#1d4ed8',display:'flex',justifyContent:'space-between'}}>
                    <span>{peopleSelected.name}</span><span onClick={()=>{setPeopleSelected(null);setPeopleSearch('')}} style={{cursor:'pointer'}}>×</span>
                  </div>}
                </div>}
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}}>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>С какой даты</div><input type="date" value={peopleFrom} onChange={e=>setPeopleFrom(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>До какой даты *</div><input type="date" value={peopleUntil} onChange={e=>setPeopleUntil(e.target.value)} style={{...inp,width:'100%'}} /></div>
                  <div style={{flex:1,minWidth:'130px'}}><div style={{fontSize:'12px',color:'#64748b',marginBottom:'4px'}}>Цена (руб)</div><input placeholder="0" value={peoplePrice} onChange={e=>setPeoplePrice(e.target.value)} style={{...inp,width:'100%'}} /></div>
                </div>
                <input placeholder="Заметки" value={peopleNotes} onChange={e=>setPeopleNotes(e.target.value)} style={{...inp,width:'100%',marginBottom:'12px'}} />
                <button onClick={doSetFeaturedPeople} disabled={!peopleSelected||!peopleUntil||loading} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:peopleSelected&&peopleUntil?'#f59e0b':'#e2e8f0',color:peopleSelected&&peopleUntil?'white':'#94a3b8',fontWeight:600,cursor:'pointer'}}>Поднять в топ</button>
              </div>
              <div style={{fontWeight:700,marginBottom:'12px'}}>Сейчас в топе ({peopleFeatured.length})</div>
              {peopleFeatured.map(p=>(
                <div key={p.id+p._type} style={{border:'1px solid #fde68a',borderRadius:'12px',padding:'14px 18px',background:'#fffbeb',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <div><div style={{fontWeight:700}}>{p.name}</div><div style={{fontSize:'13px',color:'#92400e'}}>{p._type==='coach'?'Тренер':p._type==='school'?'Школа':'Лагерь'} · {p.featured_from?new Date(p.featured_from).toLocaleDateString('ru-RU'):''} — {new Date(p.featured_until).toLocaleDateString('ru-RU')}</div></div>
                  <button onClick={()=>removeFeaturedPeople(p.id,p._type)} style={{padding:'8px 14px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>Убрать</button>
                </div>
              ))}
            </div>
          )}

          <div style={{marginTop:'40px'}}>
            <div style={{fontWeight:700,fontSize:'18px',marginBottom:'16px'}}>История размещений</div>
            {history.length===0
              ? <div style={{textAlign:'center',color:'#94a3b8',padding:'32px 0'}}>История пуста</div>
              : <div style={{border:'1px solid #e2e8f0',borderRadius:'14px',overflow:'hidden'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                    <thead><tr style={{background:'#f8fafc'}}>
                      {['Название','Категория','С','До','Цена','Заметки'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',fontWeight:600,color:'#64748b'}}>{h}</th>)}
                    </tr></thead>
                    <tbody>{history.map(h=>(
                      <tr key={h.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                        <td style={{padding:'12px 16px',fontWeight:600}}>{h.place_name}</td>
                        <td style={{padding:'12px 16px',color:'#64748b'}}>{h.category_name}</td>
                        <td style={{padding:'12px 16px',color:'#64748b'}}>{new Date(h.featured_from).toLocaleDateString('ru-RU')}</td>
                        <td style={{padding:'12px 16px',color:'#64748b'}}>{new Date(h.featured_until).toLocaleDateString('ru-RU')}</td>
                        <td style={{padding:'12px 16px',fontWeight:600,color:h.price>0?'#16a34a':'#94a3b8'}}>{h.price>0?h.price.toLocaleString('ru-RU')+' руб':'—'}</td>
                        <td style={{padding:'12px 16px',color:'#64748b'}}>{h.notes||'—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
            }
          </div>
        </div>
      )}

      {tab==='verified'&&(
        <div>
          <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
            <button onClick={()=>setVerifiedTab('online')} style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:verifiedTab==='online'?'#16a34a':'#f1f5f9',color:verifiedTab==='online'?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>Онлайн сервисы</button>
            <button onClick={()=>setVerifiedTab('people')} style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:verifiedTab==='people'?'#16a34a':'#f1f5f9',color:verifiedTab==='people'?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>Люди и обучение</button>
          </div>

          {verifiedTab==='online'&&(
            <div>
              <div style={{padding:'20px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'14px',marginBottom:'24px'}}>
                <div style={{fontWeight:700,fontSize:'16px',marginBottom:'16px'}}>Управление плашкой Проверено — Онлайн сервисы</div>
                <select value={verifiedCat} onChange={e=>setVerifiedCat(e.target.value)} style={{...inp,width:'100%',marginBottom:'16px'}}>
                  <option value="">Все категории</option>
                  {ONLINE_CATS.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'400px',overflowY:'auto'}}>
                  {verifiedServices.map(s=>(
                    <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'white',borderRadius:'10px',border:'1px solid '+(s.is_verified?'#bbf7d0':'#e2e8f0')}}>
                      <div>
                        <span style={{fontWeight:600}}>{s.name}</span>
                        <span style={{fontSize:'12px',color:'#94a3b8',marginLeft:'8px'}}>{s.category_slug}</span>
                        {s.is_verified&&<span style={{marginLeft:'8px',background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'1px 8px',fontSize:'11px',fontWeight:700}}>Проверено</span>}
                      </div>
                      <button onClick={()=>toggleVerified(s)} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:s.is_verified?'#dc2626':'#16a34a',color:'white',fontWeight:600,fontSize:'13px',cursor:'pointer',minWidth:'100px'}}>
                        {s.is_verified?'Снять':'Выставить'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {verifiedTab==='people'&&(
            <div style={{padding:'20px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'14px'}}>
              <div style={{fontWeight:700,fontSize:'16px',marginBottom:'16px'}}>Управление плашкой Проверено — Люди и обучение</div>
              <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                {[['coach','Тренеры'],['school','Школы'],['camp','Лагеря']].map(([t,l])=>(
                  <button key={t} onClick={()=>setVerifiedPeopleType(t)} style={{padding:'6px 16px',borderRadius:'8px',border:'none',background:verifiedPeopleType===t?'#16a34a':'#e2e8f0',color:verifiedPeopleType===t?'white':'#64748b',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>{l}</button>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'400px',overflowY:'auto'}}>
                {(verifiedPeopleType==='coach'?allCoaches:verifiedPeopleType==='school'?allSchools:allCamps).map(item=>(
                  <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'white',borderRadius:'10px',border:'1px solid '+(item.is_verified?'#bbf7d0':'#e2e8f0')}}>
                    <div>
                      <span style={{fontWeight:600}}>{item.name}</span>
                      <span style={{fontSize:'12px',color:'#94a3b8',marginLeft:'8px'}}>{getCityName(item.city_id)}</span>
                      {item.is_verified&&<span style={{marginLeft:'8px',background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'1px 8px',fontSize:'11px',fontWeight:700}}>Проверено</span>}
                    </div>
                    <button onClick={()=>toggleVerifiedPeople(item,verifiedPeopleType)} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:item.is_verified?'#dc2626':'#16a34a',color:'white',fontWeight:600,fontSize:'13px',cursor:'pointer',minWidth:'100px'}}>
                      {item.is_verified?'Снять':'Выставить'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab==='reviews'&&(
        <div>
          {reviews.length===0
            ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Отзывов нет</div>
            : reviews.map(r=>(
              <div key={r.id} style={{border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',background:'white',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:'16px'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px'}}>
                      <span style={{fontWeight:700}}>{r.author_name||'Аноним'}</span>
                      <span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'12px',fontWeight:600}}>{'★'.repeat(r.rating)} {r.rating}/5</span>
                    </div>
                    {r.place&&<div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>📍 {r.place.name}</div>}
                    {r.text&&<div style={{fontSize:'14px',color:'#475569'}}>{r.text}</div>}
                    <div style={{fontSize:'11px',color:'#cbd5e1',marginTop:'8px'}}>{new Date(r.created_at).toLocaleString('ru-RU')}</div>
                  </div>
                  <button onClick={()=>deleteReview(r)} disabled={loading} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'13px',cursor:'pointer',flexShrink:0}}>Удалить</button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </main>
  )
}
