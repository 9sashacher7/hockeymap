'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function sq(table, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

async function post(table, data) {
  const res = await fetch(`${SURL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data)
  })
  return res.ok
}

const TYPES = [
  { value: 'coach', label: '👤 Тренер' },
  { value: 'school', label: '🎓 Хоккейная школа или секция' },
  { value: 'camp', label: '📋 Хоккейный сбор или лагерь' },
]

export default function AddPeoplePage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showCustomCity, setShowCustomCity] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [form, setForm] = useState({
    type: '',
    name: '',
    city_id: '',
    custom_city: '',
    specialization: '',
    experience: '',
    age_from: '',
    age_to: '',
    camp_type: '',
    dates: '',
    phone: '',
    telegram: '',
    website: '',
    price_per_hour: '',
    address: '',
    description: '',
    submitter_name: '',
    submitter_contact: '',
  })

  useEffect(() => {
    sq('cities', 'order=name').then(setCities)
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.type || !form.name) return
    setLoading(true)
    const ok = await post('people_submissions', {
      ...form,
      city_id: form.city_id && form.city_id !== 'other' ? parseInt(form.city_id) : null,
      custom_city: form.custom_city || null,
      age_from: form.age_from ? parseInt(form.age_from) : null,
      age_to: form.age_to ? parseInt(form.age_to) : null,
    })
    setLoading(false)
    if (ok) setDone(true)
  }

  const inp = (field, placeholder, required = false) => (
    <input
      placeholder={placeholder + (required ? ' *' : '')}
      value={form[field]}
      onChange={e => set(field, e.target.value)}
      style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box',outline:'none'}}
    />
  )

  const isValid = form.type && form.name && (form.city_id && form.city_id !== 'other' || form.custom_city) && (form.type !== 'coach' || form.price_per_hour) && agreed

  if (done) return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'80px 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'12px'}}>Заявка отправлена!</h2>
      <p style={{color:'#64748b',marginBottom:'32px'}}>Мы проверим и добавим в течение 1-2 дней</p>
      <Link href="/" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>На главную</Link>
    </main>
  )

  return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'32px',fontWeight:900,margin:'16px 0 8px'}}>Добавить в раздел</h1>
      <p style={{color:'#64748b',marginBottom:'32px',fontSize:'14px'}}>Тренер, школа или лагерь — поможешь другим хоккеистам найти нужное.</p>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>

        <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8'}}>Тип</div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {TYPES.map(t => (
            <div key={t.value} onClick={() => set('type', t.value)}
              style={{padding:'12px 16px',borderRadius:'10px',border:`2px solid ${form.type===t.value?'#1d4ed8':'#e2e8f0'}`,cursor:'pointer',fontWeight:form.type===t.value?700:400,color:form.type===t.value?'#1d4ed8':'inherit',background:form.type===t.value?'#eff6ff':'white'}}>
              {t.label}
            </div>
          ))}
        </div>

        {form.type && <>
          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8',marginTop:'8px'}}>Основное</div>

          {inp('name', form.type==='coach'?'Имя и Фамилия тренера':form.type==='school'?'Название школы или секции':'Название сбора или лагеря', true)}

          <select value={form.city_id} onChange={e => { set('city_id', e.target.value); setShowCustomCity(e.target.value==='other'); if(e.target.value!=='other') set('custom_city','') }}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Выбери город *</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="other">— Моего города нет в списке</option>
          </select>
          {showCustomCity && inp('custom_city', 'Введи название города', true)}

          {form.type==='coach' && <>
            {inp('specialization', 'Специализация (например: вратари, нападающие, все возрасты)')}
            {inp('experience', 'Опыт (например: 10 лет, КМС)')}
          {inp('price_per_hour', 'Цена за час (руб)', true)}
          </>}

          {(form.type==='school'||form.type==='camp') && (
            <div style={{display:'flex',gap:'12px'}}>
              <input placeholder="Возраст от" value={form.age_from} onChange={e=>set('age_from',e.target.value)} type="number"
                style={{flex:1,padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}} />
              <input placeholder="Возраст до" value={form.age_to} onChange={e=>set('age_to',e.target.value)} type="number"
                style={{flex:1,padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}} />
            </div>
          )}

          {form.type==='camp' && <>
            <select value={form.camp_type} onChange={e=>set('camp_type',e.target.value)}
              style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
              <option value="">Тип сбора</option>
              <option value="children">Детский</option>
              <option value="adult">Взрослый</option>
              <option value="mixed">Смешанный</option>
              <option value="amateur">Любительский</option>
              <option value="professional">Профессиональный</option>
            </select>
            {inp('dates', 'Даты проведения (например: июль 2025)')}
          </>}

          {inp('address', 'Адрес')}
          {inp('phone', 'Телефон')}
          {inp('telegram', 'Ссылка для связи — Telegram, WhatsApp, VK и др. (для кнопки Написать)')}
          {inp('website', 'Сайт')}

          <textarea placeholder="Описание" value={form.description} onChange={e=>set('description',e.target.value)} rows={3}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',resize:'none',outline:'none'}} />

          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8',marginTop:'8px'}}>О тебе</div>
          {inp('submitter_name', 'Твоё имя')}
          {inp('submitter_contact', 'Telegram или email для связи')}

          <div onClick={()=>setAgreed(!agreed)}
            style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',padding:'4px 0'}}>
            <div style={{width:'20px',height:'20px',borderRadius:'6px',border:'2px solid '+(agreed?'#1d4ed8':'#e2e8f0'),background:agreed?'#1d4ed8':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}}>
              {agreed&&<span style={{color:'white',fontSize:'13px',fontWeight:700}}>✓</span>}
            </div>
            <span style={{fontSize:'13px',color:'#374151',lineHeight:1.5}}>
              Я согласен с <a href="/privacy" target="_blank" style={{color:'#1d4ed8'}} onClick={e=>e.stopPropagation()}>политикой конфиденциальности</a> и даю согласие на обработку персональных данных
            </span>
          </div>

          <button onClick={handleSubmit} disabled={loading||!isValid}
            style={{padding:'14px',borderRadius:'12px',border:'none',background:isValid?'#1d4ed8':'#e2e8f0',color:isValid?'white':'#94a3b8',fontSize:'15px',fontWeight:600,cursor:isValid?'pointer':'default',marginTop:'8px'}}>
            {loading?'Отправляем...':'Отправить заявку'}
          </button>
          <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center'}}>Мы проверим информацию и добавим в течение 1-2 дней</p>
        </>}
      </div>
    </main>
  )
}
