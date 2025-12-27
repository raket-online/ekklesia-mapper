# Ekklesia Mapper

A visual church mapping tool designed to help religious organizations map and measure all groups within their movement. Build hierarchical church structures, track key metrics, and visualize your spiritual network.

![Ekklesia Mapper](https://img.shields.io/badge/Vue-3.5.13-42b883?style=flat&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.3.0-ffd04b?style=flat&logo=pinia&logoColor=white)

## Features

- **Visual Church Tree**: Interactive hierarchical visualization of your church structure
- **Pan & Zoom**: Navigate large church structures with intuitive zoom controls
- **Key Metrics Tracking**: Monitor five essential metrics across all churches:
  - Members: Total number of people
  - Baptized: Number of baptized believers
  - Calling: Connection with God
  - Community: Connection with family
  - Commission: Serving others
  - Reaching: Reaching others
- **Real-time Statistics**: Live updates of totals and percentages across the entire network
- **Persistent Storage**: All data saved locally in your browser
- **Responsive Design**: Beautiful gradient UI with hover effects and smooth transitions

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

- **Zoom In**: Click the + button or use the scroll wheel
- **Zoom Out**: Click the - button
- **Reset View**: Click the Reset button to return to default view
- **Pan**: Click and drag on the canvas to move around

## Project Structure

```
ekklesia-mapper/
├── src/
│   ├── components/
│   │   ├── TreeNode.vue      # Individual church card in the tree
│   │   ├── ChurchForm.vue    # Modal for adding/editing churches
│   │   └── StatsPanel.vue    # Floating statistics panel
│   ├── composables/
│   │   └── usePanZoom.js     # Pan and zoom functionality
│   ├── stores/
│   │   └── churches.js       # Pinia store for church data management
│   ├── App.vue               # Main application component
│   └── main.js               # Application entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Data Model

Each church object contains:

```javascript
{
  id: string,           // Unique identifier
  name: string,         // Church name
  parentId: string | null,  // Parent church ID (null for Mother Church)
  metrics: {
    members: number,    // Total members
    baptized: number,   // Baptized members
    calling: number,    // Members with calling
    community: number,  // Connected with family
    commission: number, // Serving others
    reaching: number    // Reaching others
  }
}
```

## Metrics Explained

The Five Circles of Ekklesia:

1. **Calling (Connectie met God)**: Vertical relationship with God
2. **Community (Connectie met familie)**: Horizontal relationships within the church
3. **Commission (Dienen van anderen)**: Outward service to those in need
4. **Baptized (Gedoopt)**: Water baptism as public declaration of faith
5. **Reaching (Bereiken van anderen)**: Evangelism and outreach to new people

## Data Storage

All church data is stored in your browser's LocalStorage under the key `ekklesia-churches`. This means:

- ✅ Data persists across browser sessions
- ✅ No server required
- ✅ Works offline
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete all churches

### Export/Import Data

You can manually backup your data:

**Export** (run in browser console):
```javascript
const data = localStorage.getItem('ekklesia-churches');
console.log(data);
// Copy the output and save it
```

**Import** (run in browser console):
```javascript
localStorage.setItem('ekklesia-churches', 'your-pasted-data-here');
location.reload();
```

## Technologies Used

- **Vue 3**: Progressive JavaScript framework
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
