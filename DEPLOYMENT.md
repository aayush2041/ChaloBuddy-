# 🚀 ChaloBuddy Deployment Guide

ChaloBuddy is a high-performance modern Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS.

---

## ⚡ Option 1: Vercel (Recommended & Zero Config)

ChaloBuddy is already configured with `vercel.json` rewrites for SPA routing.

### Steps:
1. Push your code to GitHub: `https://github.com/aayush2041/ChaloBuddy-.git`.
2. Go to **[Vercel Dashboard](https://vercel.com/)** and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your **`ChaloBuddy-`** repository.
5. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (or leave default with root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**.

> Vercel will build the production bundle and provide a live URL with automatic HTTPS and global CDN caching.

---

## 🌐 Option 2: Netlify

1. Sign in to **[Netlify](https://www.netlify.com/)**.
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select your GitHub repository.
4. Set build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Deploy Site.

---

## 💻 Local Production Preview

To test the production build locally:

```bash
# Build the client
npm --prefix client run build

# Preview locally
npm --prefix client run preview
```
