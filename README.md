# ✨ AuraPlan AI — GenAI Event Planning Assistant

> A full-stack, GenAI-powered Event Planning Assistant built with **React**, **Node.js/Express**, and the official **Google Gemini API (@google/genai SDK)**. Organizes weddings, birthdays, corporate galas, and community festivals with four core modules: interactive **Budget Tracker**, vertical **Timeline Generator**, categorized **Vendor Checklist**, and personalized **Idea Generator**.

---

## 🌟 Key Features

### 1. 🎯 Natural Language Event Intake & Presets
- **Single Natural-Language Box**: Prompt like *"A romantic rustic garden wedding for 100 guests in Austin with $25,000 budget"* is automatically parsed into event type, location, guest count, style preference, and budget.
- **Quick-Select Presets**: One-click chips for **💍 Wedding**, **🎂 Birthday Party**, and **🎪 Community Event**.
- **Detailed Parameter Drawer**: Fine-tune date, guest count, location, style aesthetic, and budget limit.

### 2. 📊 Module 1: Interactive Budget Tracker
- **Interactive SVG Donut & Allocation View**: Real-time visualization across six categories: **Venue**, **Catering**, **Decor**, **Photography**, **Attire**, and **Misc**.
- **Real-Time Sliders (Drag-to-Adjust)**: Dynamically adjust dollar allocations and percentages with live recalculation.
- **AI Budget Refiner (`POST /api/refine-budget`)**: Input natural language instructions such as *"Cut catering by 20% and move to decor"* or *"Increase photography to $3,000"*; Gemini or the local rule engine recalculates and normalizes allocations so they always strictly equal the total budget.
- **Over/Under-Budget Visual Alert**: Informs you of unallocated buffer or over-budget amounts.

### 3. ⏱️ Module 2: Vertical Milestone Timeline
- **Chronological Roadmap**: Vertical milestones spanning *"Today"* to *"Event Day"* (e.g. 6 Months Out, 3 Months Out, 1 Month Out, 1 Week Out, Event Day).
- **Interactive Task Checklist**: Toggle tasks complete with satisfying strike-through animations and live percentage progress.
- **Priority Badges**: Distinct color-coded badges for **Critical**, **High**, **Medium**, and **Low** urgency.
- **Custom Milestone Creation**: Add custom tasks or filter by priority/status.

### 4. 🤝 Module 3: Categorized Vendor Checklist
- **Essential Categories**: Pre-populated with **Venue**, **Caterer**, **Photographer**, **Florist**, **DJ/Band**, **Officiant**, and **Rentals**.
- **Interactive Status Cycle**: Cycle between `Not Contacted` ⚪, `Reached Out` 🟡, `Booked` 🟢, and `Deposit Paid` 🟣.
- **Financial Commitment Tracking**: Tracks estimated cost vs actual amount paid and tallies committed budget.
- **Editable Notes Field**: Record tasting notes, contract details, and contact emails inline.

### 5. 💡 Module 4: Personalized Idea Generator ("Surprise Me")
- **6 Tailored Concepts Grid**: 6 distinct surprise concepts crafted to fit your budget, theme, and guest count.
- **Pro DIY Budget Saving Tips**: Every concept includes an actionable DIY hack to save hundreds of dollars without sacrificing aesthetics.
- **Live Regeneration (`POST /api/regenerate-ideas`)**: Click *"Surprise Me"* to fetch 6 brand new concepts on demand.

