'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function sq(table: string, params = '') {
  const res = await fetch(`${SURL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` }
  })
  return res.json()
}

const CAT_INFO: Record<string, { name: string; icon: string; description: string }> = {
  'baraholki':         { name: 'Барахолки',            icon: '🔄', description: 'Купи и продай хоккейную экипировку' },
  'internet-magaziny': { name: 'Интернет-магазины',    icon: '🛒', description: 'Онлайн-магазины хоккейной экипировки' },
  'statistika':        { name: 'Статистика и сервисы', icon: '📊', description: 'Сервисы со статистикой и расписаниями' },
  'avito':             { name: 'Авито-магазины',        icon: '📦', description: 'Проверенные магазины на Авито' },
  'poleznoe':          { name: 'Ещё полезное',          icon: '⭐', description: 'Полезные хоккейные ресурсы' },
}

export default function OnlineCategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const cat = CAT_INFO[slug]
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    sq('online_services', 'order=is_featured.desc&order=subscribers_count.desc')
      .then((data: any[]) => {
        const filtered = Array.isArray(data)
          ? data.filter((s: any) => !s.category_slug || s.category_slug === slug)
          : []
        setServices(filtered)
        setLoading(false)
      })
  }, [slug])

  if (!cat) return (
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'80px 20px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
      <h1 style={{fontSize:'24px',fontWeight:700}}>Раздел не найден</h1>
      <Link href="/" style={{color:'#1d4ed8',textDecoration:'none',marginTop:'16px',display:'inline-block'}}>← На главную</Link>
    </main>
  )

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <div style={{margin:'24px 0 32px'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>{cat.icon}</div>
        <h1 style={{fontSize:'32px',fontWeight:900,marginBottom:'8px'}}>{cat.name}</h1>
        <p style={{color:'#64748b',fontSize:'15px'}}>{cat.description}</p>
      </div>
      {loading ? (
        <div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0'}}>Загрузка...</div>
      ) : services.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚧</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Скоро здесь появятся сервисы</h2>
          <p style={{color:'#94a3b8',fontSize:'14px'}}>Мы собираем лучшие ресурсы для хоккеистов</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'16px'}}>
          {services.map((s: any) => (
            <a key={s.id} href={s.url||'#'} target="_blank" rel="noopener noreferrer"
              style={{border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',textDecoration:'none',color:'inherit',display:'block',background:'white'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                <div style={{fontWeight:700,fontSize:'16px'}}>{s.name}</div>
                {s.is_verified && <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:600,marginLeft:'8px'}}>✓ Проверено</span>}
              </div>
              {s.description && <p style={{fontSize:'13px',color:'#64748b',margin:'0 0 12px',lineHeight:'1.5'}}>{s.description}</p>}
              <div style={{display:'flex',gap:'8px'}}>
                {s.subscribers_count && <span style={{fontSize:'12px',color:'#94a3b8'}}>👥 {s.subscribers_count.toLocaleString('ru-RU')}</span>}
                {s.url && <span style={{fontSize:'12px',color:'#1d4ed8'}}>Перейти →</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
