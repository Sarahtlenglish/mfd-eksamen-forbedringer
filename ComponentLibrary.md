# Komponentbibliotek Guide

## Indhold
1. [Overblik](#overblik)
2. [Sådan bruges biblioteket](#sådan-bruges-biblioteket)
3. [Brug af komponenter i projektet](#brug-af-komponenter-i-projektet)
4. [Tilføj nye komponenter](#tilføj-nye-komponenter)

## Overblik

Komponentbiblioteket samler alle genbrugelige UI-komponenter og sikrer konsistens på tværs af projektet. Her kan du:

- Se alle tilgængelige komponenter
- Teste forskellige varianter og props
- Kopiere kode til brug i dine views
- Forstå hvordan komponenterne skal bruges

```
┌─────────────────────────────────────────┐
│          Komponentbibliotek             │
│                                         │
│  ┌─────────────┬───────────┬─────────┐  │
│  │  Knapper    │   Kort    │ Forms   │  │
│  └─────────────┴───────────┴─────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │           Komponent Preview         ││
│  │                                     ││
│  │          [Komponent vises]          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │           Indstillinger             ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │           Kode Eksempel             ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Sådan bruges biblioteket

Komponentbiblioteket findes på `/components` ruten. På siden kan du:

1. Vælg en komponent fra fanebladet (fx Buttons)
2. Se en live preview af komponenten
3. Juster props og indstillinger via kontrolpanelet
4. Kopier den genererede kode med copy-knappen 

## Brug af komponenter i projektet

### Import af komponenter

```javascript
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
```

### Eksempler på brug af Button

```html
<!-- Basis knap -->
<ButtonComponent variant="primary">
  Primary Button
</ButtonComponent>

<!-- Med ikon -->
<ButtonComponent variant="secondary">
  <template #icon>
    <IconPlus />
  </template>
  Tilføj ny
</ButtonComponent>

<!-- Slet knap -->
<ButtonComponent variant="tertiary" :isDelete="true">
  Slet
</ButtonComponent>

<!-- Andre varianter -->
<ButtonComponent variant="primary" size="small">Lille</ButtonComponent>
<ButtonComponent variant="primary" :fullWidth="true">Fuld bredde</ButtonComponent>
<ButtonComponent variant="tertiary" :noPadding="true">Uden padding</ButtonComponent>
```

## Tilføj nye komponenter

Sådan tilføjer du en ny komponent til biblioteket:

1. Opret komponenten i `src/components/ui/`
2. Tilføj komponenten til ComponentView.vue:

```javascript
// Tilføj til tabs
const tabs = [
  { label: 'Buttons', value: 'buttons' },
  { label: 'Din Komponent', value: 'dinKomponent' }
]

// Opdater funktion der styrer indhold
const hasComponentContent = () => {
  return ['buttons', 'dinKomponent'].includes(activeTab.value)
}
```

3. Opret preview, kontroller og kodeeksempel for komponenten

## Best Practices

1. **Brug designsystemets variabler**
   ```scss
   color: $primary-500;  // Rigtigt
   color: #508675;       // Forkert
   ```

2. **Gør komponenter tilpasningsdygtige**
   - Brug props til variationer
   - Husk at tilføje slots for fleksibelt indhold

3. **Test alle varianter**
   - Kontroller hover, fokus, aktiv og disabled tilstande
   - Test med forskelligt indhold
``` 