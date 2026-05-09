'use client'
import { useState } from 'react'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_PASSWORD = 'hockey2025'

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

async function sbPost(table: string, data: any) {
  const res = await fetch(`${SURL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data)
  })
  return res.ok
}

async function sbDelete(table: string, id: number) {
  const res = await fetch(`${SURL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.ok
}

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/[а-яё]/g, (c: string) => ({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'} as any)[c] || c)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function loadData() {
    const [subs, cityList, catList] = await Promise.all([
      sq('submissions', 'order=created_at.desc'),
      sq('cities', 'order=name'),
      sq('categories', 'order=name'),
    ])
    setSubmissions(Array.isArray(subs) ? subs : [])
    setCities(Array.isArray(cityList) ? cityList : [])
    setCategories(Array.isArray(catList) ? catList : [])
  }

  function login() {
    if (password === ADMIN_PASSWORD) { setAuth(true); loadData() }
    else setMessage('Неверный пароль')
  }

  async function approve(sub: any) {
    setLoading(true)
    const ok = await sbPost('places', {
      name: sub.name, slug: slugify(sub.name) + '-' + sub.id,
      city_id: sub.city_id, category_id: sub.category_id,
      address: sub.address || null, phone: sub.phone || null,
      website: sub.website || null, hours: sub.hours ? { info: sub.hours } : null,
      description: sub.description || null,
      is_online: false, is_verified: true, is_featured: false, rating_avg: 0, rating_count: 0,
    })
    if (ok) { await sbDelete('submissions', sub.id); setMessage(`✅ "${sub.name}" добавлено`); loadData() }
    else setMessage('❌ Ошибка')
    setLoading(false)
  }

  async function reject(sub: any) {
    if (!confirm(`Удалить заявку "${sub.name}"?`)) return
    setLoading(true)
    await sbDelete('submissions', sub.id)
    setMessage(`🗑 Удалено`); loadData(); setLoading(false)
  }

  const getCityName = (id: number) => cities.find(c => c.id === id)?.name || id
  const getCatName = (id: number) => categories.find(c => c.id === id)?.name || id

  if (!auth) return (
    <main style={{maxWidth:'400px',margin:'100px auto',padding:'0 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h1 style={{fontSize:'24px',fontWeight:800,marginBottom:'24px'}}>Админ-панель</h1>
      <input type="password" placeholder="Пароль" value={password}
        onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && login()}
        style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'15px',boxSizing:'border-box',marginBottom:'12px',outline:'none'}} />
      <button onClick={login}
        style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'#1d4ed8',color:'white',fontSize:'15px',fontWeight:600,cursor:'pointer'}}>
        Войти
      </button>
      {message && <p style={{color:'red',marginTop:'12px',fontSize:'14px'}}>{message}</p>}
    </main>
  )

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
        <h1 style={{fontSize:'28px',fontWeight:800}}>🏒 Заявки</h1>
        <span style={{background:'#f1f5f9',borderRadius:'20px',padding:'4px 14px',fontSize:'13px',color:'#64748b'}}>{submissions.length} заявок</span>
      </div>
      {message && <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'12px 16px',marginBottom:'24px',fontSize:'14px',color:'#166534'}}>{message}</div>}
      {submissions.length === 0
        ? <div style={{textAlign:'center',color:'#94a3b8',padding:'80px 0'}}>Новых заявок нет</div>
        : submissions.map((sub: any) => (
          <div key={sub.id} style={{border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',background:'white',marginBottom:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:'16px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                  <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 10px',fontSize:'12px',fontWeight:600}}>{getCatName(sub.category_id)}</span>
                  <span style={{background:'#f1f5f9',color:'#475569',borderRadius:'6px',padding:'2px 10px',fontSize:'12px'}}>{getCityName(sub.city_id)}</span>
                </div>
                <div style={{fontWeight:700,fontSize:'18px',marginBottom:'8px'}}>{sub.name}</div>
                <div style={{fontSize:'13px',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
                  {sub.address && <span>📍 {sub.address}</span>}
                  {sub.phone && <span>📞 {sub.phone}</span>}
                  {sub.website && <span>🌐 {sub.website}</span>}
                  {sub.hours && <span>🕐 {sub.hours}</span>}
                  {sub.description && <span>💬 {sub.description}</span>}
                </div>
                {(sub.submitter_name || sub.submitter_contact) && (
                  <div style={{marginTop:'12px',padding:'8px 12px',background:'#f8fafc',borderRadius:'8px',fontSize:'12px',color:'#94a3b8'}}>
                    От: {sub.submitter_name || '—'} {sub.submitter_contact ? `· ${sub.submitter_contact}` : ''}
                  </div>
                )}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
                <button onClick={() => approve(sub)} disabled={loading}
                  style={{padding:'10px 20px',borderRadius:'10px',border:'none',background:'#16a34a',color:'white',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>
                  ✓ Одобрить
                </button>
                <button onClick={() => reject(sub)} disabled={loading}
                  style={{padding:'10px 20px',borderRadius:'10px',border:'1px solid #fca5a5',background:'white',color:'#dc2626',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>
                  ✕ Отклонить
                </button>
              </div>
            </div>
            <div style={{fontSize:'11px',color:'#cbd5e1',marginTop:'12px'}}>{new Date(sub.created_at).toLocaleString('ru-RU')}</div>
          </div>
        ))
      }
    </main>
  )
}
