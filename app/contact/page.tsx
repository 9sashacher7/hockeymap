'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Идея для сайта', message: '' })
  const [file, setFile] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.message) return
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('subject', form.subject)
    formData.append('message', form.message)
    if (file) formData.append('file', file)

    const res = await fetch('/api/contact', { method: 'POST', body: formData })
    setLoading(false)
    if (res.ok) setDone(true)
    else setError('Ошибка отправки, попробуй ещё раз')
  }

  const inp = { width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid #e2e8f0', fontSize:'14px', outline:'none', boxSizing:'border-box' as const }

  if (done) return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'80px 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>✅</div>
      <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'12px'}}>Сообщение отправлено!</h2>
      <p style={{color:'#64748b',marginBottom:'32px'}}>Мы получили твоё сообщение и скоро ответим</p>
      <Link href="/" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>На главную</Link>
    </main>
  )

  return (
    <main style={{maxWidth:'600px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'32px',fontWeight:900,margin:'16px 0 8px'}}>Написать нам</h1>
      <p style={{color:'#64748b',marginBottom:'32px',fontSize:'14px'}}>Есть идея, предложение или нашёл ошибку? Пиши — читаем всё.</p>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <input placeholder="Имя *" value={form.name} onChange={e=>set('name',e.target.value)} style={inp} />
        <input placeholder="Email (для ответа)" value={form.email} onChange={e=>set('email',e.target.value)} style={inp} />

        <select value={form.subject} onChange={e=>set('subject',e.target.value)} style={inp}>
          <option>Идея для сайта</option>
          <option>Предложение сотрудничества</option>
          <option>Сообщить об ошибке</option>
          <option>Другое</option>
        </select>

        <textarea placeholder="Текст сообщения *" value={form.message} onChange={e=>set('message',e.target.value)} rows={5}
          style={{...inp,resize:'none'}} />

        <div>
          <label style={{fontSize:'13px',color:'#64748b',display:'block',marginBottom:'6px'}}>Прикрепить файл (необязательно)</label>
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}
            style={{fontSize:'13px',color:'#64748b'}} />
        </div>

        {error && <div style={{color:'#dc2626',fontSize:'13px'}}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading||!form.name||!form.message}
          style={{padding:'14px',borderRadius:'12px',border:'none',background:(form.name&&form.message)?'#1d4ed8':'#e2e8f0',color:(form.name&&form.message)?'white':'#94a3b8',fontSize:'15px',fontWeight:600,cursor:(form.name&&form.message)?'pointer':'default',marginTop:'8px'}}>
          {loading?'Отправляем...':'Отправить'}
        </button>
      </div>
    </main>
  )
}
