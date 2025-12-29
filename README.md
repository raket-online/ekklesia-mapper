# Ekklesia Mapper

A visual church mapping tool designed to help religious organizations map and measure all groups within their movement. Build hierarchical church structures, track key metrics, and visualize your spiritual network.

![Ekklesia Mapper](https://img.shields.io/badge/Vue-3.5.13-42b883?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.3.0-ffd04b?style=flat&logo=pinia&logoColor=white)

## Features

- **Visual Church Tree**: Interactive hierarchical visualization of your church structure
- **Smart Zoom**: Automatic zoom adjustment to fit all churches on screen
- **Pan & Zoom**: Navigate large church structures with intuitive zoom controls
- **Dynamic Metrics System**: Customize and track any metrics important to your movement
  - Default metrics included: Members, Baptized, Calling, Community, Commission, Reaching
  - Add custom metrics via Admin Panel
  - Choose from 6 colors and 20+ icons
- **Real-time Statistics**: Live updates of totals and percentages in compact stats panel
- **Persistent Storage**: All data saved locally in your browser (no server required)
- **Responsive Design**: Beautiful gradient UI with hover effects and smooth transitions
- **Admin Panel**: Manage your metrics, reorder them, or reset to defaults

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ekklesia-mapper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Adding Churches

1. Click the **"Child"** button on any church to add a child church
2. Fill in the church name and member metrics
3. Click **"Add"** to save

### Editing Churches

1. Click the **pencil icon** (Edit button) in the header of any church
2. Modify the church details
3. Click **"Save"** to update

### Deleting Churches

1. Click the **trash icon** (Delete button) in the header of any church (except the Mother Church)
2. Confirm the deletion
3. The church and all its sub-churches will be removed

### Navigation

- **Smart Zoom**: The app automatically adjusts zoom to fit all churches when loading, adding, or deleting
- **Zoom In**: Click the + button or use the scroll wheel
- **Zoom Out**: Click the - button
- **Reset View**: Click the Reset button to fit all churches on screen
- **Pan**: Click and drag on the canvas to move around

### Managing Metrics

1. Click the **Settings icon** (gear) in the top-right of the header
2. **Add Metric**: Click "Add Metric", choose name, color, and icon
3. **Edit Metric**: Click the pencil icon on any metric card
4. **Delete Metric**: Click the trash icon (cannot delete primary metric)
5. **Reorder**: Drag and drop metrics to change display order
6. **Reset**: Click "Reset to Defaults" to restore original 6 metrics

## Project Structure

```
ekklesia-mapper/
├── src/
│   ├── components/
│   │   ├── TreeNode.vue         # Individual church card in the tree
│   │   ├── ChurchForm.vue       # Modal for adding/editing churches
│   │   ├── StatsPanel.vue       # Compact floating statistics panel
│   │   ├── AdminPanel.vue       # Settings modal for metrics management
│   │   ├── MetricList.vue       # List of metrics with drag-and-drop
│   │   ├── MetricItem.vue       # Individual metric card
│   │   ├── MetricForm.vue       # Form for adding/editing metrics
│   │   └── MetricEditModal.vue  # Modal for editing metrics
│   ├── composables/
│   │   └── usePanZoom.ts        # Pan and zoom with smart fit-to-screen
│   ├── stores/
│   │   ├── churches.ts          # Pinia store for church data management
│   │   └── metrics.ts           # Pinia store for dynamic metrics
│   ├── utils/
│   │   ├── sanitize.ts          # Input sanitization utilities
│   │   └── metricColors.ts      # Tailwind JIT-compatible color mappings
│   ├── config/
│   │   └── app.config.ts        # Centralized app configuration
│   ├── constants/
│   │   └── icons.ts             # SVG icon path definitions
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── App.vue                  # Main application component
│   └── main.ts                  # Application entry point
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Data Model

Each church object contains:

```typescript
{
  id: string,                    // Unique identifier
  name: string,                  // Church name
  parentId: string | null,       // Parent church ID (null for Mother Church)
  metrics: Record<string, number> // Dynamic metrics based on user configuration
  // Example:
  // {
  //   members: 8,
  //   baptized: 5,
  //   calling: 7,
  //   community: 6,
  //   commission: 4,
  //   reaching: 3
  // }
}
```

**Metrics are fully customizable** - add, edit, delete, and reorder any metrics that matter to your organization.

## Metrics Explained

The Five Circles of Ekklesia:

1. **Calling (Connectie met God)**: Vertical relationship with God
2. **Community (Connectie met familie)**: Horizontal relationships within the church
3. **Commission (Dienen van anderen)**: Outward service to those in need
4. **Baptized (Gedoopt)**: Water baptism as public declaration of faith
5. **Reaching (Bereiken van anderen)**: Evangelism and outreach to new people

## Data Storage

All data is stored in your browser's LocalStorage:
- **Churches**: `ekklesia-churches` - All church data with metrics
- **Metrics**: `ekklesia-metrics` - Metric definitions and configuration

This means:
- ✅ Data persists across browser sessions
- ✅ No server required
- ✅ Works offline
- ✅ Fully customizable metrics system
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete all churches

### Export/Import Data

You can manually backup your data:

**Export** (run in browser console):
```javascript
const data = {
  churches: localStorage.getItem('ekklesia-churches'),
  metrics: localStorage.getItem('ekklesia-metrics')
};
console.log(JSON.stringify(data));
// Copy the output and save it
```

**Import** (run in browser console):
```javascript
const data = JSON.parse('your-pasted-data-here');
localStorage.setItem('ekklesia-churches', data.churches);
localStorage.setItem('ekklesia-metrics', data.metrics);
location.reload();
```

## Technologies Used

- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Pinia**: State management for Vue
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next generation frontend tooling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Built with ❤️ for church communities worldwide**
