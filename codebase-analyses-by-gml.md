# Ekklesia Mapper - Codebase Analyse

**Datum:** 28 december 2025
**Analyse door:** GML (via Claude Code)
**Project:** Ekklesia Mapper - Vue 3 Church Mapping Application

---

## Inhoudsopgave

1. [Bugs en Functionele Problemen](#1-bugs-en-functionele-problemen)
2. [Uitbreidbaarheid van de Code](#2-uitbreidbaarheid-van-de-code)
3. [Best Practices en Standaarden](#3-best-practices-en-standaarden)
4. [Moderniteit van de Applicatie](#4-moderniteit-van-de-applicatie)
5. [Veiligheidsaspecten](#5-veiligheidsaspecten)
6. [Code Eenvoud en Logica](#6-code-eenvoud-en-logica)
7. [Conclusie en Aanbevelingen](#7-conclusie-en-aanbevelingen)

---

## 1. Bugs en Functionele Problemen

### 🔴 Kritieke Bugs

#### 1.1 Hardcoded Metric Validaties in Churches Store
**Locatie:** `src/stores/churches.js` (regels 68-84, 99-114)

**Probleem:**
De validatie is hardcoded voor specifieke metrics (`baptized`, `calling`, `community`, `commission`, `reaching`). Dit breekt wanneer gebruikers custom metrics toevoegen via de AdminPanel.

```javascript
// HUIDIGE CODE - BROKEN
if (data.metrics.baptized > data.metrics.members) {
  throw new Error('Baptized cannot exceed members')
}
// ... meer hardcoded checks
```

**Impact:**
- Gebruiker kan geen custom metric toevoegen die gevalideerd wordt tegen de primary metric
- Wanneer een gebruiker een metric "Prayer" toevoegt, wordt deze niet gevalideerd
- Kan leiden tot inconsistente data

**Oplossing:**
Validatie moet dynamisch zijn en alle metrics (behalve primary) checken tegen de primary metric.

#### 1.2 Ontbrekende Fallback bij Metrics Initialization
**Locatie:** `src/stores/churches.js` (regels 42-60)

**Probleem:**
`ensureMetrics()` controleert of metrics bestaan, maar als de metricsStore nog niet geladen is, kunnen er problemen optreden bij de initialisatie.

**Impact:**
- Mogelijke race condition bij app start
- Kan leiden tot missing keys in church.metrics

#### 1.3 Geen Validatie op Metric Key Uniekheid
**Locatie:** `src/stores/metrics.js` (regel 134)

**Probleem:**
Bij het toevoegen van een metric wordt de key gegenereerd uit de naam (lowercase, spaces replaced), maar er is geen check of deze key al bestaat.

```javascript
key: metricData.key.toLowerCase().replace(/\s+/g, '_')
```

**Impact:**
- Twee metrics met dezelfde naam (case-insensitive) overschrijven elkaar
- Data corruption mogelijk

### 🟡 Medium Priority Issues

#### 1.4 Geen Input Sanitization
**Locatie:** `src/components/ChurchForm.vue`

**Probleem:**
User input (name) wordt niet gesanitized voordat deze wordt opgeslagen. Hoewel dit voornamelijk een client-side app is, kan dit leiden tot XSS issues als de data ooit wordt getoond zonder escaping.

#### 1.5 Sync Probleem bij Store Initialization
**Locatie:** `src/stores/churches.js` (regels 10-34, 185-188)

**Probleem:**
De `loadFromStorage()` wordt direct aangeroepen bij import, voordat de metricsStore volledig geïnitialiseerd is. Dit kan leiden tot inconsistenties.

#### 1.6 UUID/ID Generatie Niet Collision-Safe
**Locatie:** `src/stores/churches.js` (regel 87)

```javascript
id: 'church-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
```

**Probleem:**
- `Date.now()` heeft resolutie van 1ms
- `Math.random()` is niet cryptographically secure
- In snel achter elkaar toegevoegde churches kan dit leiden tot ID collisions

### 🟢 Lage Priority Issues

#### 1.7 Geen Error Handling bij localStorage Access
**Locatie:** Meerdere bestanden

**Probleem:**
Geen try-catch rondom localStorage operaties. Als localStorage vol is of disabled is in browser, crasht de app.

#### 1.8 Ontbrekende Type Checks
**Locatie:** `src/stores/churches.js`

**Probleem:**
Geen runtime type checking om te verzekeren dat `data.metrics` een object is en correcte waarden bevat.

---

## 2. Uitbreidbaarheid van de Code

### ✅ Sterke Punten

#### 2.1 Uitstekende Scheiding van Concerns
- **Stores:** Pinia stores voor state management
- **Composables:** `usePanZoom` voor herbruikbare logica
- **Components:** Duidelijk gescheiden UI componenten

#### 2.2 Dynamische Metrics Architectuur
Het metrics systeem is volledig uitbreidbaar:
- Custom metrics toevoegen via AdminPanel
- Drag-and-drop reordering
- Kleuren en iconen aanpasbaar
- Primary concept voor belangrijkste metric

#### 2.3 Component Hiërarchie
```
App.vue
├── TreeNode.vue (recursief)
├── ChurchForm.vue
├── AdminPanel.vue
└── StatsPanel.vue
```

Dit is een schone, logische structuur die makkelijk uit te breiden is.

### ⚠️ Uitbreidbaarheidsproblemen

#### 2.1 Icon Definities Gedupliceerd
**Locatie:** TreeNode.vue, AdminPanel.vue, StatsPanel.vue

**Probleem:**
De `availableIcons` array is in drie componenten gekopieerd (rond 160-270 regels per bestand).

```javascript
// AANWEZIG IN 3 BESTANDEN - 480 REGELS DUPLICATIE
const availableIcons = [
  { id: 'users', path: '...' },
  { id: 'plus', path: '...' },
  // ... 24 icons
]
```

**Impact:**
- Nieuw icon toevoegen = 3 bestanden aanpassen
- Foutgevoelig
- Onderhouds-intensief

**Oplossing:**
Maak een composable of constants file: `src/composables/useIcons.js` of `src/constants/icons.js`

#### 2.2 Store Dependencies Niet Duidelijk Gedefinieerd
**Locatie:** `src/stores/churches.js` (regel 8)

```javascript
const metricsStore = useMetricsStore()
```

**Probleem:**
De churchesStore importeert de metricsStore direct. Dit creëert een tight coupling die problematisch kan zijn bij testing en circular dependencies.

**Oplossing:**
Gebruik dependency injection of een meer losse architectuur.

#### 2.3 Geen Plugin/Extension Systeem
Als men de app wil uitbreiden met:
- Export functionaliteit (PDF, Excel)
- Import functionaliteit (CSV, JSON)
- Custom visualizations
- Additional analytics

Er is geen duidelijke extension point.

#### 2.4 Hardcoded Colors en Styling
**Locatie:** Overal in Vue components

**Probleem:**
Tailwind classes zijn hardcoded. Als je een thema wilt toevoegen (dark mode), moet je elk component aanpassen.

**Oplossing:**
Gebruik CSS custom properties of een theming systeem.

#### 2.5 Geen Configuration File
App settings zoals:
- Max zoom levels
- Default church name
- Storage keys (`ekklesia-churches`, `ekklesia-metrics`)
- Validation rules

zijn hardcoded in de code.

**Oplossing:**
Maak een `src/config/app.config.js` file.

---

## 3. Best Practices en Standaarden

### ✅ Goede Praktijken

#### 3.1 Vue 3 Composition API
Correct gebruik van `<script setup>`, `ref`, `computed`, `watch`. Dit is de moderne standaard voor Vue 3.

#### 3.2 Pinia voor State Management
Pinia is de officiële replacement voor Vuex. Correct geïmplementeerd met setup syntax.

#### 3.3 Component Naming
- PascalCase voor components: `TreeNode.vue`, `ChurchForm.vue` ✅
- kebab-case in templates: `<tree-node>`, `<church-form>` ✅

#### 3.4 ESLint/Prettier Ready
De projectstructuur suggereert dat linting gebruikt kan worden.

#### 3.5 Reactive Patterns
Correct gebruik van computed properties voor afgeleide data:
```javascript
const totalStats = computed(() => { ... })
```

### ⚠️ Probleemgebieden

#### 3.1 Ontbrekende TypeScript
**Probleem:**
Geen type safety. Dit leidt tot:
- Runtime errors die tijdens compile time opgevallen zouden zijn
- Minder goede IDE support
- Moeilijker te refactoren

**Impact op codebase:**
```javascript
// HUIDIG - GEEN TYPE CHECKS
const addChurch = (parentId, data) => {
  // data is onbekend type
  if (data.metrics.baptized > data.metrics.members) { // CRASH als metrics undefined
```

**Aanbeveling:**
Migreer naar TypeScript of gebruik JSDoc type hints.

#### 3.2 Ontbrekende Prop Validaties
**Locatie:** `src/components/TreeNode.vue` (regels 112-125)

```javascript
defineProps({
  church: {
    type: Object,
    required: true
  },
  // GEEN validatie op object structure
})
```

**Probleem:**
Geen validatie op de shape van het `church` object. Als het object niet de verwachte structuur heeft, crasht de component.

**Oplossing:**
```javascript
church: {
  type: Object,
  required: true,
  validator: (value) => {
    return value.id && value.name && value.metrics
  }
}
```

#### 3.3 Geen Unit Tests
**Probleem:**
Geen testframework aanwezig. Geen:
- Unit tests voor stores
- Component tests
- E2E tests

**Impact:**
- Regressies moeilijk op te sporen
- Refactoring is risicovol
- Moeilijk om te verifiëren dat fixes werken

#### 3.4 Geen Error Boundaries
Vue 3 heeft `onErrorCaptured` lifecycle hook. Niet gebruikt in de app.

**Probleem:**
Als een component crasht, crasht de hele pagina.

#### 3.5 Geen Logging/Debugging System
Geen centrale logging. Alle `console.log` calls zijn verwijderd (of nooit toegevoegd).

**Probleem:**
Moeilijk om productie issues te debuggen.

#### 3.6 Mixed String Quoting Style
Soms single quotes, soms double quotes:
```javascript
// Dubbele quotes
"name": "Ekklesia Mapper"

// Single quotes in template
class="bg-gradient-to-r from-blue-600 to-purple-600"
```

**Aanbeveling:**
Kies één stijl (bij voorkeur single quotes in JS, double in HTML).

#### 3.7 Ontbrekende Comments
Bijna geen comments in de code. De code is self-documenting, maar complexe logica (zoals `ensureMetrics()`, `collectDescendants()`) zou baat hebben bij uitleg.

---

## 4. Moderniteit van de Applicatie

### ✅ Moderne Technologieën

#### 4.1 Vue 3.5.13
- Nieuwste Vue 3 versie
- Composition API (standaard voor Vue 3)
- `<script setup>` syntax

#### 4.2 Vite 6.0.5
- Ultra-fast build tool
- Modern ESM-based bundling
- Hot Module Replacement (HMR)

#### 4.3 Tailwind CSS 3.4.17
- Utility-first CSS framework
- Moderne styling approach
- Uitstekende developer experience

#### 4.4 Pinia 2.3.0
- Modern state management
- TypeScript support (ready)
- DevTools integration

### ⚠️ Verouderde/Ontbrekende Moderne Features

#### 4.1 Geen Build Optimization
**Bestand:** `vite.config.js`

Mogelijk niet geconfigureerd voor:
- Code splitting
- Tree shaking
- Asset optimization
- Compression

**Aanbeveling:**
Voeg toe aan `vite.config.js`:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['vue', 'pinia']
      }
    }
  }
}
```

#### 4.2 Geen Progressive Web App (PWA) Features
Geen:
- Service Worker
- Offline support
- App manifest
- Push notifications

**Aanbeveling:**
Overweeg `vite-plugin-pwa` toe te voegen.

#### 4.3 Geen Internationalization (i18n)
App is volledig in het Engels (hoewel user Nederlands spreekt). Geen i18n systeem voor meertaligheid.

#### 4.4 Ontbrekende SEO Meta Tags
**Bestand:** `index.html`

Minimale meta tags:
```html
<title>Ekklesia Mapper</title>
<!-- Geen description, keywords, OG tags, etc. -->
```

#### 4.5 Geen Accessibility (a11y) Features
- Geen ARIA labels
- Geen keyboard navigation support (behalve toetsenbord in form)
- Geen screen reader support
- Geen focus management in modals

**Voorbeeld:**
```vue
<!-- HUIDIG -->
<button @click="showAdmin = true">Settings</button>

<!-- BETER -->
<button @click="showAdmin = true" aria-label="Open settings panel">Settings</button>
```

#### 4.6 Geen Performance Monitoring
Geen:
- Web Vitals tracking
- Performance monitoring
- Error tracking (Sentry, etc.)

### 📊 Moderniteitsscore: 7/10

**Positief:**
- Vue 3 Composition API ✅
- Vite build tool ✅
- Tailwind CSS ✅
- Pinia state management ✅

**Kan beter:**
- TypeScript ❌
- PWA features ❌
- i18n ❌
- Accessibility ❌
- Testing ❌

---

## 5. Veiligheidsaspecten

### 🔶 Medium Risk Issues

#### 5.1 localStorage zonder Encryptie
**Locatie:** `src/stores/churches.js`, `src/stores/metrics.js`

```javascript
localStorage.setItem('ekklesia-churches', JSON.stringify(churches.value))
```

**Probleem:**
- Data wordt opgeslagen als plaintext
- Iedereen met browser access kan de data lezen/wijzigen
- Geen integriteitscheck

**Risico:**
- User kan data manipuleren (via DevTools Console)
- Als er gevoelige data wordt opgeslagen (bijv. namen, aantallen mensen), is dit zichtbaar

**Aanbeveling:**
- Voor huidige gebruik: Acceptabel (geen gevoelige data)
- Voor toekomst: Overweeg encryption of server-side storage

#### 5.2 Geen Input Sanitization
**Locatie:** `src/components/ChurchForm.vue`

```javascript
name: data.name  // Directe opslag zonder sanitization
```

**Probleem:**
- Mogelijk XSS als data ooit onveilig wordt getoond
- Geen length limits op input

**Aanbeveling:**
```javascript
name: DOMPurify.sanitize(data.name).substring(0, 255)
```

#### 5.3 Ontbrekende Content Security Policy (CSP)
**Bestand:** `index.html`

Geen CSP meta tag of HTTP headers.

**Risico:**
- XSS aanvallen mogelijk als er ooit dynamic content wordt toegevoegd

#### 5.4 Geen CORS Configuratie
Niet van toepassing (geen externe API calls), maar goed om te noteren.

### ✅ Lage Risk / Goede Praktijken

#### 5.1 Client-Side Only App
Omdat de app volledig client-side is:
- Geen server-side vulnerabilities
- Geen SQL injection risico
- Geen authentication issues

#### 5.2 Geen Third-Party Dependencies Risico
Minimal dependencies:
- Vue (vertrouwd)
- Pinia (vertrouwd)
- Vite (build tool only)

### 📊 Veiligheidsscore: 6/10

**Positief:**
- Client-side only ✅
- Minimale dependencies ✅
- Geen API calls ✅

**Verbeterpunten:**
- Input sanitization ❌
- CSP headers ❌
- Data encryption ❌
- Length limits ❌

---

## 6. Code Eenvoud en Logica

### ✅ Sterke Punten

#### 6.1 Duidelijke Bestandsstructuur
```
src/
├── components/     # UI components
├── composables/    # Reusable logic
├── stores/         # State management
├── App.vue         # Root component
└── main.js         # Entry point
```

Consistente en logische organisatie.

#### 6.2 Consistentie in Component Structuur
Alle components volgen hetzelfde patroon:
```vue
<template>
  <!-- HTML template -->
</template>

<script setup>
  // Logic
</script>
```

Dit maakt de code makkelijk te lezen en te navigeren.

#### 6.3 Leesbare Variabele Namen
```javascript
const churches = ref([])
const getChildren = (parentId) => { ... }
const ensureMetrics = () => { ... }
```

Duidelijk en intention-revealing.

#### 6.4 Duidelijke Data Flow
```
User Action → Component Event → Store Method → localStorage Update → Reactive UI Update
```

### ⚠️ Complexiteitsproblemen

#### 6.1 Grote Components (Violation of SRP)
**Locatie:** `src/components/AdminPanel.vue` (387 regels)

**Probleem:**
Eén component doet te veel:
- Metrics lijst tonen
- Drag-and-drop handling
- Add metric form
- Edit metric modal
- Delete functionality
- Reset functionality

**Aanbeveling:**
Split op in:
- `AdminPanel.vue` (container)
- `MetricList.vue` (lijst met drag-drop)
- `MetricForm.vue` (add/edit form)
- `MetricItem.vue` (individuele metric)

#### 6.2 Complexe Icon Logica Gedupliceerd
**Locatie:** 3 components, elk met 160+ regels icon data

**Probleem:**
De `getIconPath()` functie is in elk component gekopieerd:
```javascript
const getIconPath = (iconId) => {
  const icon = availableIcons.find(i => i.id === iconId)
  return icon ? icon.path : availableIcons[1].path
}
```

Dit is 3x gekopieerd.

#### 6.3 Nested Conditionals
**Locatie:** `src/stores/churches.js` (regels 68-84)

```javascript
if (data.metrics.baptized > data.metrics.members) {
  throw new Error('Baptized cannot exceed members')
}
if (data.metrics.calling > data.metrics.members) {
  throw new Error('Calling cannot exceed members')
}
// ... meer van hetzelfde
```

Dit is DRY (Don't Repeat Yourself) violation.

**Oplossing:**
```javascript
const primaryMetric = metricsStore.getPrimaryMetric()
metricsStore.metrics
  .filter(m => !m.isPrimary)
  .forEach(metric => {
    if (data.metrics[metric.key] > data.metrics[primaryMetric.key]) {
      throw new Error(`${metric.name} cannot exceed ${primaryMetric.name}`)
    }
  })
```

#### 6.4 Magic Numbers en Strings
**Locatie:** Door de hele codebase

```javascript
localStorage.setItem('ekklesia-churches', ...)  // Magic string
localStorage.setItem('ekklesia-metrics', ...)   // Magic string

id: 'church-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)  // Magic format

if (newScale >= 0.2 && newScale <= 3)  // Magic numbers
```

**Aanbeveling:**
Defineer constants:
```javascript
// config/constants.js
export const STORAGE_KEYS = {
  CHURCHES: 'ekklesia-churches',
  METRICS: 'ekklesia-metrics'
}

export const ZOOM_LIMITS = {
  MIN: 0.2,
  MAX: 3
}
```

#### 6.5 Lange Functies
**Locatie:** `src/stores/churches.js` - `ensureMetrics()` (19 regels)

Niet extreem lang, maar zou kunnen worden vereenvoudigd met:
- Early returns
- Helper functions
- Meer beschrijende variabelen

### 📊 Code Eenvoud Score: 7/10

**Positief:**
- Duidelijke structuur ✅
- Leesbare namen ✅
- Consistentie ✅

**Verbeterpunten:**
- Te grote components ❌
- Gedupliceerde logica ❌
- Magic numbers/strings ❌
- DRY violations ❌

---

## 7. Conclusie en Aanbevelingen

### 📊 Overall Scores

| Categorie | Score | Status |
|-----------|-------|--------|
| Bugs en Functionaliteit | 5/10 | ⚠️ Tekortkomingen |
| Uitbreidbaarheid | 7/10 | ✅ Goed |
| Best Practices | 6/10 | ⚠️ Matig |
| Moderniteit | 7/10 | ✅ Goed |
| Veiligheid | 6/10 | ⚠️ Matig |
| Code Eenvoud | 7/10 | ✅ Goed |

**Totaalscore: 6.3/10**

---

### 🎯 Prioritaire Aanbevelingen

#### 🔴 Hoog Prioriteit (Moet nu)

1. **Fix Hardcoded Metric Validation**
   - Maak validatie dynamisch in churches store
   - Voorkom dat custom metrics niet gevalideerd worden

2. **Extract Icons naar Aparte File**
   - Maak `src/constants/icons.js` of `src/composables/useIcons.js`
   - Verwijder 480 regels duplicatie

3. **Voeg Error Handling toe aan localStorage**
   - Try-catch rondom alle localStorage operaties
   - Fallback mechanism bij storage failure

4. **Input Validatie verbeteren**
   - Length limits op name fields
   - Basic sanitization (zelfs zonder library)

#### 🟡 Medium Prioriteit (Moet binnenkort)

5. **Type Safety toevoegen**
   - Migratie naar TypeScript OF
   - JSDoc type hints toevoegen

6. **Split Grote Components**
   - AdminPanel.vue (387 regels) → 4 components
   - Verbeter testability en maintainability

7. **Voeg Testing Framework toe**
   - Vitest voor unit tests
   - Vue Test Utils voor component tests
   - Minimum 60% coverage target

8. **Configuration File**
   - Maak `src/config/app.config.js`
   - Verplaats magic strings en numbers

#### 🟢 Lage Prioriteit (Nice to have)

9. **PWA Features**
   - Service worker voor offline support
   - App manifest voor installability

10. **Accessibility verbeteren**
    - ARIA labels toevoegen
    - Keyboard navigation verbeteren
    - Focus management in modals

11. **i18n Systeem**
    - Vue I18n integratie
    - NL en EN taalondersteuning

12. **Performance Monitoring**
    - Web Vitals tracking
    - Optioneel: Sentry voor error tracking

---

### 💡 Architectuur Aanbevelingen

#### Voor Uitbreidbaarheid

1. **Plugin System**
   ```javascript
   // plugins/export-plugin.js
   export const exportPlugin = {
     name: 'export',
     exportToJSON() { ... },
     exportToPDF() { ... }
   }
   ```

2. **Event Bus voor Communicatie**
   Voor losse coupling tussen components:
   ```javascript
   // composables/useEventBus.js
   export const eventBus = mitt()
   ```

3. **Dependency Injection voor Stores**
   In plaats van directe imports:
   ```javascript
   // Instead of:
   const metricsStore = useMetricsStore()

   // Use:
   const addChurch = (parentId, data, metricsStore) => { ... }
   ```

#### Voor Onderhoudbaarheid

1. **Documentation**
   - JSDoc comments bij complexe functies
   - README.md met architecture diagram
   - CONTRIBUTING.md met coding standards

2. **Linting en Formatting**
   ```json
   {
     "scripts": {
       "lint": "eslint .",
       "lint:fix": "eslint . --fix",
       "format": "prettier --write ."
     }
   }
   ```

3. **Pre-commit Hooks**
   - Husky voor git hooks
   - Lint-staged voor staged files only

---

### 📈 Roadmap naar Verbetering

**Sprint 1 (1-2 dagen): Critical Bug Fixes**
- [ ] Dynamische metric validatie
- [ ] localStorage error handling
- [ ] Icons extraction
- [ ] Input sanitization basics

**Sprint 2 (3-5 dagen): Code Quality**
- [ ] TypeScript migratie OF JSDoc
- [ ] Component splitting (AdminPanel)
- [ ] Testing framework setup
- [ ] Basis tests voor stores

**Sprint 3 (1 week): Features & Polish**
- [ ] Configuration file
- [ ] Constants extraction
- [ ] Accessibility improvements
- [ ] PWA features

**Sprint 4 (1 week): Advanced**
- [ ] Plugin system
- [ ] Export/Import functionality
- [ ] i18n support
- [ ] Performance monitoring

---

### 🔍 Conclusie

De Ekklesia Mapper is een **functionele en moderne applicatie** gebouwd met goede technologieën (Vue 3, Vite, Tailwind, Pinia). De architectuur is over het algemeen **logisch en uitbreidbaar**.

Echter, er zijn **significante problemen** op het gebied van:
- **Bug fixes nodig** (hardcoded validaties)
- **Code duplicatie** (icons in 3 bestanden)
- **Type safety** (geen TypeScript)
- **Testing** (geen tests)
- **Error handling** (geen try-catch)

Met de aanbevelingen uit dit rapport kan de app worden getransformeerd naar een **productie-kwaliteit applicatie** met:
- ✅ Geen kritieke bugs
- ✅ Uitstekende uitbreidbaarheid
- ✅ Type safety
- ✅ Test coverage
- ✅ Professional code quality

**Recommendatie:** Begin met de "Hoog Prioriteit" aanbevelingen en werk systematisch door de lijst.

---

**Einde Rapport**

*Gegenereerd door GML via Claude Code*
*28 december 2025*
