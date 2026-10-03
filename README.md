# ChaloBuddy — Travel Better • Plan Smarter 🌍✈️

[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mobile%20Responsive-orange.svg)](#)
[![Tech Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20TailwindCSS%204%20%7C%20Vite-blue.svg)](#)
[![Deployment](https://img.shields.io/badge/deploy-Vercel%20Ready-black.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)

**ChaloBuddy** is a modern travel community and smart trip-planning platform. It combines realistic, input-driven AI trip planning, handpicked verified homestays and hotels, a vibrant community of solo & group travel buddies, verified host listings, and interactive messaging into one seamless experience.

---

## 🌟 Key Features

### 🧠 Realistic Smart Trip Planner
- **Real-Time Location Autocomplete**: Structured geocoding (`name`, `city`, `state`, `country`, `latitude`, `longitude`) for origins and destinations.
- **Input-Driven Cost Estimation**: Real transit routes, distances, transport options (Flights, Trains, Cabs/Buses), verified stays, dining, and activity costs calculated from traveler counts and dates.
- **Dynamic Day-by-Day Itineraries**: Contextual morning, afternoon, and evening activities with local food recommendations and travel constraints.
- **Live Budget Tuning**: Interactive budget slider with instant per-person and total cost breakdowns in ₹ INR, $ USD, or € EUR.

### 🏡 Handpicked Stays & Boutiques
- Curated boutique stays, hill-view chalets, beach villas, and backpacker hostels across top Indian and international destinations (Manali, Goa, Rishikesh, Jaipur, Kerala, Ladakh, etc.).
- Filter by budget, guest count, location, and amenities.
- High-res photo galleries, video tours, verified host badges, and instant reservation modal.

### 👥 Travel Buddies & Community Trips
- Discover verified travelers and groups heading to the same destinations.
- Filter companions by travel style (Backpacker, Luxury, Trekker, Culture Explorer).
- Host and publish custom trip itineraries or join existing community journeys.

### 💬 Responsive Real-Time Messaging & Chat
- **Mobile Full-Screen Drill-Down**: Clean conversation list that transitions seamlessly into a full-screen chat with back button navigation and docked composer.
- **Desktop Two-Column Panel**: Persistent sidebar with active chat stream, photo attachments, and direct "Trip Details" navigation.
- Safe message bubbles with auto-wrapping and auto-scroll to latest updates.

### 📱 Mobile-First Responsive Design
- Optimized across narrow mobile screens (320px, 360px, 375px, 390px, 414px, 430px) up to ultra-wide displays (1440px+).
- Compact mobile header containing only brand logo, search, notifications, and hamburger menu.
- Full slide-down drawer menu with quick profile access, all navigation links, and currency switcher.
- Fixed bottom navigation bar for quick thumb navigation.
- Zero horizontal overflow across all pages.

### 💱 Multi-Currency Support
- Instant conversion across **₹ INR (Indian Rupee)**, **$ USD (US Dollar)**, and **€ EUR (Euro)**.

---

## 🚀 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visuals & Effects**: Canvas Confetti, QR Code Generator
- **Routing**: Client-side SPA with hash-based deep linking
- **State Management**: React Context API (`StoreContext`)

---

## 📁 Project Structure

```
ChaloBuddy/
├── client/
│   ├── public/              # Static assets & icons
│   ├── src/
│   │   ├── components/      # Modular UI components (Navbar, Modals, Cards, Autocomplete)
│   │   ├── context/         # StoreContext (global state, mock data, users, currency)
│   │   ├── data/            # Seed data, destinations catalogue & planner engine
│   │   ├── pages/           # Page views (Home, Trips, Planner, Stays, Buddies, Messages)
│   │   ├── services/        # Logic services (budgetService, routeService, stayService)
│   │   ├── App.jsx          # Route dispatcher & layout root
│   │   ├── main.jsx         # App bootstrap & ErrorBoundary
│   │   └── style.css        # Tailwind styles & theme variables
│   ├── package.json
│   ├── vercel.json          # Client-level SPA rewrites
│   └── vite.config.js       # Vite build configuration
├── DEPLOYMENT.md            # Production deployment guide
├── vercel.json              # Root-level Vercel configuration
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aayush2041/ChaloBuddy-.git
   cd ChaloBuddy-
   ```

2. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment on Vercel

ChaloBuddy is configured for zero-config SPA deployment on [Vercel](https://vercel.com):

1. Push your changes to GitHub.
2. Import the repository `ChaloBuddy-` on Vercel.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

SPA routing is handled automatically by the included `vercel.json` rewrites.

---

## 🎨 Brand Guidelines & Palette

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Deep Navy** | `#071A2B` | Header, dark surfaces, high-contrast headings |
| **Accent Orange** | `#FF5A1F` | CTAs, active states, brand badges, highlights |
| **Soft Background** | `#F5F7F8` | Global page background |
| **Pure White** | `#FFFFFF` | Cards, modals, containers |

---

## 📄 License

This project is licensed under the MIT License.
