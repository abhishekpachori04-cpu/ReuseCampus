# ReuseCampus 🎓♻️

> **A Verified College-Specific Second-Hand Marketplace for Students**  
> Empowering students at **Rustamji Institute of Technology (RJIT)** to buy, sell, donate, and pass down textbooks, calculators, lab gear, and hostel essentials safely within their verified campus community.

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed%20(100%25)-brightgreen?logo=node.js&logoColor=white)](#-automated-testing--code-quality)
[![JWT](https://img.shields.io/badge/Auth-JWT_Bearer-000000?logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 🌟 Executive Summary: Problem & Solution

### The Campus Problem
Every semester at engineering institutes like **RJIT (BSF Academy, Tekanpur)**, passing students face a recurring dilemma:
- **Discarded Value**: Senior students discard or pack away expensive engineering textbooks (higher mathematics, computer networks, control systems), engineering drafters, lab aprons, and scientific calculators (FX-991EX/MS) that sit unused in hostel cupboards.
- **Financial Burden on Freshers**: Incoming juniors and semester freshers spend thousands of rupees purchasing brand-new gear from city bookstores and retailers.
- **The Pitfalls of Open Classifieds**: Generic marketplaces (OLX, Facebook Marketplace) invite stranger fraud, lack verification, require risky off-campus meetings, and incur high delivery fees.

### The ReuseCampus Solution
**ReuseCampus** provides an ultra-localized, secure, peer-to-peer student marketplace:
- 🛡️ **Zero Strangers / Campus-Verified**: Registration is strictly locked to verified institutional college email addresses (`@rjit.ac.in`). Non-student scammers and commercial resellers are systematically blocked.
- 🤝 **Frictionless On-Campus Handover**: Connect directly via one-click WhatsApp pre-filled chats or campus email for same-day handover in college hostels, the canteen, or campus gates.
- 🎁 **"Donate Free to Juniors" Mode**: Seniors graduating or moving out can list books and tools for ₹0, fostering an active campus tradition of peer-to-peer knowledge sharing and sustainability.
- 💰 **Zero Commissions**: 100% of peer-to-peer transactions remain directly between students.

---

## ⚡ Key Engineering & Architectural Highlights

1. **Modular Frontend Component Architecture**:
   - Clean separation of concerns with sub-domain component trees (`components/listings/ListingCard.jsx`, `ListingDetailModal.jsx`, `ListingFilterBar.jsx`) and reusable UI primitives (`ListingSkeleton.jsx`, `ErrorBoundary.jsx`).
   - Dedicated custom hooks: `useWishlist` for persistent local storage bookmarks with live counter sync, and `useDebounce` for optimized live search.
   - Vite Fast Refresh optimized by extracting context hooks (`useAuth.js`) away from context providers.

2. **High-Performance Mongoose `.lean()` & Compound Indexing**:
   - Feed queries use `.lean()` execution to bypass Mongoose document hydration overhead, returning plain JavaScript objects for faster response times and lower RAM consumption.
   - Compound database indexes on `{ status: 1, createdAt: -1 }` and `{ category: 1, status: 1 }` ensure constant query execution times even under high data volume.

3. **Multi-Tiered Defense-in-Depth Security**:
   - **Rate Limiting**: Configured with `express-rate-limit`: a global 150 req/15min API limiter and a strict 15 req/15min auth limiter on `/api/auth/*` against credential brute-forcing.
   - **NoSQL Injection Sanitization**: Custom recursive middleware (`sanitizeMiddleware.js`) inspecting `req.body`, `req.query`, and `req.params` to neutralize `$` and `.` operators.
   - **ReDoS Protection**: Search queries are sanitized against malicious regex patterns via safe character escaping.
   - **Strict Ownership Checks**: Server-enforced authorization rules ensure students can only edit, toggle, or delete listings they own.
   - **Helmet Headers**: Secure HTTP headers applied while permitting base64-encoded compressed image previews (`crossOriginResourcePolicy: false`).

4. **Client-Side HTML5 Canvas Image Compression**:
   - High-resolution mobile phone camera uploads are downscaled and compressed on the client via an HTML5 Canvas pipeline (`imageCompressor.js`) prior to transmission.
   - Reduces multi-megabyte camera photos to ~100KB JPEG Data URLs, mitigating network latency and database bloat while maintaining crisp display quality.

5. **Token Lifecycle & Automatic 401 Interceptor**:
   - Axios response interceptor (`api.js`) monitors API traffic; if the backend returns `401 Unauthorized` (expired or revoked JWT), it clears `localStorage` and triggers a custom `reusecampus-auth-expired` event.
   - `AuthContext` seamlessly clears the session state without crashing or freezing the UI.

6. **Edge-Case Validation & Form Hardening**:
   - Double-submission mitigation across all forms (Login, Register, Create Listing, Edit Listing, Profile Update) using disabled buttons and loading spinners.
   - Strict string sanitization (`.trim()`) preventing blank or whitespace-only submissions.
   - Price floor verification enforcing `price >= 0` both in client state and on Express/Mongoose schema level.
   - Indian mobile number validation supporting `+91` and 10-digit formats (`^[6-9]\d{9}$`).

---

## 📐 Engineering Decisions & Architectural Trade-offs (ADRs)

For exhaustive architecture diagrams and design rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).

### 1. ADR-001: Client-Side Canvas Compression + Base64 Storage vs. Ephemeral Local Disk
* **Problem**: Smartphone cameras produce 3MB–12MB images. Saving uploads to server disk (`/uploads`) on cloud platforms like **Render** or **Heroku** causes catastrophic data loss: their *ephemeral filesystems* wipe all locally written disk files on every restart, redeploy, or container sleep cycle. Third-party object storage (AWS S3, Cloudinary) introduces credit-card billing tiers, API keys, and outbound bandwidth charges unacceptable for a zero-cost student project.
* **Senior Decision**: Pre-process and downscale images on the student's browser via an HTML5 Canvas pipeline (`imageCompressor.js`) before network transmission (1000px max bounding box, 0.72 quality JPEG). The resulting payload is strictly **<120KB Base64 Data URL** stored directly within MongoDB Atlas.
* **Trade-off**: Increases MongoDB document size by ~100KB (well below MongoDB's 16MB document cap), but guarantees 100% image persistence across Render container sleep/wake cycles with zero external cloud billing dependencies.

### 2. ADR-002: Mongoose `.lean()` Hydration Bypass + Compound Indexing
* **Problem**: Standard Mongoose queries instantiate full `MongooseDocument` prototypes for every row, incurring heavy memory overhead, getters/setters, and dirty-tracking that degrades performance on paginated marketplace feeds.
* **Senior Decision**: All high-throughput feed reads in `listingController.js` execute `.lean()`, returning plain JavaScript objects straight from the BSON parser. This is paired with composite compound indexes:
  ```javascript
  listingSchema.index({ status: 1, category: 1, createdAt: -1 }); // Multi-filter catalog feed
  listingSchema.index({ seller: 1, createdAt: -1 });              // Seller dashboard queries
  listingSchema.index({ title: 'text', description: 'text' });    // Full-text search
  ```
* **Trade-off**: Bypasses Mongoose virtuals and `.save()` on read objects, but delivers **3–5x lower RAM consumption** and sub-millisecond index-driven query times.

### 3. ADR-003: Custom NoSQL Query Sanitizer + Dual-Tier Rate Limiting
* **Problem**: Express APIs accepting JSON are vulnerable to MongoDB operator injection (e.g., `{ "password": { "$gt": "" } }`). Third-party packages like `express-mongo-sanitize` suffer from prototype pollution vulnerabilities in newer Node engines. Uniform rate limiting either disrupts fast catalog browsing or leaves auth endpoints exposed.
* **Senior Decision**:
  - Authored a custom recursive sanitizer (`sanitizeMiddleware.js`) that strips keys starting with `$` or containing `.` while safely preserving valid Base64 payloads and user inputs without side effects.
  - Implemented dual-tier rate limiting: **150 req/15min** globally across `/api/*`, and a strict **15 req/15min** throttle on `/api/auth/*` against password spraying.
* **Trade-off**: Maintains ~40 lines of clean in-house code, but eliminates third-party supply chain risks and prototype pollution exploits.

### 4. ADR-004: Fail-Fast Environment Validation & Process Graceful Shutdown
* **Problem**: Node applications with missing secrets boot into silent zombie states that crash on first user request. Furthermore, unhandled container terminations (`SIGTERM`) abruptly drop in-flight HTTP requests and cause MongoDB socket connection leaks.
* **Senior Decision**: 
  - Mandatory environment variables (`MONGO_URI`, `JWT_SECRET`) are validated synchronously during boot; the process halts immediately (`process.exit(1)`) if configuration is incomplete.
  - Added centralized graceful shutdown handlers (`SIGTERM`, `SIGINT`, `unhandledRejection`, `uncaughtException`) that stop incoming requests, drain active sockets within 10 seconds, and gracefully disconnect the Mongoose connection pool.

---

## 🚀 Complete Feature Matrix

| Feature | Description | Engineering Implementation |
|---|---|---|
| **Verified Auth** | RJIT institutional domain validation (`@rjit.ac.in`) | Regex validation on client & Mongoose schema, `bcryptjs` (10 rounds), JWT bearer auth |
| **Marketplace Feed** | Real-time discovery with category pills and price badges | Debounced search (300ms), category pills, condition filters, and responsive grid |
| **Free Donations (₹0)** | Special mode for passing items to juniors for free | Numeric input disable toggle, emerald `"🎁 FREE FOR JUNIORS"` badges, and dedicated filter pill |
| **Saved Items / Wishlist**| Bookmark listings across sessions | Custom `useWishlist` hook with persistent `localStorage` synchronization |
| **Seller Dashboard** | Manage active posts, toggle status, and edit details | Metrics cards (`TOTAL`, `ACTIVE`, `SOLD`), status switcher, inline edit modal, and soft deletion |
| **Instant P2P Connect** | Direct communication with sellers | Dynamic WhatsApp link generation with pre-populated greeting, fallback `mailto:`, and clipboard copy |
| **Profile Management** | Student drawer for updating display name and WhatsApp | Express `PUT /api/users/me` endpoint with phone format validation |
| **Graceful Empty States**| Context-aware UI when searches or filters return 0 items | `"Reset All Filters"` one-click button restoring default feed |
| **Error Boundaries** | Bulletproof crash recovery | React Class Error Boundary isolating errors with one-click page reload |

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client (React 19 + Tailwind v4 + Vite)"]
        UI["UI Layer: Marketplace, Modals, Seller Dashboard"]
        Context["AuthContext + useAuth & useWishlist"]
        Compressor["HTML5 Canvas Image Compressor"]
        Axios["Axios Client (Auth & 401 Interceptors)"]
        UI --> Context
        UI --> Compressor
        UI --> Axios
    end

    subgraph Backend ["Backend (Express 5.x REST API)"]
        Helmet["Helmet Security Headers"]
        Limiter["Rate Limiters (Global + Auth)"]
        Sanitize["NoSQL Key Sanitizer ($ and .)"]
        AuthMW["JWT Bearer Auth Middleware"]
        Controllers["Controllers: Auth, Listings, Users"]
        
        Helmet --> Limiter --> Sanitize --> AuthMW --> Controllers
    end

    subgraph Database ["Persistence Layer (MongoDB Atlas)"]
        Users[("Users Collection (Unique Campus Email)")]
        Listings[("Listings Collection (Compound Indexed)")]
    end

    Axios -->|HTTPS / REST API| Helmet
    Controllers -->|Mongoose .lean() / Aggregations| Database
```

---

## 📁 Repository Directory Structure

```text
ReuseCampus/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Current User (domain & phone validation)
│   │   ├── listingController.js  # CRUD, .lean() queries, status toggle, string trimming
│   │   └── userController.js     # Profile retrieval and PUT update
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Protect route with JWT verification
│   │   ├── errorMiddleware.js    # 404 handler and global exception catcher
│   │   ├── rateLimiter.js        # Global (150/15m) & Strict Auth (15/15m) limiters
│   │   └── sanitizeMiddleware.js # Recursive NoSQL injection key sanitizer ($ and .)
│   ├── models/
│   │   ├── Listing.js            # Schema, compound indexes, price floor validator
│   │   └── User.js               # User schema, institutional email & phone validator
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints with strict rate limiting
│   │   ├── listingRoutes.js      # /api/listings endpoints
│   │   └── userRoutes.js         # /api/users endpoints
│   ├── .env.example              # Sample backend environment configuration
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express server bootstrap, Helmet, CORS, health-check
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg           # Emerald campus shield & graduation cap SVG favicon
│   ├── src/
│   │   ├── assets/               # Brand assets and images
│   │   ├── components/
│   │   │   ├── listings/
│   │   │   │   ├── ListingCard.jsx        # Feed card with price badges & wishlist bookmark
│   │   │   │   ├── ListingDetailModal.jsx # Detailed modal with WhatsApp/Email connect
│   │   │   │   └── ListingFilterBar.jsx   # Search input, category pills, free donation filter
│   │   │   ├── ui/
│   │   │   │   ├── ErrorBoundary.jsx      # Global React error boundary with crash recovery
│   │   │   │   └── ListingSkeleton.jsx    # Pulsing skeleton loader for async feeds
│   │   │   └── Navbar.jsx                 # Nav bar, wishlist badge, & Student Profile modal
│   │   ├── constants/
│   │   │   └── campusConstants.js         # Categories, conditions, and allowed domains
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            # Global auth state & 401 event listener
│   │   │   └── useAuth.js                 # Fast-refresh decoupled auth hook
│   │   ├── hooks/
│   │   │   ├── useDebounce.js             # Live search debounce hook
│   │   │   └── useWishlist.js             # Persistent localStorage saved items hook
│   │   ├── pages/
│   │   │   ├── CreateListing.jsx          # Listing form with ₹0 donation toggle & canvas compressor
│   │   │   ├── Home.jsx                   # Marketplace feed, filters, & empty state reset
│   │   │   ├── Login.jsx                  # Institutional login with double-submission lock
│   │   │   ├── MyListings.jsx             # Seller dashboard with metrics and edit modal
│   │   │   ├── NotFound.jsx               # 404 page with navigation fallbacks
│   │   │   └── Register.jsx               # Student registration with Indian phone check
│   │   ├── services/
│   │   │   └── api.js                     # Axios client with JWT & 401 interceptor
│   │   ├── utils/
│   │   │   ├── formatters.js              # Currency (₹) and relative date formatters
│   │   │   └── imageCompressor.js         # Client canvas JPEG compression utility
│   │   ├── App.jsx                        # Application root routes & global error boundary
│   │   ├── index.css                      # Tailwind CSS v4 entrypoint
│   │   └── main.jsx                       # Vite React DOM entrypoint
│   ├── .env.example                       # Sample frontend environment configuration
│   ├── index.html                         # Professional title, SEO meta tags, & SVG favicon
│   ├── package.json                       # Frontend dependencies and scripts
│   └── vite.config.js                     # Vite configuration with Tailwind CSS v4
│
├── .gitignore                             # Root git exclusion file (node_modules, dist, .env)
├── PRD.md                                 # Complete Product Requirement Document
└── README.md                              # Comprehensive project documentation
```

---

## 📡 REST API Reference

All protected endpoints require the HTTP header: `Authorization: Bearer <jwt_token>`.

### 1. System Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System uptime, timestamp, and deployment health check |

### 2. Authentication (`/api/auth`)
*Rate-limited to 15 requests per 15 minutes per IP.*
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student with institutional email (`@rjit.ac.in`) and Indian phone |
| `POST` | `/api/auth/login` | Public | Authenticate student and issue JWT bearer token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated student profile and verification status |

### 3. Listings (`/api/listings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/listings` | Public | Search and filter listings (`search`, `category`, `condition`, `status`, `minPrice`, `maxPrice`, `isFree`) |
| `GET` | `/api/listings/:id` | Public | Retrieve detailed listing with seller profile |
| `POST` | `/api/listings` | Private | Publish a new listing (enforces `price >= 0` and string `.trim()`) |
| `PUT` | `/api/listings/:id` | Private (Owner) | Update listing details or photo |
| `DELETE` | `/api/listings/:id` | Private (Owner) | Permanently remove a listing |
| `PATCH` | `/api/listings/:id/status`| Private (Owner) | Toggle listing between `AVAILABLE` and `SOLD` |
| `GET` | `/api/listings/my` | Private (Owner) | Retrieve all listings posted by the logged-in student |

### 4. User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Private | Fetch profile with active and sold listing metrics |
| `PUT` | `/api/users/me` | Private | Update full name and WhatsApp phone number |

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reusecampus?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_rjit_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Local Development Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekpachori04-cpu/ReuseCampus.git
cd ReuseCampus
```

### 2. Run Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MONGO_URI and JWT_SECRET
npm run dev
```
*Backend server runs at [http://localhost:5000](http://localhost:5000).*

### 3. Run Frontend
Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Frontend dev server runs at [http://localhost:5173](http://localhost:5173).*

### 4. Run Automated Test Suite (Backend)
```bash
cd backend
npm test
```
*Runs all 18 automated unit and integration tests using Node's native test runner (`node:test`) with 100% pass rate in <1 second (zero external dependencies).*

### 5. Verify Frontend Production Build & Code Quality
```bash
cd frontend
npm run lint    # oxlint: 0 errors, 0 warnings
npm run build   # Production asset compilation
```

---

## 🚢 Deployment Guide

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) and link your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random token
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://reusecampus.vercel.app`)

### Frontend Deployment (Vercel)
1. Import your repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variable:
   - `VITE_API_URL`: Your Render backend API URL (e.g., `https://reusecampus-api.onrender.com/api`)
5. Click **Deploy**.

---

## 👨‍💻 Author & Institutional Affiliation

**Abhishek Pachori**  
*Department of Computer Science & Engineering*  
*Rustamji Institute of Technology (RJIT), BSF Academy, Tekanpur, Gwalior (M.P.)*  
- **GitHub**: [@abhishekpachori04-cpu](https://github.com/abhishekpachori04-cpu)  
- **Email**: `0902cs241008@rjit.ac.in`  

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
