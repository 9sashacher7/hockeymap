'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
    }
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc'}}>
      <div style={{background:'white',padding:'40px',borderRadius:'16px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',width:'100%',maxWidth:'360px'}}>
        <div style={{fontSize:'32px',textAlign:'center',marginBottom:'8px'}}>🏒</div>
        <h1 style={{fontSize:'20px',fontWeight:700,textAlign:'center',marginBottom:'24px'}}>Вход в админку</h1>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:`1px solid ${error?'#fca5a5':'#e2e8f0'}`,fontSize:'15px',boxSizing:'border-box',outline:'none',marginBottom:'12px'}}
        />
        {error && <div style={{color:'#dc2626',fontSize:'13px',marginBottom:'8px'}}>Неверный пароль</div>}
        <button onClick={handleLogin}
          style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'#1d4ed8',color:'white',fontSize:'15px',fontWeight:600,cursor:'pointer'}}>
          Войти
        </button>
      </div>
    </main>
  )
}
