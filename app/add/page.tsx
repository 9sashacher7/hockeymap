import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Добавить хоккейный магазин или сервис | HockeyMap',
  description: 'Добавь хоккейный магазин, заточку или мастерскую на карту России. Помоги хоккейному сообществу найти нужные сервисы.',
  openGraph: { title: 'Добавить хоккейный магазин или сервис | HockeyMap', description: 'Добавь хоккейный магазин, заточку или мастерскую на карту России. Помоги хоккейному сообществу найти нужные сервисы.' }
}

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

async function post(table: string, data: any) {
  const res = await fetch(`${SURL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SKEY,
      Authorization: `Bearer ${SKEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(data)
  })
  return res.ok
}

export default function AddPage() {
  const router = useRouter()
  const [cities, setCities] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showCustomCity, setShowCustomCity] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    city_id: '',
    address: '',
    phone: '',
    website: '',
    hours: '',
    description: '',
    submitter_name: '',
    submitter_contact: '',
    custom_city: '',
    is_network: false,
  })

  useEffect(() => {
    sq('cities', 'order=name').then(setCities)
    sq('categories', 'order=name').then(setCategories)
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.category_id || !form.city_id) return
    setLoading(true)
    const ok = await post('submissions', {
      ...form,
      category_id: parseInt(form.category_id),
      city_id: form.city_id && form.city_id !== 'other' ? parseInt(form.city_id) : null,
      custom_city: form.custom_city || null,
    })
    setLoading(false)
    if (ok) setDone(true)
  }

  if (done) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏒</div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Заявка отправлена!</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Мы проверим информацию и добавим место в течение 1-2 дней</p>
      <Link href="/" style={{ padding: '12px 24px', background: '#1d4ed8', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
        На главную
      </Link>
    </main>
  )

  const input = (field: string, placeholder: string, required = false) => (
    <input
      placeholder={placeholder + (required ? ' *' : '')}
      value={(form as any)[field]}
      onChange={e => set(field, e.target.value)}
      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
    />
  )

  const isValid = form.name && form.category_id && (form.city_id && form.city_id !== 'other' || form.custom_city) && agreed

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>← Главная</Link>
      <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '16px 0 8px' }}>Добавить место</h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
        Знаешь хороший хоккейный магазин, заточку или мастерскую? Добавь — поможешь всему сообществу.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
          О месте
        </div>

        {input('name', 'Название места', true)}

        <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}>
          <option value="">Выбери категорию *</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={form.city_id} onChange={e => {
            set('city_id', e.target.value)
            setShowCustomCity(e.target.value === 'other')
            if (e.target.value !== 'other') set('custom_city', '')
          }}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}>
          <option value="">Выбери город *</option>
          {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="other">— Моего города нет в списке</option>
        </select>
        {showCustomCity && input('custom_city', 'Введи название города', true)}

        {input('address', 'Адрес')}
        {input('phone', 'Телефон')}
        {input('website', 'Сайт или Telegram')}
        {input('hours', 'Часы работы (например: Пн-Пт 10:00-20:00)')}

        <textarea
          placeholder="Описание (что особенного, чем полезно)"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none', outline: 'none' }}
        />

        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8', marginTop: '8px' }}>
          О тебе
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',cursor:'pointer'}}
          onClick={()=>setForm(prev=>({...prev,is_network:!prev.is_network}))}>
          <div style={{width:'20px',height:'20px',borderRadius:'6px',border:'2px solid '+(form.is_network?'#1d4ed8':'#e2e8f0'),background:form.is_network?'#1d4ed8':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {form.is_network&&<span style={{color:'white',fontSize:'13px',fontWeight:700}}>✓</span>}
          </div>
          <div>
            <div style={{fontSize:'14px',fontWeight:600}}>🏙️ Сеть магазинов</div>
            <div style={{fontSize:'12px',color:'#94a3b8'}}>У нас несколько точек в разных городах</div>
          </div>
        </div>

        {input('submitter_name', 'Твоё имя')}
        {input('submitter_contact', 'Telegram или email для связи')}

        <div onClick={()=>setAgreed(!agreed)}
          style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',padding:'4px 0'}}>
          <div style={{width:'20px',height:'20px',borderRadius:'6px',border:'2px solid '+(agreed?'#1d4ed8':'#e2e8f0'),background:agreed?'#1d4ed8':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}}>
            {agreed&&<span style={{color:'white',fontSize:'13px',fontWeight:700}}>✓</span>}
          </div>
          <span style={{fontSize:'13px',color:'#374151',lineHeight:1.5}}>
            Я согласен с <a href="/privacy" target="_blank" style={{color:'#1d4ed8'}} onClick={e=>e.stopPropagation()}>политикой конфиденциальности</a> и даю согласие на обработку персональных данных
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          style={{ padding: '14px', borderRadius: '12px', border: 'none', background: isValid ? '#1d4ed8' : '#e2e8f0', color: isValid ? 'white' : '#94a3b8', fontSize: '15px', fontWeight: 600, cursor: isValid ? 'pointer' : 'default', marginTop: '8px' }}
        >
          {loading ? 'Отправляем...' : 'Отправить заявку'}
        </button>

        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          Мы проверим информацию и добавим место в течение 1-2 дней
        </p>
      </div>
    </main>
  )
}
