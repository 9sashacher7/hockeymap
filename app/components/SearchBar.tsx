'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch() {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{display:'flex',gap:'8px'}}>
      <input
        type="text"
        placeholder="Найти заточку, магазин, мастерскую..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        style={{flex:1,padding:'14px 18px',borderRadius:'12px',border:'none',fontSize:'15px',outline:'none',background:'#1e293b',color:'white'}}
      />
      <button
        onClick={handleSearch}
        style={{padding:'14px 24px',background:'#1d4ed8',color:'white',border:'none',borderRadius:'12px',fontSize:'15px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}
      >
        🔍 Найти
      </button>
    </div>
  )
}
