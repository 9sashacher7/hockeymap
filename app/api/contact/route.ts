import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = '8779919362:AAFAZ-uVTwFDIWKZYfJ34kfXVD_TjPvkrtE'
const CHAT_ID = '535618527'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string
  const file = formData.get('file') as File | null

  const text = `📬 Новое сообщение с HockeyMap\n\n👤 Имя: ${name}\n📧 Email: ${email||'—'}\n📌 Тема: ${subject}\n\n💬 Сообщение:\n${message}`

  // Отправляем текст
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
  })

  // Если есть файл — отправляем отдельно
  if (file && file.size > 0) {
    const tgForm = new FormData()
    tgForm.append('chat_id', CHAT_ID)
    tgForm.append('document', file, file.name)
    tgForm.append('caption', `📎 Файл от ${name}`)
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: tgForm
    })
  }

  return NextResponse.json({ ok: true })
}
