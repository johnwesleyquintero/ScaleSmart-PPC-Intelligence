# ScaleSmart PPC Intelligence & ETL Suite 🚀

ScaleSmart is a professional-grade Amazon PPC Optimization and ETL Intelligence engine designed to process fragmented retail advertising data warehouses, normalize performance indicators, and dispatch highly actionable campaign strategies with single-click ease.

---

## Key Features ⚡

1. **Executive Performance Cockpit**:
   - Compiles complex core retail KPIs (ACOS, TACOS, Organic vs. Sponsored split, Page session conversion ratios).
   - Generates high-fidelity interactive Recharts visualizations illustrating indexing and direct performance slopes.

2. **Continuous ETL Data Warehousing**:
   - Ingests multi-format reports representing campaigns, high-bleed customer search queries, product session tables, Helium 10 index keywords, and competitor indices.
   - Cleanses records and executes mathematical normalization on-the-fly.

3. **Google Sheets Sync Engine (Direct Drive Sync)**:
   - Authenticates directly with professional Google Accounts using **Firebase & Google OAuth 2.0**.
   - **Template Dispenser**: Deploys structured, pre-headers formatted spreadsheets straight onto the connected Google Drive.
   - **Ingestion Pipeline**: Scans, normalizes, and downloads live user updates from Google Sheets in milliseconds.

4. **Search Term Dispatcher**:
   - Analyzes raw search volume ratios and ACOS profiles.
   - Boosts productive indexing by promoting high-performing customer queries to **EXACT** campaigns, while preserving budget by negating bleeders.

5. **Gemini AI Audit Integration**:
   - Triggers server-authoritative, highly secure forensic reviews by parsing campaigns against organic indexes and pricing trends.

---

## Directory & Architecture Map 🗺️

```text
/
├── src/
│   ├── lib/
│   │   ├── firebaseAuth.ts          # Unified active Firebase/Google oauth logic
│   │   └── googleSheets.ts          # Structured sheets cell mapping & API requests
│   ├── components/
│   │   ├── GoogleSheetsPanel.tsx    # Google Sheets 3-stage Sync workspace
│   │   ├── ExecutiveDashboard.tsx   # Core analytical visualizer (d3/recharts)
│   │   ├── EtlConsole.tsx           # Database status & manual source override
│   │   └── CampaignOptimizer.tsx    # Tactical audits and bidding controls
│   ├── App.tsx                      # Component manager & shared session state
│   ├── main.tsx                     # Vite root entrypoint
│   └── types.ts                     # Strict schema representation
├── server.ts                        # Compliant Express Server proxy (Vite & Gemini API)
└── metadata.json                    # Platform permissions & scopes
```

---

## Setup & Local Development ⚙️

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Configuration (`.env`)
Create a `.env` file in the root based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
Run the package installation:
```bash
npm install
```

### 4. Running the Dev Server
Launch both the Express backend and Vite frontend via the joint development scripts:
```bash
npm run dev
```
The server will boot locally on **http://localhost:3000**.

---

## Google Sheets Normalization Standard 📊

The Sync Ingestion engine enforces a strict format consisting of **5 designated tabs** containing correct columns to parse datasets correctly:

### Tab 1: `RAW_CAMPAIGNS`
*Column order*:  
`Date` | `Campaign ID` | `Campaign Name` | `Impressions` | `Clicks` | `Spend ($)` | `Orders` | `Sales ($)`

### Tab 2: `RAW_SEARCH_TERMS`
*Column order*:  
`Date` | `ASIN` | `SKU` | `Target Keyword` | `Customer Search Term` | `Clicks` | `Spend ($)` | `Orders` | `Sales ($)`

### Tab 3: `RAW_BUSINESS`
*Column order*:  
`Date` | `ASIN` | `SKU` | `Sessions` | `Page Views` | `Units Ordered` | `Revenue ($)`

### Tab 4: `RAW_KEYWORDS`
*Column order*:  
`Date` | `ASIN` | `Keyword` | `Est. Search Volume` | `Organic Rank` | `Sponsored Rank`

### Tab 5: `RAW_COMPETITORS`
*Column order*:  
`Date` | `Competitor ASIN` | `Listed Price ($)` | `Total Reviews` | `Stars/Rating` | `Estimated Monthly Revenue ($)` | `Listing Quality Score`

> 💡 **Tip**: Navigate to **"Google Sheets Sync"** -> Click **"Deploy Fresh Sheet Template"** to have the engine automatically output a fully-formatted empty workbook so you can plug in raw data easily!

---

## Authentication & Security Protocols 🔒

ScaleSmart relies on secure **Firebase Auth via popup Google integration**. 
- Your personal and Google Drive files are completely safe; ScaleSmart only gains permissions to view and edit spreadsheets **specifically created by the application** or **explicitly requested** during import.
- Server-side API layers are proxy-shielded, ensuring Gemini API keys and private authentication secrets are never exposed on client browsers.

---

## Firebase Authorized Domains Configuration 🌐

When deploying this application to production or accessing it from custom hosts, you **must authorize your deployment domain** in Firebase to allow Google OAuth and Firebase Authentication popup operations.

### Setup Steps:

1. **Access Firebase Console**:
   Navigate to the [Firebase Console](https://console.firebase.google.com/) and select your active project.

2. **Navigate to Authentication Settings**:
   - In the left sidebar navigation, expand **Build** and choose **Authentication**.
   - Click on the **Settings** tab located near the top of the interface.

3. **Locate Authorized Domains**:
   - In the settings side menu, select **Authorized domains**.

4. **Add Your Domain**:
   - Click the **Add domain** button.
   - Enter your specific deployment host exactly: `scale-smart-ppc.vercel.app` (or your specific deployment domain).
   - Click **Add**.

> 💡 *Note: While local development hosts (like `localhost` or local IPs) are typically pre-authorized, any staging, production, or serverless deployment domain requires explicit authorization in the Firebase Console to avoid authentication origin errors (e.g., `auth/unauthorized-domain`).*
