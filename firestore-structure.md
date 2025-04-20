# Firestore Document Structure

## Collections & Documents

### Collection: `enheder`
Document ID: `{enhed_id}`
```
{
  id: "1",
  name: "Branddør",
  location: "Bygning A",
  description: "Tjek at alle branddøre i Bygning A er op til standard og fungere som de skal",
  qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=branddoer-bygningA",
  // Embedded Arrays for small related data
  files: [
    { id: "1", name: "Faktura fra Kasper Bohr", type: "pdf" }
  ],
  // Reference paths to related collections
  history_ref: "/enheder/{enhed_id}/history"
}
```

### Subcollection: `enheder/{enhed_id}/history`
Document ID: `{history_item_id}`
```
{
  id: "1",
  type: "NextInspection",
  title: "Næste egenkontrol om 336 dage",
  date: Timestamp,
  user_id: "christian.hansen@example.com",
  user_name: "Christian Hansen"  // Denormalized for quick display
}
```

### Collection: `egenkontrol`
Document ID: `{egenkontrol_id}`
```
{
  id: "1",
  name: "Branddørs inspektion",
  type: "Egenkontrol",
  status: "normal",
  location: "Indgang A3.15",
  standard: "BR18",
  standardTitle: "Branddøre og brandadskillelser",
  description: "Branddørens lukkemekanisme kontrolleres...",
  frequency: "Månedlig",
  startDate: Timestamp,
  completed: false,
  
  // References to related enheder
  enhed_id: "1",  // Foreign key reference
  
  // Embedded arrays for small related data
  responsible_users: [
    { id: "christian.hansen@example.com", name: "Christian Hansen" }
  ],
  reminders: [
    { description: "1 dag før, kl. 09.00" },
    { description: "Dagligt kl. 09.00 efter overskredet deadline" }
  ],
  deadline_notifications: [
    { recipient_id: "borge.jakobsen@example.com", recipient_name: "Børge Jakobsen", description: "modtager kvittering" },
    { recipient_id: "christian.hansen@example.com", recipient_name: "Christian Hansen", description: "modtager besked om afvigelser" }
  ]
}
```

### Collection: `brugere`
Document ID: `{email}`
```
{
  id: "christian.hansen@example.com",
  name: "Christian Hansen",
  role: "admin",
  
  // For quick retrieval, can store IDs of related data
  ansvarlig_for_egenkontrol: ["1", "2", "4"],  // IDs for quick lookup
  
  // For important notifications, you might have a subcollection
  notifications_ref: "/brugere/{email}/notifications"
}
```

### Subcollection: `brugere/{email}/notifications`
Document ID: `{notification_id}`
```
{
  id: "1",
  type: "afvigelse",
  title: "Afvigelse på Branddørs inspektion",
  egenkontrol_id: "3",
  date: Timestamp,
  read: false
}
```

## Firestore Design Principles Applied

1. **Denormalization** - User names are stored with their IDs in egenkontrol documents for quick rendering without additional lookups

2. **Subcollections** - Used for one-to-many relationships like history items and notifications

3. **Embedded Arrays** - For limited size collections like reminders and responsible users

4. **References** - Using IDs or document paths to reference related documents

5. **Flattened Structure** - No complex nesting beyond one level of subcollections

## Query Patterns

- Get all enheder: `db.collection('enheder').get()`
- Get history for a specific enhed: `db.collection('enheder').doc(enhedId).collection('history').get()`
- Get all egenkontrol for a specific location: `db.collection('egenkontrol').where('location', '==', 'Bygning A').get()`
- Get all egenkontrol a user is responsible for: `db.collection('egenkontrol').where('responsible_users', 'array-contains', {id: 'christian.hansen@example.com'}).get()`
- Get all notifications for a user: `db.collection('brugere').doc(email).collection('notifications').where('read', '==', false).get()` 