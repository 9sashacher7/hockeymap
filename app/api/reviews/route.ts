import { NextRequest, NextResponse } from 'next/server'

const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
              req.headers.get('x-real-ip') || 'unknown'
  
  const body = await req.json()

  // Проверяем был ли отзыв с этого IP за последние 24 часа
  if (ip !== 'unknown') {
    const since = new Date(Date.now() - 24*60*60*1000).toISOString()
    const checkRes = await fetch(
      `${SURL}/rest/v1/reviews?ip_address=eq.${ip}&created_at=gte.${since}&select=id&limit=1`,
      { headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}` } }
    )
    const existing = await checkRes.json()
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Вы уже оставляли отзыв сегодня' }, { status: 429 })
    }
  }

  // Сохраняем отзыв с IP
  const res = await fetch(`${SURL}/rest/v1/reviews`, {
    method: 'POST',
    headers: { 
      apikey: SKEY, 
      Authorization: `Bearer ${SKEY}`, 
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ ...body, ip_address: ip })
  })

  if (res.ok) return NextResponse.json({ ok: true })
  return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
}
