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
  'internet-magaziny': { name: 'Интернет-магазины',    icon: '🛒', description: 'Онлайн-магазины хоккейной экипировки и инвентаря' },
  'statistika':        { name: 'Статистика и сервисы', icon: '📊', description: 'Сервисы со статистикой, аналитикой и расписаниями' },
  'avito':             { name: 'Авито-магазины',        icon: '📦', description: 'Проверенные магазины на Авито' },
  'poleznoe':          { name: 'Ещё полезное',          icon: '⭐', description: 'Полезные хоккейные ресурсы и сообщества' },
}

export default function OnlineCategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const cat = CAT_INFO[slug]
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyVerified, setOnlyVerified] = useState(false)

  useEffect(() => {
    if (!slug) return
    sq('online_services', 'order=is_featured.desc,is_verified.desc,subscribers_count.desc')
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

  const displayed = onlyVerified ? services.filter(s => s.is_verified) : services
  const verifiedCount = services.filter(s => s.is_verified).length

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>

      <div style={{margin:'24px 0 24px'}}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>{cat.icon}</div>
        <h1 style={{fontSize:'32px',fontWeight:900,marginBottom:'8px'}}>{cat.name}</h1>
        <p style={{color:'#64748b',fontSize:'15px',marginBottom:'16px'}}>{cat.description}</p>

        {!loading && services.length > 0 && (
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <div style={{background:'#eff6ff',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:800,color:'#1d4ed8'}}>{services.length}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>сервисов</div>
            </div>
            {verifiedCount > 0 && (
              <div style={{background:'#f0fdf4',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
                <div style={{fontSize:'22px',fontWeight:800,color:'#16a34a'}}>{verifiedCount}</div>
                <div style={{fontSize:'12px',color:'#64748b'}}>проверено</div>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && services.length > 0 && (
        <div style={{display:'flex',gap:'10px',marginBottom:'24px',alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={() => setOnlyVerified(!onlyVerified)}
            style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid '+(onlyVerified?'#16a34a':'#e2e8f0'),background:onlyVerified?'#f0fdf4':'white',color:onlyVerified?'#16a34a':'#64748b',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>
            {onlyVerified ? '✓ Только проверенные' : 'Только проверенные'}
          </button>
          <a href="/add-online" style={{padding:'8px 16px',background:'#1d4ed8',color:'white',borderRadius:'10px',textDecoration:'none',fontSize:'13px',fontWeight:600,marginLeft:'auto'}}>
            + Добавить сервис
          </a>
        </div>
      )}

      {loading ? (
        <div style={{textAlign:'center',color:'#94a3b8',padding:'60px 0'}}>Загрузка...</div>
      ) : displayed.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚧</div>
          <h2 style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Скоро здесь появятся сервисы</h2>
          <p style={{color:'#94a3b8',fontSize:'14px',marginBottom:'24px'}}>Мы собираем лучшие ресурсы для хоккеистов</p>
          <a href="/add-online" style={{padding:'12px 24px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600}}>+ Добавить</a>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'16px'}}>
          {displayed.map((s: any) => (
            <a key={s.id} href={s.url || '#'} target="_blank" rel="noopener noreferrer"
              style={{border:'1px solid '+(s.is_featured?'#fde68a':s.is_verified?'#bbf7d0':'#e2e8f0'),borderRadius:'14px',padding:'20px',textDecoration:'none',color:'inherit',display:'flex',flexDirection:'column',background:'white',borderLeft:'4px solid '+(s.is_featured?'#f59e0b':s.is_verified?'#16a34a':'#e2e8f0'),transition:'box-shadow 0.15s'}}
              onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={e=>(e.currentTarget.style.boxShadow='none')}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px',gap:'8px'}}>
                <div style={{fontWeight:700,fontSize:'16px'}}>{s.name}</div>
                <div style={{display:'flex',flexDirection:'column',gap:'4px',flexShrink:0}}>
                  {s.is_featured && <span style={{background:'#fef9c3',color:'#854d0e',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>⭐ Топ</span>}
                  {s.is_verified && <span style={{background:'#dcfce7',color:'#16a34a',borderRadius:'6px',padding:'2px 8px',fontSize:'11px',fontWeight:700}}>✓ Проверено</span>}
                </div>
              </div>
              {s.description && <p style={{fontSize:'13px',color:'#64748b',margin:'0 0 12px',lineHeight:'1.6',flex:1}}>{s.description}</p>}
              <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'12px'}}>
                {s.city&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Город:</span> {s.city}</div>}
                {s.specialization&&<div style={{fontSize:'13px',color:'#64748b'}}><span style={{fontWeight:700,color:'#0f172a'}}>Специализация:</span> {s.specialization}</div>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'auto',paddingTop:'12px',borderTop:'1px solid #f1f5f9'}}>
                {s.subscribers_count
                  ? <span style={{fontSize:'12px',color:'#94a3b8'}}>👥 {s.subscribers_count.toLocaleString('ru-RU')}</span>
                  : <span/>
                }
                {s.url && <span style={{fontSize:'13px',color:'#1d4ed8',fontWeight:600}}>Перейти →</span>}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
