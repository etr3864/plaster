# WhatsApp AI Agent

סוכן WhatsApp מבוסס OpenAI שעובד דרך WA Sender.

## תכונות

- קבלת הודעות מלקוחות ב-WhatsApp (טקסט, תמונות, הודעות קוליות)
- נורמליזציה של הודעות למבנה אחיד
- כיווץ (batching) של הודעות רצופות
- שמירת הקשר שיחה (30-40 הודעות אחרונות)
- אינטגרציה עם OpenAI לתשובות חכמות
- תגובה אנושית עם delay אקראי

## מבנה הפרויקט

```
src/
  server.ts           # נקודת כניסה לשרת
  config.ts           # קונפיגורציה מרכזית
  
  prompts/
    system_prompt.txt # System Prompt לסוכן (ניתן לעדכן בלי לגעת בקוד)
  
  types/              # TypeScript types
    normalized.ts     # טייפים מנורמלים
    whatsapp.ts       # טייפים של WA Sender
    openai.ts         # טייפים של OpenAI
  
  utils/              # כלים עזר
    logger.ts         # מערכת לוגים
    time.ts           # פונקציות זמן
  
  wa/                 # אינטגרציה עם WhatsApp
    webhookHandler.ts # טיפול ב-webhook
    normalize.ts      # נורמליזציה של הודעות
    decryptMedia.ts   # פענוח מדיה
    sendMessage.ts    # שליחת הודעות
  
  buffer/             # מנגנון batching
    bufferManager.ts  # ניהול באפרים וטיימרים
  
  conversation/       # ניהול שיחה
    historyManager.ts # ניהול היסטוריה
    buildPrompt.ts    # בניית prompt ל-OpenAI
  
  openai/             # תקשורת עם OpenAI
    client.ts         # OpenAI client
```

## התקנה

1. התקן תלויות:
```bash
npm install
```

2. צור קובץ `.env` (העתק מ-`.env.example`):
```bash
cp .env.example .env
```

3. מלא את המשתנים ב-`.env`:
- `WA_SENDER_BASE_URL` - ברירת מחדל: `https://wasenderapi.com/api`
- `WA_SENDER_API_KEY` - API Key שקיבלת מ-WA Sender
- `WA_SENDER_WEBHOOK_SECRET` - Webhook Secret שקיבלת מ-WA Sender
- `OPENAI_API_KEY` - API Key של OpenAI

## הרצה

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Endpoints

- `GET /health` - בדיקת תקינות
- `POST /webhook/whatsapp` - webhook לקבלת הודעות מ-WA Sender

## עדכון System Prompt

ערוך את הקובץ `src/prompts/system_prompt.txt` ואתחל מחדש את השרת.

## לוגים

כל הלוגים הם ב-JSON format ובאנגלית, עם המבנה הבא:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "INFO|DEBUG|WARN|ERROR",
  "message": "Message text",
  "context": {
    // Additional context
  }
}
```

## ארכיטקטורה

הפרויקט בנוי בגישת **Separation of Concerns**:

- כל תיקייה אחראית על תחום אחד
- פונקציות קטנות וברורות
- TypeScript strict mode
- ESLint + Prettier

## זרימת עבודה

1. הודעה נכנסת ל-webhook
2. נורמליזציה של ההודעה
3. פענוח מדיה (אם יש)
4. הוספה לבאפר
5. כשהטיימר מסתיים - batch נשלח ל-conversation handler
6. בניית prompt (system + history + batch)
7. שליחה ל-OpenAI
8. קבלת תשובה
9. עדכון היסטוריה
10. שליחת תשובה חזרה ללקוח (עם delay אנושי)

## License

ISC

