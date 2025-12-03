# Calendar API Documentation

## Overview
מערכת לקבלת ושמירת פגישות מ-n8n automation ושליפתן בעת הצורך.

---

## API Endpoints

### 1. Create Meeting (קבלת פגישה מ-n8n)

**Endpoint:** `POST /calendar/meeting`

**Request Body:**
```json
[
  {
    "customer_name": "איתן טורגמן",
    "customer_phone": "0523006544",
    "meeting_date": "2025-12-03",
    "meeting_time": "15:50"
  }
]
```

או אובייקט בודד:
```json
{
  "customer_name": "איתן טורגמן",
  "customer_phone": "0523006544",
  "meeting_date": "2025-12-03",
  "meeting_time": "15:50"
}
```

**Response (Success - 200):**
```json
{
  "status": "ok",
  "message": "Meeting saved successfully",
  "data": {
    "phone": "0523006544",
    "name": "איתן טורגמן",
    "date": "2025-12-03",
    "time": "15:50",
    "createdAt": 1733227800000
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "message": "Missing required field: customer_phone"
}
```

---

### 2. Get Meeting (שליפת פגישה)

**Endpoint:** `GET /calendar/meeting/:phone`

**Example:** `GET /calendar/meeting/0523006544`

**Response (Success - 200):**
```json
{
  "status": "ok",
  "message": "Meeting found",
  "data": {
    "phone": "0523006544",
    "name": "איתן טורגמן",
    "date": "2025-12-03",
    "time": "15:50",
    "createdAt": 1733227800000
  }
}
```

**Response (Not Found - 404):**
```json
{
  "status": "error",
  "message": "No meeting found for this phone number"
}
```

---

### 3. Delete Meeting (מחיקת פגישה)

**Endpoint:** `DELETE /calendar/meeting/:phone`

**Example:** `DELETE /calendar/meeting/0523006544`

**Response (Success - 200):**
```json
{
  "status": "ok",
  "message": "Meeting deleted successfully"
}
```

---

## Validation Rules

### Phone Number
- פורמט מקובל: `05XXXXXXXX` (ישראלי) או `972XXXXXXXXX` (בינלאומי)
- המערכת מנרמלת אוטומטית ל-`05XXXXXXXX`

### Date
- פורמט: `YYYY-MM-DD`
- חייב להיות תאריך תקין
- לא יכול להיות בעבר

### Time
- פורמט: `HH:MM` (24 שעות)
- דוגמאות תקינות: `09:30`, `15:50`, `23:00`

### Name
- אופציונלי
- אם חסר, ברירת המחדל: `"לקוח"`

---

## Storage

### Redis Keys
- **Meeting:** `meeting:{phone}`
- **TTL:** 3 ימים (אוטומטית)

### Data Structure
```typescript
interface Meeting {
  phone: string;      // normalized to 05XXXXXXXX
  name: string;       // customer name
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  createdAt: number;  // timestamp
}
```

---

## Usage with n8n

### HTTP Request Node Configuration

**Method:** POST  
**URL:** `https://your-server.com/calendar/meeting`  
**Authentication:** None (add if needed)  
**Body Content Type:** JSON

**Body:**
```json
[
  {
    "customer_name": "{{ $json.name }}",
    "customer_phone": "{{ $json.phone }}",
    "meeting_date": "{{ $json.date }}",
    "meeting_time": "{{ $json.time }}"
  }
]
```

---

## Testing Message Examples

להצגת דוגמאות להודעות שיישלחו:

```bash
npm run build && node dist/calendar/test-examples.js
```

זה יראה לך בדיוק איך ההודעות נראות עבור לקוחות שונים.

---

## Testing with cURL

### Create Meeting
```bash
curl -X POST http://localhost:3000/calendar/meeting \
  -H "Content-Type: application/json" \
  -d '[
    {
      "customer_name": "איתן טורגמן",
      "customer_phone": "0523006544",
      "meeting_date": "2025-12-03",
      "meeting_time": "15:50"
    }
  ]'
```

### Get Meeting
```bash
curl http://localhost:3000/calendar/meeting/0523006544
```

### Delete Meeting
```bash
curl -X DELETE http://localhost:3000/calendar/meeting/0523006544
```

---

## Error Handling

המערכת כוללת טיפול מלא בשגיאות:
- ✅ Validation של כל השדות
- ✅ Normalization של מספרי טלפון
- ✅ בדיקת Redis availability
- ✅ Logging מלא של כל הפעולות
- ✅ Error responses ברורים

---

## 📨 Automatic Confirmation Message

**מיד לאחר שפגישה נשמרת ב-Redis**, המערכת שולחת אוטומטית הודעת אישור ללקוח דרך WhatsApp.

### דוגמת הודעה:
```
איזה יופי, איתן! ראיתי שקבעת שעה לשיחת ייעוץ.
נא לשמור על זמינות ביום רביעי, 3.12.2025 בשעה 15:50 ולענות לשיחה - המהפכה בעסק שלך מתחילה מעכשיו.
```

### תכונות:
✅ **שם פרטי בלבד** - לוקח רק את השם הראשון  
✅ **תאריך בעברית טבעית** - "ביום רביעי, 3.12.2025"  
✅ **שעה נקייה** - "15:50" או "9:30" (בלי אפסים מיותרים)  
✅ **שליחה אוטומטית** - קורה פעם אחת מיד אחרי השמירה  
✅ **לא חוסמת** - ההודעה נשלחת ברקע (`void` Promise)

---

## Architecture

```
src/calendar/
├── types.ts              # TypeScript types
├── validation.ts         # Input validation & normalization
├── meetingStorage.ts     # Redis storage layer
├── routes.ts             # Express routes
├── dateFormatter.ts      # Hebrew date/time formatting
├── messageBuilder.ts     # Confirmation message builder
├── sendConfirmation.ts   # Send WhatsApp confirmation
├── test-examples.ts      # Test examples (run to see messages)
└── README.md             # This file
```

### Design Principles
- ✅ **Separation of concerns** - כל קובץ עם אחריות ברורה
- ✅ **Type safety** - TypeScript מלא
- ✅ **Validation first** - וולידציה לפני כל פעולה
- ✅ **Error resilience** - טיפול בכל תרחיש אפשרי
- ✅ **Logging** - מעקב מלא אחר כל פעולה

