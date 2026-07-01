# BeyondCarat - Luxury Jewelry eCommerce Platform

BeyondCarat is a production-ready, ultra-premium luxury jewelry eCommerce platform. Inspired by the designs of Tiffany & Co. and Cartier, this platform features an interactive diamond solitaire builder, custom metal selections, a rich journal, and an enterprise control panel.

---

## Tech Stack

### Frontend
- **Framework**: Next.js (with App Router & React Server Components)
- **Styling**: Tailwind CSS & shadcn/ui
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form & Zod
- **Icons**: Lucide React

### Backend
- **Core Server**: Node.js + Express.js
- **Database Engine**: MySQL
- **Database ORM**: Prisma Client
- **Authentication**: JWT & HTTP-Only Secure Cookies
- **Image Storage**: Cloudinary Integration
- **Validations Layer**: Zod middleware

---

## Project Structure

```bash
luxury-jewelry-platform/
├── backend/                  # Node.js Express server
│   ├── prisma/               # Prisma Database Schemas and Seed script
│   └── src/
│       ├── config/           # Database configurations
│       ├── controllers/      # Route handler controllers
│       ├── middlewares/      # Auth, roles and validations middlewares
│       ├── models/           # Zod payload request schemas
│       ├── routes/           # Routing directories
│       ├── services/         # Core business database services
│       └── utils/            # Shared utilities (slugify, ApiResponse, cache)
├── frontend/                 # Vite-based React SPA frontend
│   └── src/
│       ├── app/              # Routes pages (shop, blog, admin, dashboard, etc.)
│       ├── components/       # Layout components (Header, Footer, clients)
│       └── context/          # React contexts (AuthContext)
└── README.md                 # Detailed documentation guides
```

---

## Installation & Local Development

### Prerequisites
- Node.js (version 20 or higher)
- MySQL database instance running locally or on a cloud service
- npm workspaces environment

### 1. Environment Configurations
Clone `.env.example` in the backend folder and fill in the values:
```bash
cp backend/.env.example backend/.env
```
Ensure `DATABASE_URL` is set to point to your MySQL database:
```env
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/luxury_jewelry"
```

### 2. Install Project Dependencies
Run from the root directory to install dependencies across the workspaces:
```bash
npm install
```

### 3. Apply Prisma Migrations & Seed Data
Generate the Prisma Client types, push the schema to MySQL, and seed baseline parameters:
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```
*Note: Seeding creates the default Administrator user `admin@luxurybrand.com` with password `Admin@Luxury123`.*

### 4. Run Development Servers
Start both the backend API and Next.js dev server simultaneously:
```bash
cd ..
npm run dev
```
- Backend will mount at `http://localhost:5000`
- Frontend will mount at `http://localhost:3000`

---

## Production Build & Deployment Guide (Without Docker)

To compile and execute the platform on a live production server, follow the guide below.

### 1. Database Configuration
Ensure you have a hosted MySQL instance (e.g. AWS RDS, GCP Cloud SQL, or a standalone VPS instance).
Modify the environment configuration inside `backend/.env`:
```env
DATABASE_URL="mysql://username:password@hostname:3306/database_name"
```

### 2. Apply Database Schema & Seed Data
Before starting the backend, update the database schema and seed the baseline configuration data:
```bash
# Push schema changes to the live database
npm run db:push

# Seed default roles, products and the Administrator user
npm run seed --workspace=backend
```

### 3. Build the Platform
Run the workspace build script from the root directory to generate production bundles for both backend and frontend:
```bash
npm run build
```
- **Backend**: runs `prisma generate` to compile Prisma client models and compiles TypeScript source files to JavaScript in `backend/dist`.
- **Frontend**: builds and bundles static assets to `frontend/dist` using Vite.

### 4. Run in Production

#### A. Running the Backend Server
It is highly recommended to run the backend server using a process manager like **PM2** to ensure auto-restart and zero downtime:
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the backend server
pm2 start backend/dist/server.js --name "luxury-jewelry-backend"
```
Or start directly with node/npm:
```bash
npm run start:backend
```

#### B. Serving the Frontend App
Since the frontend is a static single-page React app, the production output in `frontend/dist` can be:
- Deployed directly to static hosting services like **Vercel** (using the included `vercel.json`), **Netlify**, or **Cloudflare Pages**.
- Served on a VPS using **Nginx** or **Apache**.
- Served via Node using the `serve` library:
  ```bash
  npx serve -s frontend/dist -l 3000
  ```

---

## Primary REST API Endpoint Ledger

- **Auth Services (`/api/v1/auth`)**
  - `POST /signup` - Register a customer profile
  - `POST /login` - Login client and set HTTP cookies
  - `GET /profile` - Retrieve active client data (Protected)
- **Products Catalog (`/api/v1/catalog`)**
  - `GET /products` - List available setting listings
  - `GET /products/:slug` - Details of single solitaire variant
  - `GET /categories` - List categories tree
- **Operational Checkout (`/api/v1/checkout`)**
  - `GET /cart` - Retrieve user shopping cart
  - `POST /orders` - Create order invoice state
  - `GET /admin/analytics` - Financial overview metrics (Admin only)
- **Designer Brands (`/api/v1/brands`)**
  - `GET /` - List designer brands
  - `POST /` - Register designer brand (Admin only)
- **Vault Journals (`/api/v1/blogs`)**
  - `GET /` - List published blog articles
  - `POST /admin` - Write journal article (Admin only)

---

## Production Deployment Checklist

1. **Database Hosting**: Host the MySQL instance on a fully managed service (e.g. AWS RDS or GCP Cloud SQL) and update `DATABASE_URL`.
2. **Security Headers**: Ensure SSL certificate redirects are configured. The express server utilizes `helmet` to manage Content Security Policies (CSP) and headers.
3. **CORS Credentials**: Configure `CLIENT_URL` env on Vercel/EC2 to restrict API access parameters.
4. **Environment Secrets**: Overwrite access token secrets (`JWT_ACCESS_SECRET`) and secure encryption values (`OTP_ENCRYPTION_KEY`) in your server env configs.
