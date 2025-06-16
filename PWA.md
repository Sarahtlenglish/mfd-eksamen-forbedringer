# PWA-oversigt og arkitektur

Denne fil giver mig et samlet overblik over, hvordan PWA-funktionalitet er implementeret i applikationen. Den er skrevet som eksamenshjælp, så jeg hurtigt kan finde og forklare de vigtigste dele: caching, service worker, manifest, storage og IndexedDB.

---

## Hvad er en PWA?
En Progressive Web App (PWA) er en webapplikation, der kan installeres på brugerens enhed, fungerer offline, og giver en app-lignende oplevelse. Det opnås gennem service workers, caching, manifestfil og moderne browser-API'er.

---

## Arkitektur og komponenter

### 1. Workbox og Caching strategier
**Workbox** er et bibliotek fra Google, der forenkler arbejdet med service workers og caching i Progressive Web Apps. Det findes i `dev-dist/workbox-*.js` og håndterer:

**Caching Strategier:**
- *Cache First*: Statiske filer (JS, CSS, billeder) hentes først fra cache
- *Network First*: Dynamiske data (API-kald) forsøges hentet fra netværk, ellers cache
- *Stale While Revalidate*: Viser cachede data, mens nye data hentes i baggrunden

**Vigtigste funktioner:**
- **Precaching**: Automatisk caching af specifikke filer, når service worker installeres
- **Routing**: Definerer hvordan forskellige netværksanmodninger skal håndteres
- **Baggrundssynkronisering**: Understøtter synkronisering af data, når enheden er online igen
- **Konfiguration:** Se Workbox-opsætning i `vite.config.js`

### 2. Service Worker
- **Placering:** Genereres og registreres via Vite PWA plugin, findes i `dev-dist/sw.js`
- **Ansvar:**
  - Cacher assets og API-svar (via Workbox)
  - Muliggør offline funktionalitet
  - Håndterer baggrundssynkronisering
- **Livscyklus:**
  - *Install*: Cacher nødvendige filer
  - *Activate*: Rydder gammel cache
  - *Fetch*: Opfanger netværkskald og returnerer cachede svar hvis nødvendigt

### 3. Manifestfil
- **Placering:** Typisk `manifest.webmanifest` eller `manifest.json` (ofte i projektroden eller `public/`)
- **Indhold:**
  - App-navn, ikoner, start-URL, farver, display-mode, scope
- **Formål:**
  - Gør det muligt at installere appen på hjemskærmen
  - Definerer appens udseende og opførsel på enheder

### 4. Storage strategi
- **Hierarki:**
  1. *IndexedDB* (via `src/utils/indexedDB.js`) bruges til at gemme strukturerede data og store mængder data offline
  2. *Cache API* (styret af service worker/Workbox) bruges til at cache assets og API-svar
  3. *localStorage* bruges kun som fallback, hvis IndexedDB ikke er tilgængelig
- **Data saniteres** før lagring for at undgå fejl

### 5. IndexedDB
- **Implementeret i:** `src/utils/indexedDB.js`
- **Funktioner:**
  - CRUD-operationer: `put`, `get`, `getAll`, `delete`, `clear`
  - Batch-operationer: `putMany`
  - Søgning via index: `getByIndex`
  - Automatisk fallback til localStorage hvis IndexedDB ikke understøttes
- **Bruges af:** Offline store (`src/stores/offlineStore.js`) til at cache og hente data

### 6. Offline Store og synkronisering
- **Placering:** `src/stores/offlineStore.js`
- **Ansvar:**
  - Overvåger online/offline status
  - Gemmer ændringer i en kø, når brugeren er offline
  - Synkroniserer automatisk ændringer med serveren, når brugeren bliver online igen
  - Håndterer ID-mapping og opdaterer relevante stores
- **Sync Manager:** Håndterer selve synkroniseringsprocessen og konfliktløsning

---

## PWA i Vue vs. Vanilla JavaScript

At bygge en PWA i **Vue** adskiller sig fra at bruge **vanilla JavaScript** på flere måder:

- **Komponentbaseret Arkitektur**: Vue bruger en komponentbaseret tilgang, hvilket gør det lettere at organisere og genbruge kode. Hver komponent kan have sin egen logik, stil og struktur.

- **Reaktivitet**: Vue's reaktive system gør det nemt at opdatere UI'en, når data ændres. Dette er særligt nyttigt i PWA'er, hvor data kan ændre sig baseret på brugerinteraktioner eller netværksstatus.

- **State Management**: Vue tilbyder værktøjer som Pinia til state management, hvilket gør det lettere at håndtere applikationens tilstand, især når der arbejdes med offline data og synkronisering.

- **Integration med Vite**: Når jeg bruger Vue med Vite, kan jeg drage fordel af hurtigere byggetider og hot module replacement (HMR), hvilket forbedrer udviklingsoplevelsen.

---

## Vite PWA Plugin

I mit projekt anvendes **Vite PWA** plugin, som er et værktøj til at integrere PWA-funktionalitet i Vite-baserede applikationer. Dette plugin gør det nemt at:

- **Generere en manifestfil**: Plugin'et kan automatisk generere en manifestfil baseret på de indstillinger, jeg angiver i min Vite-konfiguration

- **Registrere service workers**: Det håndterer registreringen af service workers og giver mig mulighed for at definere caching strategier

- **Automatisk opdatering**: Plugin'et kan håndtere automatiske opdateringer af service worker, når der er nye versioner af applikationen

- **Workbox integration**: Det integrerer seamløst med Workbox for avanceret caching og offline funktionalitet

---

## Dataflow (kort fortalt)
- **Online:**
  1. Data hentes fra server
  2. Data gemmes i IndexedDB og vises i UI
- **Offline:**
  1. Data hentes fra IndexedDB
  2. Ændringer gemmes lokalt og lægges i kø
  3. Når brugeren bliver online, synkroniseres ændringer automatisk

---

## Hvor finder jeg hvad?
| Funktion         | Fil(er) / Placering                |
|------------------|-------------------------------------|
| Caching          | `dev-dist/workbox-*.js`, `vite.config.js` |
| Service Worker   | `dev-dist/sw.js`                   |
| Manifest         | `manifest.webmanifest` / `manifest.json` |
| IndexedDB        | `src/utils/indexedDB.js`           |
| Offline Store    | `src/stores/offlineStore.js`       |
| Sync Manager     | `src/stores/syncManager.js`        |

---

## Tips til eksamen
- **Forklar hvordan offline funktionalitet opnås:**
  - Service worker fanger fetch-kald og returnerer cachede svar
  - Data gemmes i IndexedDB, så brugeren kan arbejde offline
  - Ændringer synkroniseres automatisk, når der igen er netværk
- **Vis diagrammerne i `PWA-architecture.md`** for at illustrere sammenhængen
- **Fremhæv brugen af Workbox og IndexedDB** som centrale teknologier
- **Forklar forskellen mellem PWA i Vue vs vanilla JavaScript**
- **Beskriv hvordan Vite PWA plugin forenkler PWA-udvikling**

---

Denne oversigt dækker de vigtigste PWA-elementer i min kode og hjælper mig med hurtigt at finde og forklare dem til eksamen. 