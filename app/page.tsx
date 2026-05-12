import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import SearchBar from './components/SearchBar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function catEmoji(slug: string) {
  const m: Record<string,string> = {magaziny:'🏪',zatochka:'⚙️',masterskie:'🔧',katki:'🧊'}
  return m[slug] ?? '📍'
}

const ONLINE_CATS = [
  { slug: 'baraholki', name: 'Барахолки', icon: '🔄' },
  { slug: 'internet-magaziny', name: 'Интернет-магазины', icon: '🛒' },
  { slug: 'statistika', name: 'Статистика и сервисы', icon: '📊' },
  { slug: 'avito', name: 'Авито-магазины', icon: '📦' },
  { slug: 'poleznoe', name: 'Ещё полезное', icon: '⭐' },
]

const PEOPLE_CATS = [
  { slug: 'trenery', name: 'Тренеры', icon: '👤' },
  { slug: 'shkoly', name: 'Хоккейные школы и секции', icon: '🎓' },
  { slug: 'sbory', name: 'Сборы и лагеря', icon: '📋' },
]

const FEATURED_CITIES = [
  'moskva', 'spb', 'ekaterinburg', 'kazan',
  'novosibirsk', 'omsk', 'ufa', 'perm',
  'chelyabinsk', 'rostov', 'voronezh', 'volgograd',
  'krasnodar', 'irkutsk', 'khabarovsk', 'nizhniy-novgorod',
  'samara', 'saratov'
]

export default async function HomePage() {
  const [
    { data: allCities },
    { data: categories },
    { count: placesCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from('cities').select('*').order('name'),
    supabase.from('categories').select('*'),
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  const featuredCities = allCities?.filter(c => FEATURED_CITIES.includes(c.slug)) ?? []

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
        <div style={{display:'flex',justifyContent:'center',gap:'12px',flexWrap:'wrap',maxWidth:'900px',margin:'0 auto'}}>
          {featuredCities.map((city: any) => (
            <Link key={city.slug} href={`/city/${city.slug}`}
              style={{padding:'10px 20px',background:'#1e293b',color:'white',borderRadius:'20px',textDecoration:'none',fontSize:'14px'}}>
              {city.name}
            </Link>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:'48px',marginTop:'48px'}}>
          <div>
            <div style={{fontSize:'36px',fontWeight:900}}>{placesCount ?? 0}</div>
            <div style={{fontSize:'12px',color:'#64748b',marginTop:'4px'}}>мест в базе</div>
          </div>
          <div>
            <div style={{fontSize:'36px',fontWeight:900}}>{allCities?.length ?? 0}</div>
            <div style={{fontSize:'12px',color:'#64748b',marginTop:'4px'}}>городов</div>
          </div>
          <div>
            <div style={{fontSize:'36px',fontWeight:900}}>{reviewsCount ?? 0}</div>
            <div style={{fontSize:'12px',color:'#64748b',marginTop:'4px'}}>отзывов</div>
          </div>
        </div>

        {/* Строка поиска */}
        <div style={{maxWidth:'560px',margin:'32px auto 0'}}>
          <SearchBar />
        </div>
      </section>

      {/* Офлайн сервисы */}
      <section style={{maxWidth:'900px',margin:'0 auto',padding:'48px 20px 24px'}}>
        <h2 style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#94a3b8',marginBottom:'24px'}}>
          Офлайн сервисы
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
          {categories?.map((cat: any) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}
              style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',cursor:'pointer',textDecoration:'none',color:'inherit',display:'block'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{catEmoji(cat.slug)}</div>
              <div style={{fontWeight:600,fontSize:'14px'}}>{cat.name}</div>
            </Link>
          ))}
        </div>
              <div style={{textAlign:"center",marginTop:"16px"}}>
          <a href="/add" style={{fontSize:"15px",fontWeight:600,color:"white",textDecoration:"none",background:"#0f4c8a",padding:"12px 28px",borderRadius:"12px",display:"inline-block"}}>
            + Добавить место
          </a>
        </div>
      </section>

      {/* Онлайн сервисы */}
      <section style={{maxWidth:'900px',margin:'0 auto',padding:'24px 20px'}}>
        <h2 style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#94a3b8',marginBottom:'24px'}}>
          Онлайн сервисы
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
          {ONLINE_CATS.map((cat) => (
            <Link key={cat.slug} href={`/online/${cat.slug}`}
              style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',cursor:'pointer',textDecoration:'none',color:'inherit',display:'block'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{cat.icon}</div>
              <div style={{fontWeight:600,fontSize:'14px'}}>{cat.name}</div>
            </Link>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:'16px'}}>
          <a href="/add-online" style={{fontSize:'15px',fontWeight:600,color:'white',textDecoration:'none',background:'#0f4c8a',padding:'12px 28px',borderRadius:'12px',display:'inline-block'}}>
            + Добавить сервис
          </a>
        </div>
      </section>

      {/* Люди и обучение */}
      <section style={{maxWidth:'900px',margin:'0 auto',padding:'24px 20px 48px'}}>
        <h2 style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'#94a3b8',marginBottom:'24px'}}>
          Люди и обучение
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          {PEOPLE_CATS.map((cat) => (
            <Link key={cat.slug} href={`/people/${cat.slug}`}
              style={{border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',cursor:'pointer',textDecoration:'none',color:'inherit',display:'block',background:'#f8fafc'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{cat.icon}</div>
              <div style={{fontWeight:600,fontSize:'14px'}}>{cat.name}</div>
            </Link>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:'16px'}}>
          <a href="/add-people" style={{fontSize:'15px',fontWeight:600,color:'white',textDecoration:'none',background:'#0f4c8a',padding:'12px 28px',borderRadius:'12px',display:'inline-block'}}>
            + Добавить карточку
          </a>
        </div>
      </section>

      {/* Обратная связь */}
      <section style={{background:'#0f172a',padding:'48px 20px',textAlign:'center'}}>
        <div style={{maxWidth:'600px',margin:'0 auto'}}>
          <div style={{fontSize:'32px',marginBottom:'16px'}}>💬</div>
          <h2 style={{fontSize:'24px',fontWeight:800,color:'white',marginBottom:'12px'}}>Есть идея или предложение?</h2>
          <p style={{color:'#94a3b8',marginBottom:'28px',fontSize:'15px'}}>Помоги сделать HockeyMap лучше — напиши нам</p>
          <a href="/contact" style={{display:'inline-block',padding:'14px 32px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600,fontSize:'15px'}}>
            ✉️ Написать нам
          </a>
        </div>
      </section>
    </main>
  )
}
