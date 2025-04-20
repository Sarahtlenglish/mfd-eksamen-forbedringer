# Firestore Document Structure Diagram

```
+--------------------------+
|    Collection: enheder   |
+--------------------------+
| Document ID: {enhed_id}  |
| {                        |
|   id: String             |
|   name: String           |
|   location: String       |
|   description: String    |
|   qrCode: String         |
|   files: [               |
|     { id, name, type }   |
|   ]                      |
| }                        |
+--------------------------+
           |
           | subcollection
           ↓
+--------------------------+
|  enheder/{id}/history    |
+--------------------------+
| Document ID: {history_id}|
| {                        |
|   id: String             |
|   type: String           |
|   title: String          |
|   date: Timestamp        |
|   user_id: String        |
|   user_name: String      |
| }                        |
+--------------------------+

+--------------------------+
| Collection: egenkontrol  |
+--------------------------+
| Document ID: {egenkontrol_id} |
| {                        |
|   id: String             |
|   name: String           |
|   type: String           |
|   status: String         |
|   location: String       |
|   standard: String       |
|   standardTitle: String  |
|   description: String    |
|   frequency: String      |
|   startDate: Timestamp   |
|   completed: Boolean     |
|                          |
|   // References          |
|   enhed_id: String       |
|                          |
|   // Embedded arrays     |
|   responsible_users: [   |
|     { id, name }         |
|   ]                      |
|   reminders: [           |
|     { description }      |
|   ]                      |
|   deadline_notifications:|
|     [{ recipient_id,     |
|        recipient_name,   |
|        description }]    |
| }                        |
+--------------------------+
           ↑
           | reference
           |
+--------------------------+
|   Collection: brugere    |
+--------------------------+
| Document ID: {email}     |
| {                        |
|   id: String (email)     |
|   name: String           |
|   role: String           |
|                          |
|   // Quick lookup arrays |
|   ansvarlig_for_         |
|   egenkontrol: [String]  |
| }                        |
+--------------------------+
           |
           | subcollection
           ↓
+--------------------------+
| brugere/{email}/         |
| notifications            |
+--------------------------+
| Document ID: {notif_id}  |
| {                        |
|   id: String             |
|   type: String           |
|   title: String          |
|   egenkontrol_id: String |
|   date: Timestamp        |
|   read: Boolean          |
| }                        |
+--------------------------+
```

## Dokument Relationer

1. `enheder` → `enheder/{id}/history` (Subcollection)
2. `egenkontrol` → `enheder` (Reference via enhed_id)
3. `egenkontrol` → `brugere` (Embedded array af ansvarlige brugere)
4. `brugere` → `brugere/{email}/notifications` (Subcollection)
5. `brugere` → `egenkontrol` (Array med reference til ansvarlige egenkontroller)

## Fordele ved Firestore-strukturen

1. **Flad hierarkisk struktur** - Maks. 1 niveau af subcollections gør det nemt at navigere
2. **Denormalisering** - Gemmer relevante data sammen for hurtig adgang (fx brugernavn sammen med ID)
3. **Embedded Arrays** - Perfekt til mindre relaterede data som filer og påmindelser
4. **Skalerbarhed** - Subcollections for historik og notifikationer tillader ubegrænset vækst
5. **Effektive Queries** - Designet til de mest almindelige forespørgselsmønstre 