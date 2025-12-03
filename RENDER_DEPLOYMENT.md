# 🚀 Render Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1️⃣ משתני סביבה (Environment Variables)

בRender, הוסף את כל המשתנים הבאים:

#### 🔐 WhatsApp & OpenAI (חובה!)
```bash
WA_SENDER_BASE_URL=https://wasenderapi.com/api
WA_SENDER_API_KEY=your_api_key_here
WA_SENDER_WEBHOOK_SECRET=your_webhook_secret_here
OPENAI_API_KEY=sk-your-openai-key-here
```

#### 🗄️ Redis (חובה!)
```bash
REDIS_ENABLED=true
REDIS_HOST=redis-10388.fcrce259.eu-central-1-3.ec2.cloud.redislabs.com
REDIS_PORT=10388
REDIS_PASSWORD=CKEWOmQr43J0AczXALygL3T30fT2A9UQ
REDIS_TTL_DAYS=7
```

#### ⚙️ Server Configuration
```bash
PORT=3000
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
MAX_HISTORY_MESSAGES=40
BATCH_WINDOW_MS=8000
MIN_RESPONSE_DELAY_MS=1500
MAX_RESPONSE_DELAY_MS=3000
```

#### 📅 Meeting Reminders
```bash
REMINDER_DAY_OF_MEETING_TIME=09:00
REMINDER_MINUTES_BEFORE=45
REMINDER_WINDOW_MINUTES=3
```

#### 🐛 Debug (אופציונלי)
```bash
SKIP_WEBHOOK_VERIFICATION=false
```

---

### 2️⃣ Render Settings

#### Build Command:
```bash
npm install && npm run build
```

#### Start Command:
```bash
npm start
```

#### Node Version:
```
22.x
```

#### Plan:
- **Starter ($7/month)** - מספיק למרבית המקרים
- **Standard ($25/month)** - אם יש יותר מ-500 פגישות ביום

---

### 3️⃣ בדיקות לפני העלאה

#### ✅ Build עובד:
```bash
npm run build
```
**צפוי:** אין שגיאות, תיקייה `dist/` נוצרת

#### ✅ Start עובד:
```bash
npm start
```
**צפוי:** השרת עולה ללא שגיאות

#### ✅ Dependencies מותקנים:
```bash
npm install
```
**צפוי:** כל הpackages מותקנים בהצלחה

#### ✅ Git status נקי:
```bash
git status
```
**צפוי:** `.env` לא מופיע (מוסתר ב-.gitignore)

---

### 4️⃣ חיבור ל-Redis

#### בדוק שהחיבור עובד:
```bash
redis-cli -h redis-10388.fcrce259.eu-central-1-3.ec2.cloud.redislabs.com \
  -p 10388 \
  -a CKEWOmQr43J0AczXALygL3T30fT2A9UQ \
  PING
```
**צפוי:** `PONG`

---

### 5️⃣ Health Check Endpoint

ה-endpoint `/health` קיים ועובד:

```bash
curl http://localhost:3000/health
```

**צפוי:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-03T10:00:00.000Z",
  "server": "WhatsApp AI Agent",
  "version": "1.0.0",
  "redis": "connected"
}
```

---

## 🌐 Deployment Steps

### שלב 1: Push לGit

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### שלב 2: צור Service בRender

1. **לך ל-** https://dashboard.render.com/
2. **New +** → **Web Service**
3. **Connect Repository** (GitHub/GitLab)
4. **בחר את הrepo שלך**

### שלב 3: הגדר את הService

**Name:** `whatsapp-ai-agent` (או כל שם שתרצה)

**Environment:** `Node`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Plan:** Starter ($7/month)

### שלב 4: הוסף Environment Variables

בRender Dashboard → Service → Environment:

לחץ **Add Environment Variable** ולהוסיף את כל המשתנים מלמעלה ☝️

**טיפ:** העתק והדבק מקובץ `.env` המקומי שלך.

### שלב 5: Deploy!

לחץ **Create Web Service**

Render יתחיל:
1. ✅ Clone את הrepo
2. ✅ להריץ `npm install && npm run build`
3. ✅ להריץ `npm start`
4. ✅ לתת לך URL: `https://your-app.onrender.com`

---

## 🔍 Post-Deployment Checks

### 1️⃣ בדוק שהשרת רץ

```bash
curl https://your-app.onrender.com/health
```

**צפוי:**
```json
{
  "status": "healthy",
  "redis": "connected"
}
```

### 2️⃣ בדוק Logs

