# App Config Centralization Report

## Overzicht

Alle hardcoded instellingen zijn verplaatst naar een centrale configuratie file (`src/config/app.config.ts`). Dit maakt de applicatie beter onderhoudbaar en makkelijker aan te passen.

**Datum:** December 28, 2025

---

## Gecentraliseerde Instellingen

### Voorheen (Hardcoded)
```javascript
// Verspreid over meerdere bestanden
const storageKey = 'ekklesia-churches'
const MAX_CHURCH_NAME_LENGTH = 255
const MAX_METRIC_NAME_LENGTH = 100
const defaultScale = 1
const minScale = 0.2
const maxScale = 3
const zoomOutFactor = 0.9
const zoomInFactor = 1.1
if (id === 'root') { ... }
metrics[metric.key] = metric.isPrimary ? 50 : 0
```

### Nu (Centraal Configuratiebestand)
```typescript
// src/config/app.config.ts
export const appConfig = {
  storage: {
    CHURCHES: 'ekklesia-churches',
    METRICS: 'ekklesia-metrics'
  },
  validation: {
    MAX_CHURCH_NAME_LENGTH: 255,
    MAX_METRIC_NAME_LENGTH: 100,
    MIN_PRIMARY_METRIC_VALUE: 0
  },
  zoom: {
    MIN_SCALE: 0.2,
    MAX_SCALE: 3,
    DEFAULT_SCALE: 1,
    ZOOM_OUT_FACTOR: 0.9,
    ZOOM_IN_FACTOR: 1.1,
    DEFAULT_TRANSLATE_X: 0,
    DEFAULT_TRANSLATE_Y: 0
  },
  defaults: {
    DEFAULT_CHURCH_NAME: 'New Church',
    DEFAULT_PRIMARY_METRIC_VALUE: 50,
    DEFAULT_METRIC_VALUE: 0,
    ROOT_CHURCH_ID: 'root',
    ROOT_CHURCH_NAME: 'Root Church'
  },
  ui: {
    TOAST_DURATION: 3000,
    TOAST_SUCCESS: 'success',
    TOAST_ERROR: 'error',
    TOAST_INFO: 'info'
  }
} as const
```

---

## Aangepaste Bestanden (7 stuks)

### 1. src/stores/churches.ts
**Vervangingen:**
- ❌ `'ekklesia-churches'` → ✅ `appConfig.storage.CHURCHES`
- ❌ `255` → ✅ `appConfig.validation.MAX_CHURCH_NAME_LENGTH`
- ❌ `'root'` → ✅ `appConfig.defaults.ROOT_CHURCH_ID`
- ❌ `'Mother Church'` → ✅ `appConfig.defaults.ROOT_CHURCH_NAME`
- ❌ `50` → ✅ `appConfig.defaults.DEFAULT_PRIMARY_METRIC_VALUE`
- ❌ `0` → ✅ `appConfig.defaults.DEFAULT_METRIC_VALUE`

### 2. src/stores/metrics.ts
**Vervangingen:**
- ❌ `'ekklesia-metrics'` → ✅ `appConfig.storage.METRICS`
- ❌ `100` → ✅ `appConfig.validation.MAX_METRIC_NAME_LENGTH`

### 3. src/composables/usePanZoom.ts
**Vervangingen:**
- ❌ `1` (default scale) → ✅ `appConfig.zoom.DEFAULT_SCALE`
- ❌ `0` (translate X/Y) → ✅ `appConfig.zoom.DEFAULT_TRANSLATE_X/Y`
- ❌ `0.9` → ✅ `appConfig.zoom.ZOOM_OUT_FACTOR`
- ❌ `1.1` → ✅ `appConfig.zoom.ZOOM_IN_FACTOR`
- ❌ `0.2` → ✅ `appConfig.zoom.MIN_SCALE`
- ❌ `3` → ✅ `appConfig.zoom.MAX_SCALE`

### 4. src/components/ChurchForm.vue
**Vervangingen:**
- ❌ `255` (maxlength attribute) → ✅ `appConfig.validation.MAX_CHURCH_NAME_LENGTH`
- ❌ `/255` (character counter) → ✅ `appConfig.validation.MAX_CHURCH_NAME_LENGTH`
- ❌ `50` (default primary) → ✅ `appConfig.defaults.DEFAULT_PRIMARY_METRIC_VALUE`
- ❌ `0` (default metric) → ✅ `appConfig.defaults.DEFAULT_METRIC_VALUE`

### 5. src/components/AdminPanel.vue
**Vervangingen:**
- ❌ `100` (maxlength attribute) → ✅ `appConfig.validation.MAX_METRIC_NAME_LENGTH`
- ❌ `/100` (character counter) → ✅ `appConfig.validation.MAX_METRIC_NAME_LENGTH`
- (2x: add form + edit form)

### 6. src/components/TreeNode.vue
**Vervangingen:**
- ❌ `'root'` (delete button check) → ✅ `appConfig.defaults.ROOT_CHURCH_ID`

