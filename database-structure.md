# Database Structure

## Main Entities

### ENHEDER (Units)
- **id** (PK): Integer
- **name**: String
- **location**: String
- **description**: String
- **qrCode**: String
- Has many: Egenkontrol items, History items, Files

### EGENKONTROL (Self-checks)
- **id** (PK): Integer
- **name**: String
- **type**: String (Egenkontrol/Opgave)
- **status**: String (normal/warning/error/afvigelse)
- **location**: String
- **standard**: String (BR18/DKV/AT etc.)
- **standardTitle**: String
- **description**: String
- **frequency**: String (Ugentlig/Månedlig/Kvartalsvis)
- **startDate**: Date
- **completed**: Boolean
- Has many: Reminders, Notifications, Responsible users

### BRUGERE (Users)
- **id** (PK): String (email or username)
- **name**: String
- **role**: String (admin/regular)
- Is responsible for: Egenkontrol items
- Creates: History items
- Receives: Notifications

## Junction Tables and Related Entities

### ENHEDER_HISTORY (Unit History)
- **id** (PK): Integer
- **enhedId** (FK): Integer → ENHEDER
- **type**: String (NextInspection/dokumenter/opgave/kommentar/udført)
- **title**: String
- **date**: Date
- **user** (FK): String → BRUGERE

### FILES
- **id** (PK): Integer
- **enhedId** (FK): Integer → ENHEDER
- **name**: String
- **type**: String (pdf/etc.)

### EGENKONTROL_REMINDERS
- **id** (PK): Integer
- **egenkontrolId** (FK): Integer → EGENKONTROL
- **description**: String

### EGENKONTROL_NOTIFICATIONS
- **id** (PK): Integer
- **egenkontrolId** (FK): Integer → EGENKONTROL
- **recipient** (FK): String → BRUGERE
- **description**: String

### EGENKONTROL_RESPONSIBLE
- **egenkontrolId** (FK): Integer → EGENKONTROL
- **userId** (FK): String → BRUGERE

## Relationships

1. ENHEDER has many EGENKONTROL items
2. ENHEDER has many ENHEDER_HISTORY items
3. ENHEDER has many FILES
4. BRUGERE is responsible for many EGENKONTROL items
5. BRUGERE creates many ENHEDER_HISTORY items
6. EGENKONTROL has many EGENKONTROL_REMINDERS
7. EGENKONTROL has many EGENKONTROL_NOTIFICATIONS
8. EGENKONTROL has many responsible BRUGERE through EGENKONTROL_RESPONSIBLE
9. BRUGERE receives many EGENKONTROL_NOTIFICATIONS 