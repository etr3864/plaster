# 📅 Meeting Reminder System

מערכת תזכורות אוטומטית לפגישות - שולחת תזכורות חכמות דרך WhatsApp.

---

## 🎯 סוגי התזכורות

### 1️⃣ תזכורת ביום הפגישה
**מתי:** בשעה מוגדרת ביום הפגישה (ברירת מחדל: 09:00)  
**הודעה:** `{שם פרטי}, מזכירה לך על השיחה שלך ושל היועץ שקבעת היום, מקווה שאתה מתרגש כמוני 😉`

### 2️⃣ תזכורת לפני הפגישה
**מתי:** X דקות לפני הפגישה (ברירת מחדל: 45 דקות)  
**הודעה:** `{שם פרטי} מה קורה? בעוד {X} דקות תקבל שיחה מאחד היועצים שלנו, שיהיה בהצלחה!`

---

## ⚙️ משתני סביבה (ENV)

הוסף ל-`.env` או ל-Render:

```bash
# תזכורת ביום הפגישה - באיזו שעה לשלוח (HH:MM)
REMINDER_DAY_OF_MEETING_TIME=09:00

# תזכורת כמה דקות לפני הפגישה
REMINDER_MINUTES_BEFORE=45

# חלון זמן לשליחה (±X דקות)
# אם החלון הוא 3, התזכורת תישלח בין 09:00-09:03 או 44-47 דקות לפני
REMINDER_WINDOW_MINUTES=3
```

---

## 📊 דוגמת תרחיש

### פרטי הפגישה:
```json
{
  "phone": "0523006544",
  "name": "איתן טורגמן",
  "date": "2025-12-10",
  "time": "15:50"
}
```

### Timeline:

```
📅 2025-12-10

⏰ 09:00-09:03 → תזכורת ראשונה
┌─────────────────────────────────────────────────────────┐
│ איתן, מזכירה לך על השיחה שלך ושל היועץ שקבעת היום,     │
│ מקווה שאתה מתרגש כמוני 😉                               │
└─────────────────────────────────────────────────────────┘

⏰ 15:05-15:08 (45 דקות לפני) → תזכורת שנייה
┌─────────────────────────────────────────────────────────┐
│ איתן מה קורה? בעוד 45 דקות תקבל שיחה מאחד היועצים      │
│ שלנו, שיהיה בהצלחה!                                     │
└─────────────────────────────────────────────────────────┘

⏰ 15:50 → הפגישה! 🎯
```

---

## 🔒 מניעת שליחה כפולה

המערכת שומרת `flags` ב-Redis:

```json
{
  "phone": "0523006544",
  "name": "איתן טורגמן",
  "date": "2025-12-10",
  "time": "15:50",
  "createdAt": 1733227800000,
  "flags": {
    "sentDayReminder": false,    ← משתנה ל-true אחרי שליחה
    "sentBeforeReminder": false  ← משתנה ל-true אחרי שליחה
  }
}
```

**אלגוריתם:**
1. Scheduler רץ כל דקה (60 שניות)
2. בודק כל פגישה ב-Redis
3. אם התזכורת בטווח הזמן **ו-flag = false** → שולח
4. מעדכן flag ל-`true`
5. בפעם הבאה - דילוג (כי flag = true)

---

## 🏗️ ארכיטקטורה

```
src/calendar/reminders/
├── scheduler.ts    ← הלוגיקה הראשית
├── messages.ts     ← בניית הודעות
├── timeUtils.ts    ← חישובי זמן
└── README.md       ← הקובץ הזה
```

### scheduler.ts
- רץ כל 60 שניות
- שולף כל הפגישות מ-Redis (`meeting:*`)
- בודק לכל פגישה אם צריך לשלוח תזכורת
- מעדכן flags אחרי שליחה

### messages.ts
- `buildDayReminderMessage()` - הודעת יום הפגישה
- `buildBeforeReminderMessage()` - הודעה לפני הפגישה

### timeUtils.ts
- `diffInMinutes()` - הפרש בדקות בין תאריכים
- `parseTimeToDate()` - המרת מחרוזת לתאריך
- `formatDateYMD()` - פורמט תאריך

---

## ⏱️ איך ה-Scheduler עובד?

