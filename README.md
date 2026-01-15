# My Medicine - Medicine Management Application

A full-stack medicine management application built with Next.js, React, and PostgreSQL.

## Features

- 💊 **Medicine Cabinet**: Manage your medicines with full CRUD operations
- 🏥 **Diseases**: Track and manage diseases/conditions
- 📋 **Prescriptions**: Create and manage prescriptions with multiple medicines
- ✏️ **Edit & Delete**: Full edit and delete functionality for all entities
- 🔄 **Real-time Updates**: Immediate UI updates after any operation

## 🚀 Live Demo

- **Frontend**: [https://mymedicine-frontend.vercel.app](https://mymedicine-frontend.vercel.app)
- **Backend API**: [https://mymedicine-backend.vercel.app](https://mymedicine-backend.vercel.app)

## Tech Stack

### Backend
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful API with route handlers
- **Validation**: Zod schema validation

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
mymedicine/
├── backend/          # Next.js backend application
│   ├── src/
│   │   ├── app/
│   │   │   └── api/  # API routes
│   │   ├── drizzle/  # Database schema & migrations
│   │   └── lib/      # Database connection
│   └── package.json
│
└── frontend/         # React frontend application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   └── services/    # API service layer
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haithvn/mymedicine.git
   cd mymedicine
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env.local file with your database URL
   echo "DATABASE_URL=postgresql://user:password@localhost:5432/mymedicine" > .env.local
   
   # Run migrations
   npm run db:push
   
   # Start backend server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start frontend dev server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## API Endpoints

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create new medicine
- `PATCH /api/medicines/[id]` - Update medicine
- `DELETE /api/medicines/[id]` - Delete medicine

### Diseases
- `GET /api/diseases` - Get all diseases
- `POST /api/diseases` - Create new disease
- `PATCH /api/diseases/[id]` - Update disease
- `DELETE /api/diseases/[id]` - Delete disease

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create new prescription
- `PATCH /api/prescriptions/[id]` - Update prescription
- `DELETE /api/prescriptions/[id]` - Delete prescription

## Database Schema

- **users**: User information
- **medicines**: Medicine details (name, manufacturer, quantity, etc.)
- **diseases**: Disease/condition information
- **prescriptions**: Prescription details (frequency, scheduled times)
- **prescription_medicines**: Junction table linking prescriptions to medicines

## Features in Detail

### Cascade Delete
The application implements proper cascade delete to maintain data integrity:
- Deleting a medicine removes all its references in prescriptions
- Deleting a disease removes all related prescriptions and their medicines
- Deleting a prescription removes all its medicine associations

### Data Validation
- Zod schema validation on backend
- Form validation on frontend
- Proper error handling and user feedback

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start dev server
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment to Vercel

The application is deployed as two separate projects on Vercel:

### 1. Backend (Next.js)
- **Root Directory**: `backend/`
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to Neon PostgreSQL
- **Build Command**: `npm run build`

### 2. Frontend (Vite)
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: URL of the deployed backend API (e.g., `https://mymedicine-backend.vercel.app/api`)

To deploy manually via CLI:
```bash
# Backend
cd backend
vercel --prod

# Frontend
cd frontend
vercel --prod
```

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Author

haithvn
