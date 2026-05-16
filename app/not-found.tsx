import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'20px'}}>
      <div>
        <div style={{fontSize:'64px',marginBottom:'16px'}}>🏒</div>
        <h1 style={{fontSize:'48px',fontWeight:900,marginBottom:'8px'}}>404</h1>
        <p style={{fontSize:'18px',color:'#64748b',marginBottom:'32px'}}>Такой страницы нет — шайба улетела не туда</p>
        <Link href="/" style={{padding:'14px 32px',background:'#1d4ed8',color:'white',borderRadius:'12px',textDecoration:'none',fontWeight:600,fontSize:'16px'}}>
          На главную
        </Link>
      </div>
    </main>
  )
}