```typescript
// כל דקה:
setInterval(async () => {
  // 1. שלוף כל הפגישות
  const keys = await redis.keys("meeting:*");
  
  for (const key of keys) {
    const meeting = JSON.parse(await redis.get(key));
    const now = new Date();
    const meetingTime = new Date(meeting.date + "T" + meeting.time);
    
    // 2. תזכורת ביום הפגישה
    if (
      now.toISOString().slice(0, 10) === meeting.date && // אותו יום
      now.getHours() === 9 && // שעה 9
      now.getMinutes() <= 3 && // חלון 3 דקות
      !meeting.flags.sentDayReminder // לא נשלח
    ) {
      await sendTextMessage(phone, "איתן, מזכירה לך...");
      meeting.flags.sentDayReminder = true;
      await redis.set(key, JSON.stringify(meeting));
    }
    
    // 3. תזכורת לפני הפגישה
    const diffMinutes = (meetingTime - now) / 60000;
    if (
      diffMinutes <= 45 && // פחות מ-45 דקות
      diffMinutes >= 42 && // אבל יותר מ-42 (חלון 3)
      !meeting.flags.sentBeforeReminder
    ) {
      await sendTextMessage(phone, "איתן מה קורה? בעוד 45...");
      meeting.flags.sentBeforeReminder = true;
      await redis.set(key, JSON.stringify(meeting));
    }
  }
}, 60_000); // כל דקה
```

---

## 🎯 יתרונות

✅ **אוטומטי לחלוטין** - לא צריך לעשות כלום  
✅ **לא שולח כפול** - בזכות flags  
✅ **גמיש** - כל ההגדרות ב-ENV  
✅ **Production Ready** - טיפול מלא בשגיאות  
✅ **Render $7 Compatible** - לא צריך Cron jobs חיצוניים  
✅ **Scalable** - יכול להתמודד עם מאות פגישות  

---

## 🧪 בדיקה מקומית

### 1. הוסף משתני סביבה
```bash
# .env
REMINDER_DAY_OF_MEETING_TIME=09:00
REMINDER_MINUTES_BEFORE=45
REMINDER_WINDOW_MINUTES=3
```

### 2. צור פגישה לבדיקה
```bash
curl -X POST http://localhost:3000/calendar/meeting \
  -H "Content-Type: application/json" \
  -d '[{
    "customer_name": "איתן טורגמן",
    "customer_phone": "0523006544",
    "meeting_date": "2025-12-10",
    "meeting_time": "15:50"
  }]'
```

### 3. בדוק ב-Redis
```bash
# התחבר ל-Redis
redis-cli

# בדוק שהפגישה נשמרה
GET meeting:0523006544

# תראה:
# {"phone":"0523006544","name":"איתן טורגמן","date":"2025-12-10","time":"15:50","createdAt":...,"flags":{"sentDayReminder":false,"sentBeforeReminder":false}}
```

### 4. צפה ב-logs
```bash
npm run dev

# תראה כל דקה:
# 🔍 Checking 1 meetings for reminders
# 📨 Sending day-of-meeting reminder (אם הגיע הזמן)
# ✅ Day reminder sent
```

---

## 🔧 התאמה אישית

### רוצה להוסיף תזכורת שלישית? (5 דקות אחרי)

1. הוסף ל-`types.ts`:
```typescript
export interface MeetingFlags {
  sentDayReminder: boolean;
  sentBeforeReminder: boolean;
  sentAfterReminder: boolean;  // ← חדש
}
```

2. הוסף ל-`messages.ts`:
```typescript
export function buildAfterReminderMessage(meeting: Meeting): string {
  const firstName = getFirstName(meeting.name);
  return `${firstName}, תודה שענית! נשמח לקבל פידבק על השיחה 😊`;
}
```

3. הוסף ל-`scheduler.ts`:
```typescript
// 3️⃣ After Meeting Reminder (5 minutes after)
if (
  diffMinutes >= -5 &&
  diffMinutes <= -2 &&
  !meeting.flags?.sentAfterReminder
) {
  const message = buildAfterReminderMessage(meeting);
  await sendTextMessage(internationalPhone, message);
  meeting.flags.sentAfterReminder = true;
  updated = true;
}
```

---

## 📈 Monitoring

הלוגים יראו:

```
⏱️  Meeting Reminder Scheduler Started
🔍 Checking 5 meetings for reminders
📨 Sending day-of-meeting reminder (phone: 0523006544)
✅ Day reminder sent (message: "איתן, מזכירה לך...")
💾 Meeting flags updated (flags: {"sentDayReminder":true,"sentBeforeReminder":false})
```

---

## 🚨 Troubleshooting

### תזכורת לא נשלחת?

1. **בדוק שה-Scheduler רץ:**
   - חפש בלוג: `⏱️  Meeting Reminder Scheduler Started`

2. **בדוק שהפגישה קיימת ב-Redis:**
   ```bash
   redis-cli
   KEYS meeting:*
   GET meeting:0523006544
   ```

3. **בדוק את חלון הזמן:**
   - אם `REMINDER_WINDOW_MINUTES=3`, התזכורת תישלח רק בטווח של 3 דקות
   - אם פספסת את החלון, התזכורת לא תישלח

4. **בדוק flags:**
   - אם `sentDayReminder: true`, התזכורת כבר נשלחה
   - מחק את הפגישה ועשה מחדש לבדיקה

---

**המערכת מוכנה לעבודה! 🚀**