### 6. 🖨️ Export & 🔗 Shareable Plan ID
- **Executive Print/PDF Export**: Specialized `@media print` CSS formats an executive brief with budget tables, milestone roadmaps, vendor sheets, and ideas for client handoff or paper printing.
- **Shareable Cloud Plan ID**: Every plan receives a unique ID (e.g., `?planId=plan_3d8f1e2a`) allowing co-planners to load and revisit the plan anytime.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React 19 + Vite)                │
│                                                                 │
│  HeroSearch ──► PlanningDashboard (Budget, Timeline, Vendors)   │
│       ▲                     │                                   │
│       │                     ▼                                   │
│  Navbar & Modals (Export Print View, Shareable Plan Link)       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / JSON
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express 5)                  │
│                                                                 │
│  POST /api/generate-plan    POST /api/refine-budget             │
│  POST /api/regenerate-ideas GET  /api/plan/:id                  │
│                                                                 │
│  ├── PlanStorage (In-Memory Map with persistent ID lookup)      │
│  ├── Fallback Engine (Resilient rule-based plan generator)      │
│  └── Gemini Service (@google/genai SDK)                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Function Calling / JSON Schema
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Gemini 2.5 Flash                      │
│                                                                 │
│  • Tools: set_budget_allocation, create_timeline_tasks,        │
│           suggest_vendors, suggest_event_ideas                  │
│  • Stricter Prompt Retry Mechanism on JSON parse failure        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite 8 |
| **Styling & Aesthetics** | Pure Vanilla CSS Design System (Obsidian Dark Mode, Glassmorphism, Print CSS) |
| **Icons & Celebrations** | Lucide-React, Canvas-Confetti |
| **Backend Framework** | Node.js (v22), Express 5 |
| **GenAI SDK** | `@google/genai` (Official Google Gen AI SDK v2.31+) |
| **AI Model** | Google Gemini 2.5 Flash |
| **Testing** | Node.js native test runner (`node:test`, `node:assert`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+
- (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone https://github.com/your-username/event-planner-ai.git
cd event-planner-ai
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and enter your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```
> **Note**: If `GEMINI_API_KEY` is omitted or unconfigured, the application automatically switches to its high-fidelity procedural fallback engine, so you can test all features offline without any setup!

### 4. Running the Application
Run both the Express backend and the Vite client concurrently:
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:3001`

### 5. Running Tests
Run the unit and integration test suite:
```bash
npm test
```
Outputs:
```
# Subtest: Budget Recalculation Engine (Unit Test)
  ok 1 - Preserves total budget when cutting catering by 20% and shifting to decor
  ok 2 - Correctly shifts budget when adding fixed dollar amount
# Subtest: POST /api/generate-plan Integration Test (Mocking/Fallback)
  ok 1 - generates a full structured event plan and returns 200 with ID
```

### 6. Production Build
```bash
npm run build
npm start
```

---

## 📡 API Reference

### `POST /api/generate-plan`
Accepts event parameters and returns a comprehensive plan.
```json
// Request Body
{
  "eventType": "Wedding",
  "date": "2026-10-15",
  "guestCount": 100,
  "totalBudget": 25000,
  "city": "Austin, TX",
  "stylePreference": "Rustic Elegance"
}

// Response
{
  "success": true,
  "plan": {
    "id": "plan_7b8a1c9d",
    "metadata": { ... },
    "budget": { "venue": 8750, "catering": 7500, "decor": 3000, "photography": 2500, "attire": 2000, "misc": 1250 },
    "timeline": [ ... ],
    "vendors": [ ... ],
    "ideas": [ ... ]
  }
}
```

### `POST /api/refine-budget`
Accepts current allocation and an instruction in natural language.
```json
// Request Body
{
  "currentBudget": { "venue": 8750, "catering": 7500, "decor": 3000, "photography": 2500, "attire": 2000, "misc": 1250 },
  "instruction": "cut catering by 20% and move to decor",
  "totalBudget": 25000,
  "planId": "plan_7b8a1c9d"
}
```

### `POST /api/regenerate-ideas`
Generates a fresh set of 6 surprise-me ideas tailored to style and budget.

### `GET /api/plan/:id`
Retrieves a previously saved plan by its shareable ID.

---

## 🛡️ Reliability & Error Handling
- **Malformed JSON Recovery**: If Gemini outputs formatting quirks, the server retries once with a stricter repair prompt.
- **Fallback Plan Engine**: If the API is rate-limited, offline, or unconfigured, the system dynamically calculates tailored budgets, milestones, vendors, and ideas based on mathematical models and event type heuristics.
- **Budget Normalization**: Ensures that no matter what edits or AI shifts occur, the sum of category allocations remains 100% mathematically aligned to the total budget.
#   e v e n t - p l a n n e r  
 