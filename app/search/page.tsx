'use client'
import { useState, useEffect, use } from 'react'
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

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = use(searchParams)
  const router = useRouter()
  const [query, setQuery] = useState(q ?? '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (q) search(q)
  }, [q])

  async function search(text: string) {
    if (!text.trim()) return
    setLoading(true)
    setSearched(true)
    const q = encodeURIComponent(text)
    const [places, services, coaches, schools, camps] = await Promise.all([
      sq('places', `select=*,city:cities(name,slug),category:categories(name,slug)&or=(name.ilike.*${q}*,address.ilike.*${q}*,description.ilike.*${q}*)&order=rating_avg.desc&limit=20`),
      sq('online_services', `select=*&or=(name.ilike.*${q}*,description.ilike.*${q}*)&limit=10`),
      sq('coaches', `select=*,city:cities(name,slug)&or=(name.ilike.*${q}*,description.ilike.*${q}*,specialization.ilike.*${q}*)&limit=10`),
      sq('hockey_schools', `select=*,city:cities(name,slug)&or=(name.ilike.*${q}*,description.ilike.*${q}*)&limit=10`),
      sq('hockey_camps', `select=*,city:cities(name,slug)&or=(name.ilike.*${q}*,description.ilike.*${q}*)&limit=10`),
    ])
    const all = [
      ...(Array.isArray(places)?places:[]).map(p=>({...p,_type:'place'})),
      ...(Array.isArray(services)?services:[]).map(s=>({...s,_type:'service'})),
      ...(Array.isArray(coaches)?coaches:[]).map(c=>({...c,_type:'coach'})),
      ...(Array.isArray(schools)?schools:[]).map(s=>({...s,_type:'school'})),
      ...(Array.isArray(camps)?camps:[]).map(c=>({...c,_type:'camp'})),
    ]
    setResults(all)
    setLoading(false)
  }

  function handleSearch() {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>← Главная</Link>
      <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '16px 0 24px' }}>Поиск</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input
          type="text"
          placeholder="Например: заточка Москва, хоккейный магазин СПБ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none' }}
        />
        <button onClick={handleSearch}
          style={{ padding: '12px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Найти
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Ищем...</div>}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏒</div>
          <p>Ничего не найдено — попробуй другой запрос</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>Найдено: {results.length} мест</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((item: any) => {
              const typeLabel = item._type==='place'?item.category?.name:item._type==='service'?'Онлайн сервис':item._type==='coach'?'Тренер':item._type==='school'?'Хоккейная школа':'Лагерь'
              const typeColor = item._type==='place'?'#eff6ff':item._type==='service'?'#f0fdf4':item._type==='coach'?'#fef9c3':item._type==='school'?'#f0f9ff':'#fff7ed'
              const typeText = item._type==='place'?'#1d4ed8':item._type==='service'?'#16a34a':item._type==='coach'?'#854d0e':item._type==='school'?'#0369a1':'#c2410c'
              const href = item._type==='place'?`/category/${item.category?.slug}`:item._type==='service'?`/online/${item.category_slug}`:item._type==='coach'?`/people/trenery`:item._type==='school'?`/people/shkoly`:`/people/sbory`
              return (
              <a key={item._type+item.id} href={href} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 18px',border:'1px solid #e2e8f0',borderRadius:'14px',textDecoration:'none',color:'inherit'}}>
                <div style={{width:'42px',height:'42px',borderRadius:'10px',background:typeColor,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:typeText,fontSize:'13px',flexShrink:0}}>
                  {item.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:'15px'}}>{item.name}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>
                    <span style={{background:typeColor,color:typeText,borderRadius:'4px',padding:'1px 6px',fontSize:'11px',fontWeight:600,marginRight:'6px'}}>{typeLabel}</span>
                    {item.city?.name}{item.address?` · ${item.address}`:''}
                  </div>
                  {item.phone&&<div style={{fontSize:'12px',marginTop:'2px',color:'#1d4ed8'}}>📞 {item.phone}</div>}
                </div>
                {item.rating_avg>0&&(
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontWeight:600}}>★ {item.rating_avg}</div>
                    <div style={{fontSize:'12px',color:'#94a3b8'}}>{item.rating_count} отз.</div>
                  </div>
                )}
              </a>
            )})}
          </div>
        </div>
      )}
    </main>
  )
}