בRender Dashboard → Logs:

**תראה:**
```
============================================================
  WhatsApp AI Agent Server
============================================================
  Port: 10000
  Storage: Redis (redis-xxx:10388)
  TTL: 7 days
============================================================

⏱️  Meeting Reminder Scheduler Started
✅ Redis connected

Server ready. Waiting for messages...
```

### 3️⃣ בדוק Calendar API

```bash
curl https://your-app.onrender.com/calendar/test/list-meetings
```

**צפוי:**
```json
{
  "status": "ok",
  "count": 0,
  "meetings": []
}
```

### 4️⃣ צור פגישה לבדיקה

```bash
curl -X POST https://your-app.onrender.com/calendar/meeting \
  -H "Content-Type: application/json" \
  -d '[{
    "customer_name": "בדיקה",
    "customer_phone": "0523006544",
    "meeting_date": "2025-12-10",
    "meeting_time": "15:50"
  }]'
```

### 5️⃣ שלח תזכורת בדיקה

```bash
curl -X POST https://your-app.onrender.com/calendar/test/day-reminder/0523006544
```

**תקבל הודעה בוואטסאפ!** 📱

---

## 🔗 הגדרת Webhook ב-n8n

לאחר ה-deployment, עדכן את ה-webhook ב-n8n:

**Old URL:** `http://localhost:3000/calendar/meeting`

**New URL:** `https://your-app.onrender.com/calendar/meeting`

---

## 🐛 Troubleshooting

### בעיה: "Application failed to respond"

**פתרון:** בדוק שה-PORT נכון
```bash
# ב-Render, הוא אוטומטית מגדיר PORT
# הקוד שלך צריך להאזין ל-process.env.PORT
```

הקוד שלנו **כבר תומך בזה** ✅:
```typescript
app.listen(config.port, () => { ... });
// config.port = parseInt(process.env.PORT || "3000", 10)
```

### בעיה: "Redis connection error"

**פתרון:** בדוק את ה-environment variables:
1. `REDIS_ENABLED=true`
2. `REDIS_HOST` נכון (ללא פורט!)
3. `REDIS_PORT` נכון
4. `REDIS_PASSWORD` נכון

### בעיה: "Cannot find module 'date-fns'"

**פתרון:** זה לא אמור לקרות אם Build Command נכון:
```bash
npm install && npm run build
```

אם זה קורה, בדוק שב-`package.json`:
```json
"dependencies": {
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0"
}
```

---

## 📊 Monitoring

### Render Dashboard מציג:

- **Logs** - כל הפלטים של השרת
- **Metrics** - CPU, Memory, Requests
- **Events** - Deployments, Restarts
- **Shell** - גישה לשרת (SSH)

### לוגים חשובים לעקוב:

```
✅ Redis connected
⏱️ Meeting Reminder Scheduler Started
📨 Sending meeting confirmation
📨 Sending day-of-meeting reminder
```

---

## 🔄 Auto-Deploy

Render אוטומטית מעלה את הקוד כל פעם ש:
- עושים `git push origin main`
- מעדכנים משתני סביבה

**זה מדהים!** כל שינוי בקוד → אוטומטית בפרודקשן.

---

## 💰 Cost Estimate

### Render Starter ($7/month):
- ✅ שרת Node.js
- ✅ 512MB RAM
- ✅ Auto-deploy
- ✅ Free SSL
- ✅ Custom domain

### Redis Labs Free Tier:
- ✅ 30MB storage
- ✅ מספיק לאלפי פגישות
- ✅ Automatic backups

**סה"כ:** $7/month 🎉

---

## 🎯 Final Checklist

לפני שתלחץ "Deploy":

- [ ] כל משתני הסביבה מוגדרים ב-Render
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Redis credentials נכונים
- [ ] `.env` **לא** ב-git (בדוק `.gitignore`)
- [ ] `npm run build` עובד מקומית
- [ ] `npm start` עובד מקומית
- [ ] Git pushed ל-main branch

---

## 🚀 Ready!

**אחרי כל הבדיקות - אתה מוכן לדפלוי!**

```bash
git add .
git commit -m "🚀 Production ready"
git push origin main
```

**ואז ב-Render:** Create Web Service → Deploy! 🎉

---

## 📞 Support

אם משהו לא עובד:
1. צ'ק את ה-Logs ב-Render
2. בדוק את Health endpoint
3. ודא שRedis מחובר
4. בדוק שכל המשתנים מוגדרים

**Good luck!** 💪

