# ✨ AuraPlan AI — GenAI Event Planning Assistant

> A full-stack, GenAI-powered Event Planning Assistant built with **React**, **Node.js/Express**, and the official **Google Gemini API (`@google/genai` SDK)**. Organizes weddings, birthdays, corporate gatherings, and community festivals with four core modules: interactive **Budget Tracker**, vertical **Timeline Generator**, categorized **Vendor Checklist**, and personalized **Idea Generator**.

---

## 🌟 Key Features

### 1. 🎯 Natural Language Event Intake & Presets
- **Single Natural-Language Box**: Enter prompts like *"A romantic rustic garden wedding for 100 guests in Austin with $25,000 budget"* — AuraPlan extracts the event type, location, guest count, style aesthetic, and budget.
- **Quick-Select Presets**: One-click chips for **💍 Wedding**, **🎂 Birthday Party**, and **🎪 Community Festival**.
- **Detailed Parameter Drawer**: Fine-tune date, guest count, location, style aesthetic, and budget limit.

### 2. 📊 Module 1: Interactive Budget Tracker
- **Interactive SVG Donut & Allocation View**: Real-time visualization across six categories: **Venue**, **Catering**, **Decor**, **Photography**, **Attire**, and **Misc**.
- **Real-Time Sliders (Drag-to-Adjust)**: Dynamically adjust dollar allocations and percentages with live recalculation.
- **AI Budget Refiner (`POST /api/refine-budget`)**: Input natural language instructions such as *"Cut catering by 20% and move to decor"* or *"Increase photography to $3,000"*; Gemini (or the local rule engine) recalculates and normalizes allocations so they always strictly equal the total budget.
- **Over/Under-Budget Visual Alert**: Informs you of unallocated buffer or over-budget amounts.

### 3. ⏱️ Module 2: Vertical Milestone Timeline
- **Chronological Roadmap**: Vertical milestones spanning *"Today"* to *"Event Day"* (e.g., 6 Months Out, 3 Months Out, 1 Month Out, 1 Week Out, Event Day).
- **Interactive Task Checklist**: Toggle tasks complete with satisfying strike-through animations and live percentage progress.
- **Priority Badges**: Distinct color-coded badges for **Critical**, **High**, **Medium**, and **Low** urgency.
- **Custom Milestone Creation**: Add custom tasks or filter by priority/status.

### 4. 🤝 Module 3: Categorized Vendor Checklist
- **Essential Categories**: Pre-populated with **Venue**, **Caterer**, **Photographer**, **Florist**, **DJ/Band**, **Officiant**, and **Rentals**.
- **Interactive Status Cycle**: Cycle between `Not Contacted` ⚪, `Reached Out` 🟡, `Booked` 🟢, and `Deposit Paid` 🟣.
- **Financial Commitment Tracking**: Tracks estimated cost vs actual amount paid and tallies committed budget.
- **Editable Notes Field**: Record tasting notes, contract details, and contact emails inline.

### 5. 💡 Module 4: Personalized Idea Generator ("Surprise Me")
- **6 Tailored Concepts**: Generates 6 bespoke creative ideas customized to the event type, budget limit, and style aesthetic.
- **Actionable DIY Tips**: Every idea includes an actionable money-saving DIY tip.
- **One-Click Regeneration (`POST /api/regenerate-ideas`)**: Request 6 completely fresh ideas anytime with Gemini.
- **Save & Copy**: Copy concepts or bookmark them for inspiration.

### 6. 🖨️ Export & Share Suite
- **Print / Save as PDF**: Clean print preview formatted with dedicated `@media print` rules for paginated paper or PDF export.
- **Download CSV**: Generates a clean spreadsheet (`.csv`) for Excel and Google Sheets containing the executive brief, budget breakdown, vendor contacts, and timeline tasks.
- **Download JSON Backup**: Full structured event plan export for offline safekeeping.
- **Copy Brief**: 1-click Markdown copy for pasting into Slack, Notion, WhatsApp, or Google Docs.
- **Shareable Cloud Plan Links**: Unique Plan ID (`?planId=...`) for sharing and revisiting plans.

### 7. 🛡️ 100% On-Device Authentication & Privacy
- **Device-Only Storage**: All user accounts, credentials, and event history are stored exclusively in the browser's `localStorage` (`auraplan_registered_users`, `auraplan_active_user`).
- **No Third-Party Tracking**: Zero telemetry or remote user databases.
- **1-Click Demo & Guest Access**: Try with the preloaded *Sophia Hayes* demo profile or continue as an anonymous Guest Planner.
- **Account Dropdown**: Switch profiles, view account details, or sign out with one click.

---

## 🏗️ Architecture & Gemini Integration

AuraPlan AI is built with an API-first client-server architecture:

```
[ React + Vite Client (Port 5173/5174) ]
   │
   │  REST API Calls (/api/*)
   ▼
[ Node.js + Express API Layer (Port 3001) ]
   │
   ├── Google Gemini API (@google/genai SDK)
   │     ├── Model: gemini-3.5-flash-lite (configurable)
   │     ├── Structured Function Calling Tools:
   │     │     ├── set_budget_allocation
   │     │     ├── create_timeline_tasks
   │     │     └── suggest_vendors
   │     └── 1-Retry Repair Prompt + Resilient Fallback Engine
   │
   ├── In-Memory Plan Store (planStorage.js)
   │     └── Shareable persistent Plan IDs (e.g. plan_abc123)
   │
   └── Local Device Storage (Browser localStorage)
         └── User accounts, sessions, and personal plan history
```

