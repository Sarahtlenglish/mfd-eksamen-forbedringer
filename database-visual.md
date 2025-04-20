# Database Visual Diagram

```
+-------------------+       +----------------------+       +---------------------+
|     ENHEDER       |       |     EGENKONTROL      |       |      BRUGERE        |
| (Units)           |       | (Self-checks)        |       | (Users)             |
+-------------------+       +----------------------+       +---------------------+
| id (PK)           |       | id (PK)              |       | id (PK)             |
| name              |       | name                 |       | name                |
| location          |       | type                 |       | role                |
| description       |       | status               |       +---------------------+
| qrCode            |       | location             |                ^
+-------------------+       | standard             |                |
        |                   | standardTitle        |                |
        |                   | description          |                |
        |                   | frequency            |                |
        |                   | startDate            |                |
        |                   | completed            |                |
        |                   +----------------------+                |
        |                           |                               |
        |                           |                               |
        v                           v                               |
+-------------------+       +----------------------+       +---------------------+
| ENHEDER_HISTORY   |       | EGENKONTROL_REMINDERS|       |EGENKONTROL_RESPONSIBLE|
+-------------------+       +----------------------+       +---------------------+
| id (PK)           |       | id (PK)              |       | egenkontrolId (FK)  |
| enhedId (FK)      |       | egenkontrolId (FK)   |       | userId (FK)         |
| type              |       | description          |       +---------------------+
| title             |       +----------------------+
| date              |               |
| user (FK)         |               |
+-------------------+               |
        ^                           |
        |                           |
        |                           v
+-------------------+       +----------------------+
| FILES             |       |EGENKONTROL_NOTIFICATIONS|
+-------------------+       +----------------------+
| id (PK)           |       | id (PK)              |
| enhedId (FK)      |       | egenkontrolId (FK)   |
| name              |       | recipient (FK)       |
| type              |       | description          |
+-------------------+       +----------------------+
```

## Relationship Legend

- One-to-Many: |------< 
- Many-to-Many: |------<>------| 

### Key Relationships:

1. ENHEDER (1) --< EGENKONTROL (Many)
2. ENHEDER (1) --< ENHEDER_HISTORY (Many)
3. ENHEDER (1) --< FILES (Many)
4. BRUGERE (1) --< EGENKONTROL (Many) via EGENKONTROL_RESPONSIBLE
5. BRUGERE (1) --< ENHEDER_HISTORY (Many)
6. EGENKONTROL (1) --< EGENKONTROL_REMINDERS (Many)
7. EGENKONTROL (1) --< EGENKONTROL_NOTIFICATIONS (Many)
8. BRUGERE (1) --< EGENKONTROL_NOTIFICATIONS (Many) as recipients 