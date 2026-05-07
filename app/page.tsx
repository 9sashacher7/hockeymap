import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HomePage() {
  const { data: cities } = await supabase.from('cities').select('*').order('name')
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <main>
      <section style={{background:'#0f172a',color:'white',padding:'80px 20px',textAlign:'center'}}>
        <span style={{fontSize:'12px',fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'#60a5fa',background:'#1e3a5f',padding:'4px 16px',borderRadius:'20px',display:'inline-block',marginBottom:'24px'}}>
          Навигатор хоккейных сервисов России
        </span>
        <h1 style={{fontSize:'72px',fontWeight:900,letterSpacing:'4px',margin:'0 0 16px'}}>
          HOCKEY<span style={{color:'#60a5fa'}}>MAP</span>
        </h1>
        <p style={{color:'#94a3b8',fontSize:'18px',marginBottom:'40px'}}>
          Магазины, заточки, мастерские — найди нужное в своём городе
        </p>
        <div style={{display:'flex',justifyContent:'center',gap:'12px',flexWrap:'wrap'}}>
          {cities?.map((city: any) => (
            <Link key={city.slug} href={`/${city.slug}`} style={{padding:'10px 20px',background:'#1e293b',color:'white',borderRadius:'20px',textDecoration:'none',fontSize:'14px'}}>
              {city.name}
            </Link>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:'48px',marginTop:'48px'}}>
          <div><div style={{fontSize:'36px',fontWeight:900}}>340+</div><div style={{color:'#64748b',fontSize:'12px'}}>мест в базе</div></div>
          <div><div style={{fontSize:'36px',fontWeight:900}}>{cities?.length ?? 0}</div><div style={{color:'#64748b',fontSize:'12px'}}>городов</div></div>
          <div><div style={{fontSize:'36px',fontWeight:900}}>1200+</div><div style={{color:'#64748b',fontSize:'12px'}}>отзывов</div></div>
        </div>
      </section>

      <section style={{maxWidth:'900px',margin:'0 auto',padding:'48px 20px'}}>
        <h2 style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#94a3b8',marginBottom:'24px'}}>
          Разделы
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
          {categories?.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',cursor:'pointer',textDecoration:'none',color:'inherit',display:'block'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{catEmoji(cat.slug)}</div>
              <div style={{fontWeight:600,fontSize:'14px'}}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

function catEmoji(slug: string) {
  const m: Record<string,string> = {magaziny:'🏪',zatochka:'⚙️',masterskie:'🔧',katki:'🧊'}
  return m[slug] ?? '📍'
}
