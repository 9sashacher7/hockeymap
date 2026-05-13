'use client'
import { useState } from 'react'
import Link from 'next/link'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

const CATS = [
  { slug: 'baraholki', name: 'Барахолки' },
  { slug: 'internet-magaziny', name: 'Интернет-магазины' },
  { slug: 'statistika', name: 'Статистика и сервисы' },
  { slug: 'avito', name: 'Авито-магазины' },
  { slug: 'poleznoe', name: 'Ещё полезное' },
]

export default function AddOnlinePage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    name: '', category_slug: '', url: '', description: '',
    city: '', phone: '', social: '',
    submitter_name: '', submitter_contact: '',
    delivery: '', payment: '', specialization: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.category_slug || !form.url) return
    setLoading(true)
    const ok = await post('online_submissions', form)
    setLoading(false)
    if (ok) setDone(true)
  }

  const isValid = form.name && form.category_slug && form.url && agreed

  const input = (field: string, placeholder: string, required = false) => (
    <input
      placeholder={placeholder + (required ? ' *' : '')}
      value={(form as any)[field]}
      onChange={e => set(field, e.target.value)}
      style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box',outline:'none'}}
    />
  )

  if (done) return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'80px 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'12px'}}>Заявка отправлена!</h2>
      <p style={{color:'#64748b',marginBottom:'32px'}}>Мы проверим и добавим сервис в течение 1-2 дней</p>
      <Link href="/" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>
        На главную
      </Link>
    </main>
  )

  return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'32px',fontWeight:900,margin:'16px 0 8px'}}>Добавить сервис</h1>
      <p style={{color:'#64748b',marginBottom:'32px',fontSize:'14px'}}>
        Знаешь полезный онлайн-ресурс для хоккеистов? Добавь — поможешь всему сообществу.
      </p>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8'}}>
          О сервисе
        </div>

        {input('name', 'Название', true)}

        <select value={form.category_slug} onChange={e => set('category_slug', e.target.value)}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
          <option value="">Выбери категорию *</option>
          {CATS.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>

        {input('url', 'Ссылка на сайт', true)}
        {form.category_slug === 'internet-magaziny' && <>
          {input('city', 'Город')}
          {input('phone', 'Телефон')}
          {input('social', 'Социальные сети (ссылка)')}
        </>}
        {form.category_slug === 'avito' && <>
          {input('city', 'Город магазина')}
          <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Доставка</option>
            <option value="По всей России">По всей России</option>
            <option value="По городу">По городу</option>
            <option value="Только самовывоз">Только самовывоз</option>
          </select>
          <select value={form.payment} onChange={e => set('payment', e.target.value)}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Способ оплаты</option>
            <option value="Наличные">Наличные</option>
            <option value="Карта">Карта</option>
            <option value="Перевод">Перевод</option>
            <option value="Любой способ">Любой способ</option>
          </select>
          <select value={form.specialization} onChange={e => set('specialization', e.target.value)}
            style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',outline:'none'}}>
            <option value="">Специализация (что продаёте)</option>
            <option value="Всё для хоккея">Всё для хоккея</option>
            <option value="Коньки">Коньки</option>
            <option value="Клюшки">Клюшки</option>
            <option value="Форма и защита">Форма и защита</option>
            <option value="Вратарское">Вратарское</option>
            <option value="Детское">Детское</option>
          </select>
        </>}

        <textarea
          placeholder="Описание"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'14px',resize:'none',outline:'none'}}
        />

        <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'#94a3b8',marginTop:'8px'}}>
          О тебе
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
          style={{padding:'14px',borderRadius:'12px',border:'none',background:isValid?'#1d4ed8':'#e2e8f0',color:isValid?'white':'#94a3b8',fontSize:'15px',fontWeight:600,cursor:isValid?'pointer':'default',marginTop:'8px'}}
        >
          {loading ? 'Отправляем...' : 'Отправить заявку'}
        </button>

        <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center'}}>
          Мы проверим информацию и добавим сервис в течение 1-2 дней
        </p>
      </div>
    </main>
  )
}
