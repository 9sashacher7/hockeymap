export default function PrivacyPage() {
  return (
    <main style={{maxWidth:'720px',margin:'0 auto',padding:'40px 20px',fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:900,marginBottom:'8px'}}>Политика конфиденциальности</h1>
      <p style={{color:'#94a3b8',fontSize:'13px',marginBottom:'32px'}}>Последнее обновление: май 2025</p>

      <h2 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>1. Какие данные мы собираем</h2>
      <p style={{color:'#374151',lineHeight:1.7,marginBottom:'24px'}}>При подаче заявки на добавление места мы собираем: имя заявителя и контактные данные (Telegram или email). Эти данные предоставляются добровольно и используются исключительно для связи с заявителем при обработке заявки.</p>

      <h2 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>2. Как мы используем данные</h2>
      <p style={{color:'#374151',lineHeight:1.7,marginBottom:'24px'}}>Данные используются только для проверки и обработки заявок. Мы не передаём их третьим лицам, не используем в рекламных целях и не храним дольше необходимого.</p>

      <h2 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>3. Хранение данных</h2>
      <p style={{color:'#374151',lineHeight:1.7,marginBottom:'24px'}}>Данные хранятся на защищённых серверах Supabase. После обработки заявки контактные данные заявителя удаляются.</p>

      <h2 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>4. Ваши права</h2>
      <p style={{color:'#374151',lineHeight:1.7,marginBottom:'24px'}}>Вы можете запросить удаление ваших данных в любой момент, написав нам. Мы удалим их в течение 3 рабочих дней.</p>

      <h2 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px'}}>5. Контакты</h2>
      <p style={{color:'#374151',lineHeight:1.7,marginBottom:'24px'}}>По вопросам обработки персональных данных: hockeymap.ru@gmail.com</p>

      <a href="/" style={{color:'#1d4ed8',textDecoration:'none',fontSize:'14px'}}>← На главную</a>
    </main>
  )
}
