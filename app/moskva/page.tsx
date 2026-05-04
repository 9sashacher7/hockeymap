import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MoskvePage() {
  const { data: places } = await supabase
    .from('places')
    .select('*, category:categories(name,slug)')
    .eq('city_id', 1)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })

  return (
    <main style={{maxWidth:'900px',margin:'0 auto',padding:'40px 20px'}}>
      <Link href="/" style={{fontSize:'13px',color:'#64748b',textDecoration:'none'}}>← Главная</Link>
      <h1 style={{fontSize:'48px',fontWeight:900,letterSpacing:'2px',margin:'16px 0 8px'}}>МОСКВА</h1>
      <p style={{color:'#94a3b8',marginBottom:'32px'}}>Хоккейные сервисы города</p>

      {!places || places.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 20px',color:'#94a3b8'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🏒</div>
          <p>Места ещё не добавлены</p>
          <p style={{fontSize:'13px',marginTop:'8px'}}>Добавь первые места через Supabase</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {places.map((place: any) => (
            <div key={place.id} style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'10px',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#1d4ed8',fontSize:'14px',flexShrink:0}}>
                {place.name.slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:'15px'}}>{place.name}</div>
                <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>
                  {place.category?.name}{place.address ? ` · ${place.address}` : ''}
                </div>
              </div>
              {place.rating_avg > 0 && (
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontWeight:600}}>★ {place.rating_avg}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8'}}>{place.rating_count} отз.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