### Backend Gemini Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/generate-plan` | `POST` | Accepts event metadata; returns structured budget allocations, timeline milestones, vendor checklist, and 6 ideas via Gemini. |
| `/api/refine-budget` | `POST` | Accepts current budget allocations + natural language instructions; parses adjustments and normalizes sum to 100%. |
| `/api/regenerate-ideas` | `POST` | Accepts event style, city, and budget; generates 6 fresh creative concepts with DIY tips. |
| `/api/plan` | `POST` | Saves/updates a plan in the server store. |
| `/api/plan/:id` | `GET` | Retrieves a plan by unique ID for shareable links. |

### Function Calling & Structured Outputs
The backend defines Gemini tool declarations in `server/gemini.js`:
- `set_budget_allocation`: Enforces exact category sum constraint ($V + C + D + P + A + M = Total$).
- `create_timeline_tasks`: Enforces task structure with `title`, `phase`, `priority`, and `timelineOffset`.
- `suggest_vendors`: Enforces required vendor categories and cost estimations.

### Resilient Error Handling
If the Gemini API returns malformed JSON or experiences transient 503 high-demand errors:
1. **Attempt 1**: Calls Gemini with `responseMimeType: 'application/json'`.
2. **Attempt 2 (Retry)**: Retries with a stricter repair prompt.
3. **Resilient Fallback**: If retries fail or if running without a key, the intelligent procedural fallback engine (`server/fallbackPlan.js`) instantly returns a valid, mathematically sound event plan tailored to the user's budget and style.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A **Google Gemini API Key** (get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/event-planner.git
cd event-planner
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or update `.env`):

```bash
cp .env.example .env
```

Open `.env` and insert your Gemini API Key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
NODE_ENV=development
```

> **Note**: If `GEMINI_API_KEY` is not provided, the app runs in full offline mode using the intelligent procedural fallback engine.

### 3. Start Development Server
Run the full-stack concurrent development server:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173` (or `http://localhost:5174`)
- **Backend API**: `http://localhost:3001`

### 4. Production Build
To create an optimized production build:

```bash
npm run build
npm start
```

---

## 🧪 Automated Testing

AuraPlan AI includes 10 automated unit and integration tests across 3 suites running natively on Node.js test runner:

```bash
npm test
```

### Test Suites:
1. **Budget Recalculation Engine (`tests/budget.test.js`)**:
   - Preserves total budget when cutting catering by 20% and shifting to decor.
   - Correctly shifts budget when adding fixed dollar amounts.
2. **API Integration Test (`tests/generatePlan.test.js`)**:
   - Tests `POST /api/generate-plan` endpoint, JSON schema validation, and fallback plan generation.
3. **On-Device Authentication Engine (`tests/localAuth.test.js`)**:
   - Registers new user strictly to local device storage.
   - Rejects duplicate email registrations on device.
   - Validates matching password login.
   - Rejects incorrect passwords.
   - 1-click Demo Account login.
   - Guest login and session clearing on logout.
   - Saves and retrieves event plans from device-only history.

---

## 📂 Project Structure

```
event-planner/
├── .env                     # Local environment variables (GEMINI_API_KEY, GEMINI_MODEL)
├── .env.example             # Example environment template
├── package.json             # Project dependencies and npm scripts
├── vite.config.js           # Vite configuration with API proxy
├── server/                  # Backend Express API Layer
│   ├── index.js             # Server entrypoint and static asset serving
│   ├── routes.js            # API router for plan generation, budget, and ideas
│   ├── gemini.js            # Google GenAI SDK integration, prompts, and tools
│   ├── fallbackPlan.js      # Procedural fallback plan generator
│   └── planStorage.js       # In-memory storage for shareable plan IDs
├── src/                     # React Frontend
│   ├── main.jsx             # React DOM root
│   ├── App.jsx              # Main application shell and state controller
│   ├── index.css            # Ultra-premium dark theme styling & print media rules
│   ├── components/          # Dashboard & Feature Modules
│   │   ├── Navbar.jsx           # Sticky glassmorphic navbar with user profile dropdown
│   │   ├── HeroSearch.jsx       # Natural language intake card with quick preset chips
│   │   ├── PlanningDashboard.jsx# 4-tab dashboard container
│   │   ├── BudgetModule.jsx     # Interactive SVG donut, sliders, and AI refiner
│   │   ├── TimelineModule.jsx   # Milestone roadmap, priority badges, and checklist
│   │   ├── VendorsModule.jsx    # Vendor directory, cost tracking, and status pills
│   │   ├── IdeasModule.jsx      # 6 "Surprise Me" inspiration cards with DIY tips
│   │   ├── ExportModal.jsx      # Print/PDF preview, CSV download, JSON backup, copy
│   │   ├── ShareModal.jsx       # Shareable plan link generator
│   │   └── LoginPage.jsx        # On-device authentication (Sign In & Sign Up)
│   └── utils/
│       └── localAuth.js         # Device-only localStorage auth manager
└── tests/                   # Automated Test Suite
    ├── budget.test.js       # Budget math & normalization unit tests
    ├── generatePlan.test.js # Backend plan generation integration tests
    └── localAuth.test.js    # On-device auth & plan history unit tests
```

---

## 📄 License & Credits

- Built with **Google Gemini API** (`@google/genai` SDK) & **Google Antigravity**.
- Icons provided by **Lucide React**.
- Confetti celebration effects powered by **canvas-confetti**.
- MIT License © 2026 AuraPlan AI.