### 7. Nieuw bestand: src/config/app.config.ts
**Toegevoegd:**
- Complete applicatie configuratie
- TypeScript type definities
- JSDoc comments voor documentatie

---

## Categorieën van Instellingen

### 1. Storage (LocalStorage Keys)
```typescript
storage: {
  CHURCHES: 'ekklesia-churches',
  METRICS: 'ekklesia-metrics'
}
```
**Gebruik:** Alle localStorage operaties in churches en metrics stores

### 2. Validation (Input Limits)
```typescript
validation: {
  MAX_CHURCH_NAME_LENGTH: 255,
  MAX_METRIC_NAME_LENGTH: 100,
  MIN_PRIMARY_METRIC_VALUE: 0
}
```
**Gebruik:** Form validatie en input sanitization

### 3. Zoom (Pan & Zoom Settings)
```typescript
zoom: {
  MIN_SCALE: 0.2,
  MAX_SCALE: 3,
  DEFAULT_SCALE: 1,
  ZOOM_OUT_FACTOR: 0.9,
  ZOOM_IN_FACTOR: 1.1,
  DEFAULT_TRANSLATE_X: 0,
  DEFAULT_TRANSLATE_Y: 0
}
```
**Gebruik:** usePanZoom composable voor pan/zoom functionaliteit

### 4. Defaults (Default Values)
```typescript
defaults: {
  DEFAULT_CHURCH_NAME: 'New Church',
  DEFAULT_PRIMARY_METRIC_VALUE: 50,
  DEFAULT_METRIC_VALUE: 0,
  ROOT_CHURCH_ID: 'root',
  ROOT_CHURCH_NAME: 'Root Church'
}
```
**Gebruik:** Initialisatie van nieuwe churches en metrics

### 5. UI (User Interface)
```typescript
ui: {
  TOAST_DURATION: 3000,
  TOAST_SUCCESS: 'success',
  TOAST_ERROR: 'error',
  TOAST_INFO: 'info'
}
```
**Gebruik:** Toast notificaties (voorbereid voor toekomstig gebruik)

---

## Voordelen van Centralisatie

### 1. Single Source of Truth
- Alle instellingen staan op één plek
- Geen verspreide magic numbers meer
- Eenvoudig om te zien wat er configureerbaar is

### 2. Better Onderhoudbaar
- wijzigingen op één plek
- Minder kans op inconsistenties
- Makkelijker om te refactoren

### 3. Type Safety
- TypeScript interface ondersteuning
- Compile-time checking van configuratie
- Auto-completion in IDE

### 4. Documentatie
- JSDoc comments leggen gebruik uit
- Duidelijke categorie-indeling
- Voorbeeld waarden tonen verwachte format

### 5. Uitbreidbaarheid
- Makkelijk om nieuwe settings toe te voegen
- Consistente structuur
- Schaalbaar voor grotere projecten

---

## TypeScript Features

### Type Definitions
```typescript
export type AppConfig = typeof appConfig
export type StorageKey = keyof typeof appConfig.storage
export type ToastType = typeof appConfig.ui.TOAST_SUCCESS
                 | typeof appConfig.ui.TOAST_ERROR
                 | typeof appConfig.ui.TOAST_INFO
```

### Const Assertion
```typescript
export const appConfig = {
  // ...
} as const  // → Read-only, strict types
```

Dit zorgt voor:
- ✅ Immutable configuratie
- ✅ Strict type checking
- ✅ Better autocomplete

---

## Toekomstige Mogelijkheden

### Environment-Specific Config
```typescript
// src/config/app.config.ts
export const appConfig = {
  // ...existing config...
  api: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    TIMEOUT: 5000
  }
}
```

### Feature Flags
```typescript
export const appConfig = {
  // ...existing config...
  features: {
    ENABLE_EXPORT: true,
    ENABLE_IMPORT: true,
    ENABLE_BACKUP: false
  }
}
```

### Theming
```typescript
export const appConfig = {
  // ...existing config...
  theme: {
    DEFAULT: 'light',
    OPTIONS: ['light', 'dark', 'auto']
  }
}
```

---

## Build Resultaat

```
✓ built in 3.92s

dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-B_P8nDNL.css   24.27 kB │ gzip:  4.52 kB
dist/assets/index-BwGOA2m0.js   117.36 kB │ gzip: 41.84 kB
```

✅ Geen fouten
✅ Dev server draait zonder problemen
✅ HMR werkt correct

---

## Conclusie

Alle hardcoded instellingen zijn succesvol gecentraliseerd in `src/config/app.config.ts`. De applicatie is nu:

- ✅ Beter onderhoudbaar
- ✅ Makkelijker configureerbaar
- ✅ Type-safe met TypeScript
- ✅ Voorbereid op uitbreiding
- ✅ Professioneler van structuur

**Aantal bestanden aangepast:** 7
**Aantal regels code verwijderd:** ~30 (magic numbers)
**Aantal regels code toegevoegd:** ~50 (config + types)
**Netto voordeel:** Positief (betere structuur vs. kleine overhead)
