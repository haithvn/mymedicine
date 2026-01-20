# Frontend Architecture - My Medicine

## Overview

Frontend được xây dựng trên **React 18** với **Vite** làm build tool, sử dụng **Tailwind CSS** cho styling.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build tool + Dev server |
| Tailwind CSS | Utility-first CSS |
| Axios | HTTP Client |
| Lucide React | Icon library |
| React Router | Client-side routing |
| TypeScript | Type safety |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│                   (React Router Provider)                    │
├─────────────────────────────────────────────────────────────┤
│                      Layout.tsx                              │
│              (Sidebar + Header + Content Area)               │
├─────────────────────────────────────────────────────────────┤
│   Dashboard   │  Medicines  │  Diseases  │  Prescriptions   │
│     Page      │    Page     │    Page    │      Page        │
├─────────────────────────────────────────────────────────────┤
│                    Components Layer                          │
│   MedicineCard, DiseaseCard, PrescriptionCard, Forms, etc.  │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer (api.ts)                   │
│                  Axios instance → Backend API                │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── MedicineCard.tsx     # Medicine display card
│   │   ├── DiseaseCard.tsx      # Disease display card
│   │   ├── PrescriptionCard.tsx # Prescription display
│   │   ├── AddMedicineForm.tsx  # Form components
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Medicines.tsx        # Medicine cabinet
│   │   ├── Diseases.tsx         # Disease management
│   │   └── Prescriptions.tsx    # Prescription management
│   ├── services/
│   │   └── api.ts               # Axios configuration
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Component Architecture

```
App
├── Layout
│   ├── Sidebar (fixed left)
│   │   └── NavLinks
│   ├── Header (top bar)
│   │   └── LanguageSwitcher
│   └── Content Area (scrollable)
│       └── [Page Components]
```

## State Management

- **Local State**: `useState` for component-level state
- **Data Fetching**: `useEffect` + Axios calls
- **No Redux**: Simple app, local state sufficient

## Styling Approach

```jsx
// Tailwind utility classes
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>
```

## API Integration

```typescript
// services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Usage in components
const fetchMedicines = async () => {
  const response = await api.get('/medicines');
  setMedicines(response.data);
};
```

## Environment Variables

```env
VITE_API_BASE_URL=https://mymedicine-backend.vercel.app/api
```

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Key Features

1. **Responsive Design**: Mobile-first with Tailwind breakpoints
2. **Dark Sidebar**: Skote-inspired admin theme
3. **Real-time Updates**: Immediate UI refresh after CRUD
4. **Multi-language**: i18n support (EN/VI)
5. **Charts**: Recharts for data visualization
