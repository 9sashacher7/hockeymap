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
  const [reviewsTab, setReviewsTab] = useState('coaches')
  const [loading, setLoading] = useState(false)
  const [allCardsTab, setAllCardsTab] = useState('offline')
  const [allCardsSearch, setAllCardsSearch] = useState('')
  const [expandedCard, setExpandedCard] = useState<string|null>(null)
  const [editingCard, setEditingCard] = useState<string|null>(null)
  const [editCardForm, setEditCardForm] = useState<any>({})
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
      sq('places', 'select=*,city:cities(name)&order=name'),
      sq('online_services', 'select=*&order=name'),
      sq('coaches', 'select=*,city:cities(name)&order=name'),
      sq('hockey_schools', 'select=*,city:cities(name)&order=name'),
      sq('hockey_camps', 'select=*,city:cities(name)&order=name'),
      sq('featured_history', 'order=created_at.desc&limit=50'),
      sq('reviews', 'select=id,author_name,rating,text,created_at,is_approved,place_id,coach_id,school_id,camp_id,place:places(name),coach:coaches(name)&order=created_at.desc'),
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

    // Редактирование существующего места
    if (sub.type === 'edit' && sub.place_id) {
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
      const ok = await sbPatch('places', sub.place_id, {
        name: sub.name||undefined,
        city_id: cityId||undefined,
        category_id: sub.category_id||undefined,
        address: sub.address||null,
        phone: sub.phone||null,
        website: sub.website||null,
        hours: sub.hours?{info:sub.hours}:null,
        description: sub.description||null,
        is_network: sub.is_network||false,
      })
      if (ok) { await sbDelete('submissions', sub.id); setMessage('Место обновлено'); loadData() }
      else setMessage('Ошибка')
      setLoading(false)
      return
    }

    // Жалоба — просто удаляем заявку после ознакомления
    if (sub.type === 'report') {
      await sbDelete('submissions', sub.id)
      setMessage('Жалоба принята к сведению'); loadData(); setLoading(false)
      return
    }

    // Новое место
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
      is_network: sub.is_network||false,
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
      city: sub.city||null, specialization: sub.specialization||null, delivery: sub.delivery||null, payment: sub.payment||null,
      phone: sub.phone||null, social: sub.social||null,
      is_verified: false, is_featured: false, subscribers_count: null,
    })
    if (ok) { await sbDelete('online_submissions', sub.id); setMessage('Сервис добавлен'); loadData() }
    else setMessage('Ошибка')
    setLoading(false)
  }

  async function approvePeople(sub) {
    setLoading(true)

    // Редактирование существующей записи
    if (sub.type === 'edit' && sub.people_type) {
      const table = sub.people_type==='coach'?'coaches':sub.people_type==='school'?'hockey_schools':'hockey_camps'
      const fields = ['name','phone','telegram','website','address','description','specialization','experience','price_per_hour','age_from','age_to','dates','price']
      const patch: any = {}
      fields.forEach(f => { if (sub[f] !== undefined && sub[f] !== null && sub[f] !== '') patch[f] = sub[f] })
      if (Object.keys(patch).length > 0 && sub.target_id) {
        const ok = await sbPatch(table, sub.target_id, patch)
        if (ok) { await sbDelete('people_submissions', sub.id); setMessage('Обновлено'); loadData() }
        else setMessage('Ошибка')
      } else {
        await sbDelete('people_submissions', sub.id)
        setMessage('Принято к сведению'); loadData()
      }
      setLoading(false)
      return
    }

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
    let data: any = { name: sub.name, slug, city_id: cityId, specialization: sub.specialization||null, experience: sub.experience||null, price_per_hour: sub.price_per_hour||null, phone: sub.phone||null, telegram: sub.telegram||null, website: sub.website||null, address: sub.address||null, description: sub.description||null, is_verified: true, is_featured: false }
    if (sub.type === 'school') {
      table = 'hockey_schools'
      data = { name: sub.name, slug, city_id: cityId, age_from: sub.age_from||null, age_to: sub.age_to||null, phone: sub.phone||null, telegram: sub.telegram||null, website: sub.website||null, address: sub.address||null, description: sub.description||null, is_verified: true, is_featured: false }
    } else if (sub.type === 'camp') {
      table = 'hockey_camps'
      data = { name: sub.name, slug, city_id: cityId, age_from: sub.age_from||null, age_to: sub.age_to||null, camp_type: sub.camp_type||null, dates: sub.dates||null, price: sub.price||null, phone: sub.phone||null, telegram: sub.telegram||null, website: sub.website||null, address: sub.address||null, description: sub.description||null, is_verified: true, is_featured: false }
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

  async function approveReview(r) {
    setLoading(true)
    await sbPatch('reviews', r.id, { is_approved: true })

    // Пересчитываем рейтинг места если это офлайн отзыв
    if (r.place_id) {
      const allReviews = await sq('reviews', `place_id=eq.${r.place_id}&is_approved=eq.true`)
      const approved = Array.isArray(allReviews) ? allReviews : []
      // Включаем текущий отзыв
      const total = [...approved, {...r, is_approved: true}]
      const avg = total.reduce((s, x) => s + x.rating, 0) / total.length
        const newAvg = Math.round(avg * 10) / 10
      const newCount = total.length
      const isTop = newAvg >= 4.9
      await sbPatch('places', r.place_id, {
        rating_avg: newAvg,
        rating_count: newCount,
        is_top: isTop,
      })
      // Уведомление при достижении 50+ отзывов
      const placeData = allPlaces.find(p => p.id === r.place_id)
      if (newCount >= 50 && placeData && !placeData.popular_notified) {
        await sbPatch('places', r.place_id, { popular_notified: true })
        setMessage('✅ Отзыв одобрен 🎉 Место ' + (placeData?.name||'') + ' набрало 50+ отзывов! Проверь раздел Плашки.')
        setLoading(false)
        setAllPlaces(prev => prev.map(p => p.id===r.place_id ? {...p, rating_avg:newAvg, rating_count:newCount, is_top:isTop, popular_notified:true} : p))
        setReviews(prev => prev.map(x => x.id===r.id ? {...x, is_approved:true} : x))
        return
      }
      setAllPlaces(prev => prev.map(p => p.id===r.place_id ? {...p, rating_avg:newAvg, rating_count:newCount, is_top:isTop} : p))
    }

    setReviews(prev => prev.map(x => x.id===r.id ? {...x, is_approved:true} : x))
    setMessage('✅ Отзыв одобрен')
    setLoading(false)
  }

  async function deleteReview(r) {
    if (!confirm('Удалить отзыв?')) return
    setLoading(true)
    await sbDelete('reviews', r.id)
    setReviews(prev => prev.filter(x => x.id !== r.id))
    setMessage('Отзыв удалён'); setLoading(false)
  }

  async function togglePopular(place) {
    const newVal = !place.is_popular
    setAllPlaces(prev => prev.map(p => p.id===place.id ? {...p, is_popular:newVal} : p))
    await sbPatch('places', place.id, { is_popular: newVal })
    setMessage(newVal ? '👥 Плашка Популярный выставлена' : 'Плашка снята')
  }

  async function toggleNetwork(place) {
    const newVal = !place.is_network
    setAllPlaces(prev => prev.map(p => p.id===place.id ? {...p, is_network:newVal} : p))
    await sbPatch('places', place.id, { is_network: newVal })
    setMessage(newVal ? '🏙️ Плашка Сеть магазинов выставлена' : 'Плашка снята')
  }

  async function revokeTop(place) {
    setAllPlaces(prev => prev.map(p => p.id===place.id ? {...p, is_top:false} : p))
    await sbPatch('places', place.id, { is_top: false })
    setMessage('🏆 Плашка Топ магазин отозвана')
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
    {key:'reviews',label:'Отзывы ('+reviews.filter(r=>!r.is_approved).length+')',color:'#7c3aed'},
    {key:'all_cards',label:'Все карточки',color:'#475569'},
    {key:'badges',label:'Плашки ('+allPlaces.filter(p=>p.popular_notified&&!p.is_popular).length+')',color:'#f59e0b'},
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
            <div style={{display:'flex',gap:'6px',marginBottom:'8px',flexWrap:'wrap'}}>
              {(!sub.type||sub.type==='new')&&<span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:700}}>🆕 Новая заявка</span>}
              {sub.type==='edit'&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:700}}>✏️ Редактирование {sub.people_type==='coach'?'тренера':sub.people_type==='school'?'школы':sub.people_type==='camp'?'лагеря':'места'}</span>}
              {sub.type==='report'&&<span style={{background:'#fee2e2',color:'#dc2626',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:700}}>⚠️ Жалоба</span>}
              {sub.is_network&&<span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:700}}>🏙️ Сеть</span>}
              {(!sub.type||sub.type==='new')&&<span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:600}}>{getCatName(sub.category_id)}</span>}
              {(!sub.type||sub.type==='new')&&<span style={{background:'#f1f5f9',color:'#475569',borderRadius:'6px',padding:'2px 10px',fontSize:'12px'}}>{sub.custom_city||getCityName(sub.city_id)}</span>}
            </div>
            <div style={{fontWeight:700,fontSize:'18px',marginBottom:'8px'}}>{sub.name}</div>
            {(sub.type==='edit')&&(
              <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'8px',padding:'10px 12px',marginBottom:'8px',fontSize:'12px'}}>
                <div style={{fontWeight:700,color:'#92400e',marginBottom:'6px'}}>Изменённые данные:</div>
                <div style={{display:'flex',flexDirection:'column',gap:'3px',color:'#78350f'}}>
                  {sub.phone&&<span>📞 {sub.phone}</span>}
                  {sub.address&&<span>📍 {sub.address}</span>}
                  {sub.website&&<span>🌐 {sub.website}</span>}
                  {sub.description&&<span>💬 {sub.description}</span>}
                  {sub.people_type==='coach'&&sub.specialization&&<span>🏒 Специализация: {sub.specialization}</span>}
                  {sub.people_type==='coach'&&sub.experience&&<span>⏱ Опыт: {sub.experience}</span>}
                  {sub.people_type==='coach'&&sub.price_per_hour&&<span>💰 Цена: {sub.price_per_hour} руб/час</span>}
                </div>
              </div>
            )}
            {sub.type==='report'&&sub.description&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'10px 12px',marginBottom:'8px',fontSize:'12px',color:'#991b1b'}}>
                <div style={{fontWeight:700,marginBottom:'4px'}}>Текст жалобы:</div>
                <div>{sub.description}</div>
              </div>
            )}
            {(!sub.type||sub.type==='new')&&(
              <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                {sub.address&&<span>📍 {sub.address}</span>}
                {sub.phone&&<span>📞 {sub.phone}</span>}
                {sub.website&&<span>🌐 {sub.website}</span>}
                {sub.hours&&<span>🕐 {sub.hours}</span>}
                {sub.description&&<span>💬 {sub.description}</span>}
                {sub.is_network&&<span>🏙️ Сеть магазинов</span>}
              </div>
            )}
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
              {sub.city&&<span>📍 {sub.city}</span>}
              {sub.phone&&<span>📞 {sub.phone}</span>}
              {sub.social&&<span>🔗 {sub.social}</span>}
              {sub.delivery&&<span>🚚 Доставка: {sub.delivery}</span>}
              {sub.payment&&<span>💳 Оплата: {sub.payment}</span>}
              {sub.specialization&&<span>🏒 Специализация: {sub.specialization}</span>}
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
              {sub.specialization&&<span>🎯 Специализация: {sub.specialization}</span>}
              {sub.experience&&<span>📅 Опыт: {sub.experience}</span>}
              {sub.price_per_hour&&<span>💰 Цена: {sub.price_per_hour} руб/час</span>}
              {sub.age_from&&<span>👶 Возраст: {sub.age_from}–{sub.age_to} лет</span>}
              {sub.camp_type&&<span>🏕️ Тип: {({'children':'Детский','adult':'Взрослый','mixed':'Смешанный','amateur':'Любительский','professional':'Профессиональный'})[sub.camp_type]||sub.camp_type}</span>}
              {sub.dates&&<span>📆 Даты: {sub.dates}</span>}
              {sub.price&&<span>💵 Стоимость: {sub.price}</span>}
              {sub.address&&<span>📍 {sub.address}</span>}
              {sub.phone&&<span>📞 <a href={'tel:'+sub.phone} style={{color:'#1d4ed8'}}>{sub.phone}</a></span>}
              {sub.telegram&&<span>💬 <a href={sub.telegram.startsWith('http')?sub.telegram:'https://t.me/'+sub.telegram.replace('@','')} target='_blank' rel='noreferrer' style={{color:'#1d4ed8'}}>{sub.telegram}</a></span>}
              {sub.website&&<span>🌐 <a href={sub.website} target='_blank' rel='noreferrer' style={{color:'#1d4ed8'}}>{sub.website}</a></span>}
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

      {tab==='all_cards'&&(
        <div>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
            {[['offline','Офлайн сервисы'],['online','Онлайн сервисы'],['people','Люди и обучение']].map(([t,l])=>(
              <button key={t} onClick={()=>setAllCardsTab(t)} style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:allCardsTab===t?'#475569':'#f1f5f9',color:allCardsTab===t?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>{l}</button>
            ))}
          </div>

          <input placeholder="Поиск по названию, городу, телефону..." value={allCardsSearch} onChange={e=>setAllCardsSearch(e.target.value)}
            style={{width:'100%',padding:'12px 16px',borderRadius:'12px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}} />

          {allCardsTab==='offline'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {allPlaces.filter(p=>{
                const q = allCardsSearch.toLowerCase()
                return !q || p.name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q) || p.phone?.includes(q)
              }).map(p=>(
                <div key={p.id} style={{border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:'white'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'15px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'#94a3b8'}}>{getCityName(p.city_id)}{p.address?' · '+p.address:''}</div>
                      {p.phone&&<div style={{fontSize:'12px',color:'#64748b'}}>📞 {p.phone}</div>}
                    </div>
                    <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                      {p.is_verified&&<span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:600}}>✓</span>}
                      {p.is_top&&<span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:600}}>🏆</span>}
                      <button onClick={()=>setExpandedCard(expandedCard===('d'+p.id)?null:('d'+p.id))}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'white',fontSize:'12px',cursor:'pointer',color:'#64748b'}}>
                        {expandedCard===('d'+p.id)?'Скрыть':'Подробнее'}
                      </button>
                      <button onClick={()=>{setEditingCard(editingCard===('d'+p.id)?null:('d'+p.id));setEditCardForm({name:p.name,address:p.address||'',phone:p.phone||'',website:p.website||'',description:p.description||'',hours:p.hours?.info||p.hours||''})}}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #1d4ed8',background:editingCard===('d'+p.id)?'#1d4ed8':'white',color:editingCard===('d'+p.id)?'white':'#1d4ed8',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        ✏️
                      </button>
                      <button onClick={async()=>{if(confirm('Удалить '+p.name+'?')){await sbDelete('places',p.id);setAllPlaces(prev=>prev.filter(x=>x.id!==p.id))}}}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'none',background:'#fee2e2',color:'#dc2626',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        Удалить
                      </button>
                    </div>
                  </div>
                  {editingCard===('d'+p.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'16px',background:'#f0f9ff',display:'flex',flexDirection:'column',gap:'8px'}}>
                      <div style={{fontWeight:600,fontSize:'13px',marginBottom:'4px'}}>Редактировать место</div>
                      {[['name','Название'],['address','Адрес'],['phone','Телефон'],['website','Сайт'],['hours','Часы работы'],['description','Описание']].map(([f,pl])=>(
                        <input key={f} placeholder={pl} value={editCardForm[f]||''} onChange={e=>setEditCardForm(prev=>({...prev,[f]:e.target.value}))}
                          style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #bfdbfe',fontSize:'13px',outline:'none'}} />
                      ))}
                      <button onClick={async()=>{
                        const ok = await sbPatch('places',p.id,{name:editCardForm.name,address:editCardForm.address||null,phone:editCardForm.phone||null,website:editCardForm.website||null,hours:editCardForm.hours?{info:editCardForm.hours}:null,description:editCardForm.description||null})
                        if(ok){setMessage('✅ Место обновлено');setEditingCard(null);loadData()}else setMessage('❌ Ошибка')
                      }} style={{padding:'8px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                        Сохранить
                      </button>
                    </div>
                  )}
                  {expandedCard===('d'+p.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'12px 16px',background:'#f8fafc',fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                      {p.address&&<div>📍 {p.address}</div>}
                      {p.phone&&<div>📞 {p.phone}</div>}
                      {p.website&&<div>🌐 {p.website}</div>}
                      {p.hours&&<div>🕐 {typeof p.hours==='object'?p.hours.info:p.hours}</div>}
                      {p.description&&<div>💬 {p.description}</div>}
                      {p.rating_avg>0&&<div>⭐ Рейтинг: {p.rating_avg} ({p.rating_count} отз.)</div>}
                      {p.is_verified&&<div style={{color:'#16a34a',fontWeight:600}}>✓ Проверено</div>}
                      {p.is_top&&<div style={{color:'#854d0e',fontWeight:600}}>🏆 Топ магазин</div>}
                      {p.is_network&&<div style={{color:'#16a34a',fontWeight:600}}>🏙️ Сеть магазинов</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {allCardsTab==='online'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {allServices.filter(s=>{
                const q = allCardsSearch.toLowerCase()
                return !q || s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.phone?.includes(q)
              }).map(s=>(
                <div key={s.id} style={{border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:'white'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'15px'}}>{s.name}</div>
                      <div style={{fontSize:'12px',color:'#94a3b8'}}>{s.category_slug}{s.city?' · '+s.city:''}</div>
                      {s.url&&<div style={{fontSize:'12px',color:'#1d4ed8'}}>{s.url}</div>}
                      {s.phone&&<div style={{fontSize:'12px',color:'#64748b'}}>📞 {s.phone}</div>}
                    </div>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>setExpandedCard(expandedCard===('o'+s.id)?null:('o'+s.id))}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'white',fontSize:'12px',cursor:'pointer',color:'#64748b'}}>
                        {expandedCard===('o'+s.id)?'Скрыть':'Подробнее'}
                      </button>
                      <button onClick={()=>{setEditingCard(editingCard===('o'+s.id)?null:('o'+s.id));setEditCardForm({name:s.name,url:s.url||'',city:s.city||'',phone:s.phone||'',social:s.social||'',description:s.description||''})}}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #1d4ed8',background:editingCard===('o'+s.id)?'#1d4ed8':'white',color:editingCard===('o'+s.id)?'white':'#1d4ed8',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        ✏️
                      </button>
                      <button onClick={async()=>{if(confirm('Удалить '+s.name+'?')){await sbDelete('online_services',s.id);setAllServices(prev=>prev.filter(x=>x.id!==s.id))}}}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'none',background:'#fee2e2',color:'#dc2626',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        Удалить
                      </button>
                    </div>
                  </div>
                  {editingCard===('o'+s.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'16px',background:'#f0f9ff',display:'flex',flexDirection:'column',gap:'8px'}}>
                      <div style={{fontWeight:600,fontSize:'13px',marginBottom:'4px'}}>Редактировать сервис</div>
                      {[['name','Название'],['url','Ссылка'],['city','Город'],['phone','Телефон'],['social','Соцсети'],['description','Описание']].map(([f,pl])=>(
                        <input key={f} placeholder={pl} value={editCardForm[f]||''} onChange={e=>setEditCardForm(prev=>({...prev,[f]:e.target.value}))}
                          style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #bfdbfe',fontSize:'13px',outline:'none'}} />
                      ))}
                      <button onClick={async()=>{
                        const ok = await sbPatch('online_services',s.id,{name:editCardForm.name,url:editCardForm.url||null,city:editCardForm.city||null,phone:editCardForm.phone||null,social:editCardForm.social||null,description:editCardForm.description||null})
                        if(ok){setMessage('✅ Сервис обновлён');setEditingCard(null);loadData()}else setMessage('❌ Ошибка')
                      }} style={{padding:'8px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                        Сохранить
                      </button>
                    </div>
                  )}
                  {expandedCard===('o'+s.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'12px 16px',background:'#f8fafc',fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                      {s.description&&<div>💬 {s.description}</div>}
                      {s.city&&<div>📍 {s.city}</div>}
                      {s.phone&&<div>📞 {s.phone}</div>}
                      {s.social&&<div>🔗 {s.social}</div>}
                      {s.delivery&&<div>🚚 Доставка: {s.delivery}</div>}
                      {s.payment&&<div>💳 Оплата: {s.payment}</div>}
                      {s.specialization&&<div>🏒 {s.specialization}</div>}
                      {s.is_verified&&<div style={{color:'#16a34a',fontWeight:600}}>✓ Проверено</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {allCardsTab==='people'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {[...allCoaches.map(c=>({...c,_type:'coach'})),...allSchools.map(s=>({...s,_type:'school'})),...allCamps.map(c=>({...c,_type:'camp'}))].filter(p=>{
                const q = allCardsSearch.toLowerCase()
                return !q || p.name?.toLowerCase().includes(q) || p.city?.name?.toLowerCase().includes(q) || p.phone?.includes(q)
              }).map(p=>(
                <div key={p._type+p.id} style={{border:'1px solid #e2e8f0',borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:'white'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'15px'}}>{p.name}</div>
                      <div style={{fontSize:'12px',color:'#94a3b8'}}>{p._type==='coach'?'Тренер':p._type==='school'?'Школа':'Лагерь'}{p.city?' · '+p.city.name:''}</div>
                      {p.phone&&<div style={{fontSize:'12px',color:'#64748b'}}>📞 {p.phone}</div>}
                    </div>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>setExpandedCard(expandedCard===('p'+p._type+p.id)?null:('p'+p._type+p.id))}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'white',fontSize:'12px',cursor:'pointer',color:'#64748b'}}>
                        {expandedCard===('p'+p._type+p.id)?'Скрыть':'Подробнее'}
                      </button>
                      <button onClick={()=>{setEditingCard(editingCard===('p'+p._type+p.id)?null:('p'+p._type+p.id));setEditCardForm({name:p.name,phone:p.phone||'',telegram:p.telegram||'',website:p.website||'',address:p.address||'',description:p.description||'',specialization:p.specialization||'',experience:p.experience||'',price_per_hour:p.price_per_hour||'',age_from:p.age_from||'',age_to:p.age_to||'',dates:p.dates||'',price:p.price||''})}}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'1px solid #1d4ed8',background:editingCard===('p'+p._type+p.id)?'#1d4ed8':'white',color:editingCard===('p'+p._type+p.id)?'white':'#1d4ed8',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        ✏️
                      </button>
                      <button onClick={async()=>{
                        const table = p._type==='coach'?'coaches':p._type==='school'?'hockey_schools':'hockey_camps'
                        if(confirm('Удалить '+p.name+'?')){await sbDelete(table,p.id);
                          if(p._type==='coach') setAllCoaches(prev=>prev.filter(x=>x.id!==p.id))
                          else if(p._type==='school') setAllSchools(prev=>prev.filter(x=>x.id!==p.id))
                          else setAllCamps(prev=>prev.filter(x=>x.id!==p.id))
                        }
                      }}
                        style={{padding:'6px 12px',borderRadius:'8px',border:'none',background:'#fee2e2',color:'#dc2626',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                        Удалить
                      </button>
                    </div>
                  </div>
                  {editingCard===('p'+p._type+p.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'16px',background:'#f0f9ff',display:'flex',flexDirection:'column',gap:'8px'}}>
                      <div style={{fontWeight:600,fontSize:'13px',marginBottom:'4px'}}>Редактировать</div>
                      {[
                        ['name','Название/Имя'],
                        ['phone','Телефон'],
                        ['telegram','Telegram/WhatsApp'],
                        ['website','Сайт'],
                        ['address','Адрес'],
                        ...(p._type==='coach'?[['specialization','Специализация'],['experience','Опыт'],['price_per_hour','Цена за час (руб)']]: []),
                        ...(p._type!=='coach'?[['age_from','Возраст от'],['age_to','Возраст до']]: []),
                        ...(p._type==='camp'?[['dates','Даты'],['price','Стоимость']]: []),
                        ['description','Описание'],
                      ].map(([f,pl])=>(
                        <input key={f} placeholder={pl} value={editCardForm[f]||''} onChange={e=>setEditCardForm(prev=>({...prev,[f]:e.target.value}))}
                          style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #bfdbfe',fontSize:'13px',outline:'none'}} />
                      ))}
                      <button onClick={async()=>{
                        const table = p._type==='coach'?'coaches':p._type==='school'?'hockey_schools':'hockey_camps'
                        let patchData: any = {name:editCardForm.name||null,phone:editCardForm.phone||null,telegram:editCardForm.telegram||null,website:editCardForm.website||null,address:editCardForm.address||null,description:editCardForm.description||null}
                        if(p._type==='coach') patchData = {...patchData,specialization:editCardForm.specialization||null,experience:editCardForm.experience||null,price_per_hour:editCardForm.price_per_hour||null}
                        if(p._type!=='coach') patchData = {...patchData,age_from:editCardForm.age_from?parseInt(editCardForm.age_from):null,age_to:editCardForm.age_to?parseInt(editCardForm.age_to):null}
                        if(p._type==='camp') patchData = {...patchData,dates:editCardForm.dates||null,price:editCardForm.price||null,camp_type:editCardForm.camp_type||null}
                        const ok = await sbPatch(table,p.id,patchData)
                        if(ok){setMessage('✅ Обновлено');setEditingCard(null);loadData()}else setMessage('❌ Ошибка')
                      }} style={{padding:'8px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                        Сохранить
                      </button>
                    </div>
                  )}
                  {expandedCard===('p'+p._type+p.id)&&(
                    <div style={{borderTop:'1px solid #f1f5f9',padding:'12px 16px',background:'#f8fafc',fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                      {p.specialization&&<div>🎯 Специализация: {p.specialization}</div>}
                      {p.experience&&<div>📅 Опыт: {p.experience}</div>}
                      {p.price_per_hour&&<div>💰 Цена: {p.price_per_hour} руб/час</div>}
                      {p.age_from&&<div>👶 Возраст: {p.age_from}–{p.age_to} лет</div>}
                      {p.camp_type&&<div>🏕️ Тип: {({'children':'Детский','adult':'Взрослый','mixed':'Смешанный','amateur':'Любительский','professional':'Профессиональный'})[p.camp_type]||p.camp_type}</div>}
                      {p.price&&<div>💵 Стоимость: {p.price}</div>}
                      {p.dates&&<div>📆 Даты: {p.dates}</div>}
                      {p.address&&<div>📍 {p.address}</div>}
                      {p.telegram&&<div>💬 <a href={p.telegram.startsWith('http')?p.telegram:'https://t.me/'+p.telegram.replace('@','')} target='_blank' rel='noreferrer' style={{color:'#1d4ed8'}}>{p.telegram}</a></div>}
                      {p.website&&<div>🌐 <a href={p.website} target='_blank' rel='noreferrer' style={{color:'#1d4ed8'}}>{p.website}</a></div>}
                      {p.description&&<div>📝 {p.description}</div>}
                      {p.is_verified&&<div style={{color:'#16a34a',fontWeight:600}}>✓ Проверено</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='badges'&&(
        <div>
          {/* Уведомления о 50+ отзывах */}
          {allPlaces.filter(p=>p.popular_notified&&!p.is_popular).length>0&&(
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'14px',padding:'16px 20px',marginBottom:'24px'}}>
              <div style={{fontWeight:700,fontSize:'15px',marginBottom:'12px'}}>🔔 Новые кандидаты на плашку Популярный</div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {allPlaces.filter(p=>p.popular_notified&&!p.is_popular).map(p=>(
                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'white',borderRadius:'10px',padding:'12px 16px',border:'1px solid #fde68a'}}>
                    <div>
                      <span style={{fontWeight:600}}>{p.name}</span>
                      <span style={{fontSize:'12px',color:'#94a3b8',marginLeft:'8px'}}>{p.rating_count} отзывов · ★{p.rating_avg}</span>
                    </div>
                    <button onClick={()=>togglePopular(p)} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#1d4ed8',color:'white',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                      👥 Выдать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Топ магазины */}
          <div style={{padding:'20px',background:'#fefce8',border:'1px solid #fde68a',borderRadius:'14px',marginBottom:'16px'}}>
            <div style={{fontWeight:700,fontSize:'16px',marginBottom:'4px'}}>🏆 Топ магазин</div>
            <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'16px'}}>Выдаётся автоматически при рейтинге 4.9+. Можно отозвать вручную.</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
              {allPlaces.filter(p=>p.is_top).map(p=>(
                <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'white',borderRadius:'10px',border:'1px solid #fde68a'}}>
                  <div>
                    <span style={{fontWeight:600}}>{p.name}</span>
                    <span style={{fontSize:'12px',color:'#94a3b8',marginLeft:'8px'}}>★{p.rating_avg} · {p.rating_count} отз.</span>
                  </div>
                  <button onClick={()=>revokeTop(p)} style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:'#dc2626',color:'white',fontWeight:600,fontSize:'12px',cursor:'pointer'}}>Отозвать</button>
                </div>
              ))}
              {allPlaces.filter(p=>p.is_top).length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'20px 0'}}>Нет топ магазинов</div>}
            </div>
          </div>

          {/* Популярные */}
          <div style={{padding:'20px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'14px',marginBottom:'16px'}}>
            <div style={{fontWeight:700,fontSize:'16px',marginBottom:'4px'}}>👥 Популярный</div>
            <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'16px'}}>Выдаётся вручную когда место набирает 50+ отзывов.</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
              {allPlaces.filter(p=>p.rating_count>=50||p.is_popular).map(p=>(
                <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'white',borderRadius:'10px',border:'1px solid '+(p.is_popular?'#bfdbfe':'#e2e8f0')}}>
                  <div>
                    <span style={{fontWeight:600}}>{p.name}</span>
                    <span style={{fontSize:'12px',color:'#94a3b8',marginLeft:'8px'}}>{p.rating_count} отзывов</span>
                    {p.is_popular&&<span style={{marginLeft:'8px',background:'#dbeafe',color:'#1d4ed8',borderRadius:'6px',padding:'1px 8px',fontSize:'11px',fontWeight:700}}>Активна</span>}
                  </div>
                  <button onClick={()=>togglePopular(p)} style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:p.is_popular?'#dc2626':'#1d4ed8',color:'white',fontWeight:600,fontSize:'12px',cursor:'pointer'}}>
                    {p.is_popular?'Снять':'Выдать'}
                  </button>
                </div>
              ))}
              {allPlaces.filter(p=>p.rating_count>=50||p.is_popular).length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'20px 0'}}>Пока нет мест с 50+ отзывами</div>}
            </div>
          </div>

          {/* Сеть магазинов */}
          <div style={{padding:'20px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'14px'}}>
            <div style={{fontWeight:700,fontSize:'16px',marginBottom:'4px'}}>🏙️ Сеть магазинов</div>
            <div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'16px'}}>Выдаётся вручную. Заявители могут сами указать что они сеть.</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
              {allPlaces.map(p=>(
                <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'white',borderRadius:'10px',border:'1px solid '+(p.is_network?'#bbf7d0':'#e2e8f0')}}>
                  <div>
                    <span style={{fontWeight:600}}>{p.name}</span>
                    {p.is_network&&<span style={{marginLeft:'8px',background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'1px 8px',fontSize:'11px',fontWeight:700}}>Активна</span>}
                  </div>
                  <button onClick={()=>toggleNetwork(p)} style={{padding:'6px 14px',borderRadius:'8px',border:'none',background:p.is_network?'#dc2626':'#16a34a',color:'white',fontWeight:600,fontSize:'12px',cursor:'pointer'}}>
                    {p.is_network?'Снять':'Выдать'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='reviews'&&(
        <div>
          <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
            {[['coaches','Тренеры'],['places','Офлайн сервисы']].map(([t,l])=>(
              <button key={t} onClick={()=>setReviewsTab(t)}
                style={{padding:'8px 20px',borderRadius:'10px',border:'none',background:reviewsTab===t?'#7c3aed':'#f1f5f9',color:reviewsTab===t?'white':'#64748b',fontWeight:600,cursor:'pointer'}}>
                {l} ({reviews.filter(r=>t==='coaches'?!!r.coach_id:!!r.place_id).length})
              </button>
            ))}
          </div>

          {reviews.filter(r=>reviewsTab==='coaches'?!!r.coach_id:!!r.place_id).length===0
            ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Отзывов нет</div>
            : reviews.filter(r=>reviewsTab==='coaches'?!!r.coach_id:!!r.place_id).map(r=>(
              <div key={r.id} style={{border:'1px solid '+(r.is_approved?'#e2e8f0':'#fde68a'),borderRadius:'14px',padding:'20px',background:r.is_approved?'white':'#fffbeb',marginBottom:'12px'}}>
                {!r.is_approved&&<div style={{fontSize:'12px',fontWeight:600,color:'#92400e',marginBottom:'8px'}}>⏳ Ожидает одобрения</div>}
                <div style={{display:'flex',justifyContent:'space-between',gap:'16px'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px',flexWrap:'wrap'}}>
                      <span style={{fontWeight:700}}>{r.author_name||'Аноним'}</span>
                      <span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'12px',fontWeight:600}}>{'★'.repeat(r.rating)} {r.rating}/5</span>
                    </div>
                    {reviewsTab==='coaches'&&r.coach&&<div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>Тренер: {r.coach.name}</div>}
                    {reviewsTab==='places'&&r.place&&<div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'6px'}}>📍 {r.place.name}</div>}
                    {r.text&&<div style={{fontSize:'14px',color:'#475569'}}>{r.text}</div>}
                    <div style={{fontSize:'11px',color:'#cbd5e1',marginTop:'8px'}}>{new Date(r.created_at).toLocaleString('ru-RU')}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
                    {!r.is_approved&&<button onClick={()=>approveReview(r)} disabled={loading}
                      style={{padding:'8px 16px',borderRadius:'10px',border:'none',background:'#16a34a',color:'white',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                      ✓ Одобрить
                    </button>}
                    <button onClick={()=>deleteReview(r)} disabled={loading}
                      style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </main>
  )
}
