# Ekklesia Mapper

A visual church mapping tool designed to help religious organizations map and measure all groups within their movement. Build hierarchical church structures, track key metrics, and visualize your spiritual network.

![Vue 3](https://img.shields.io/badge/Vue-3.5.13-42b883?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6?style=flat&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.30-C5F74F?style=flat&logo=drizzle&logoColor=black)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.0-blue?style=flat)

## Features

- **Visual Church Tree**: Interactive hierarchical visualization of your church structure
- **Secure Authentication**: User accounts with email/password login (powered by Better Auth)
- **Multi-Tenancy**: Every user has their own isolated database of churches and metrics
- **Smart Zoom**: Automatic zoom adjustment to fit all churches on screen
- **Pan & Zoom**: Navigate large church structures with intuitive zoom controls
- **Dynamic Metrics System**: Customize and track any metrics important to your movement
  - Default metrics included: Members, Baptized, Calling, Community, Commission, Reaching
  - Add custom metrics via Admin Panel
  - Choose from 6 colors and 20+ icons
- **Real-time Statistics**: Live updates of totals and percentages in compact stats panel
- **Responsive Design**: Beautiful gradient UI with hover effects and smooth transitions
- **Admin Panel**: Manage your metrics, reorder them, or reset to defaults

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database (local or cloud)

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

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ekklesia_mapper"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5173"
VITE_API_URL="http://localhost:5173"
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:5173
```

## Architecture

This project uses a modern full-stack architecture:

- **Frontend**: Vue 3 (SPA) + Pinia + Tailwind CSS
- **Backend**: Express.js server (serves both API and Frontend in dev/prod)
- **Database**: PostgreSQL (Neon/Vercel compatible)
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: Better Auth (Secure, session-based)

### Directory Structure

```
ekklesia-mapper/
├── src/
│   ├── components/      # UI Components (Tree, Forms, Modals)
│   ├── composables/     # Vue Composables (useAuth, usePanZoom)
│   ├── lib/
│   │   ├── auth-client.ts  # Client-side Auth (Browser safe)
│   │   ├── auth.ts         # Server-side Auth (Backend only)
│   │   ├── db.ts           # Drizzle DB setup
│   │   ├── schema.ts       # Database Schema definitions
│   │   ├── api.ts          # Type-safe API Client
│   │   └── validation/     # Zod schemas for shared validation
│   ├── routes/          # Express API Routes (churches, metrics, etc.)
│   ├── stores/          # Pinia Global State
│   └── types/           # TypeScript Definitions
├── drizzle/             # Database Migrations
├── server.ts            # Main Express Server Entry Point
└── vite.config.ts       # Vite Configuration
```

## Usage

### Authentication
- Register a new account to start
- Your data is private and secure
- Log out via the profile menu

### Managing Churches
- **Add**: Click "Child" on any church card
- **Edit**: Click the pencil icon
- **Delete**: Click the trash icon (cascades to all children)

### Managing Metrics
- Click the **Settings icon** (gear) to open the Admin Panel
- Add, edit, reorder, or delete custom metrics
- Metrics are unique to your account

## Data Model

The application uses a relational database model:

- **Users**: Account information
- **Churches**: Hierarchical data (Adjacency List pattern via `parentId`)
- **UserMetrics**: Custom metric definitions per user
- **Settings**: User preferences (theme, UI settings)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for church communities worldwide**