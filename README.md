## 🧩 FoodSight AI — Enhanced Architecture & README

### ⚙️ **System Architecture Diagram**

**Frontend (React + Vite + Tailwind + TypeScript)**

- Handles barcode scanning and user interaction.
- Displays product details, AI-generated health scores, explanations, and visual analytics.
- Implements authentication (via Supabase Auth) for personalized user history.
- Uses Chart.js/Recharts for visualizing nutrition data and user stats.

**↓ REST API Communication (HTTPS)**

**Backend (Supabase Edge Function + Deno + TypeScript)**

- Accepts requests from frontend containing product barcode.
- Fetches product details from **Open Food Facts API**.
- Passes structured product data to **Gemini 2.5 Flash** for analysis.
- Generates:

  - Health Score (0–10)
  - AI Reasoning ("Why this score")
  - Recommended Healthier Alternatives

- Stores user scan data and results in **Supabase Database (Postgres)**.

**↓ Database Interaction (Supabase SDK)**

**Supabase Database (Postgres)**

- `users` table — Authenticated user profiles.
- `scans` table — Stores scanned products, scores, explanations, and timestamps.
- `analytics` view — Aggregated user insights (e.g., avg health score, category trends).

**↓ AI Analysis Layer**

**Gemini 2.5 Flash (via Google Generative API)**

- Input: product data (nutrients, ingredients, category)
- Output: health rating + human-like reasoning paragraph
- Optionally returns product comparisons / healthier alternatives.

**↓ External Data Source**

**Open Food Facts API**

- Provides detailed nutritional info for barcodes scanned by users.

---

### 🧠 **Enhanced Project Overview (For README)**

#### **🔹 Project Title:** FoodScore Hub — AI-Powered Food Health Analyzer

#### **🚀 Overview**

FoodScore Hub is an AI-integrated web application that helps users understand how healthy their food choices are. Simply scan a barcode, and the app analyzes the product’s nutritional profile using **Gemini 2.5 Flash**, returning a **Health Score (0–10)** and an **AI-driven explanation** of why it scored that way.

#### **✨ Key Features**

| Feature                    | Description                                                                | Tech Used                         |
| -------------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| **AI Health Analysis**     | Uses Gemini 2.5 Flash to rate and explain a food’s healthiness             | Gemini 2.5 Flash, Open Food Facts |
| **Smart Recommendations**  | Suggests healthier alternatives within the same category                   | Gemini + Open Food Facts          |
| **User Authentication**    | Users can sign up, log in, and track scan history                          | Supabase Auth                     |
| **Personalized Dashboard** | Visual charts showing trends in scanned products and average health scores | React, Recharts                   |
| **AI Explanation**         | Gemini explains reasoning behind each score                                | Gemini API                        |
| **Offline Support (PWA)**  | Last few scans available offline                                           | Service Worker                    |
| **Admin Panel**            | Shows analytics across all user data                                       | Supabase + Admin Dashboard        |

---

### 🧰 **Tech Stack**

**Frontend:** React, Vite, TypeScript, TailwindCSS, Recharts
**Backend:** Supabase Edge Functions (Deno), Gemini 2.5 Flash API, Open Food Facts API
**Database:** Supabase (PostgreSQL)
**Auth:** Supabase Auth
**AI:** Gemini 2.5 Flash (Health Scoring + Explanation Generation)

---

### 🧩 **System Flow (Step-by-Step)**

1. User scans barcode → React frontend extracts code.
2. Frontend sends barcode → Supabase Edge Function.
3. Backend fetches product data from Open Food Facts.
4. Gemini AI analyzes nutrition → returns score + explanation.
5. Result stored in Supabase DB + shown on user dashboard.
6. Dashboard visualizes user’s scan history, trends, and insights.

---

### 🎯 **Why This Project Stands Out to Recruiters**

✅ Combines AI, data visualization, and full-stack development in one cohesive product.
✅ Real-world problem with measurable impact.
✅ Clean architecture (Supabase Edge + Gemini integration).
✅ Strong emphasis on UI/UX and data-driven storytelling.
✅ Scalable for future expansion (OCR, multilingual support, voice interface).

---

### 🧱 **Future Enhancements**

- OCR-based nutrition label reader (upload photo → extract nutrition).
- Voice query: “Is this product healthy?” → Gemini answers.
- Multilingual AI explanations (English + Hindi).
- AI Meal Planner — Suggests daily calorie intake from past scans.

---

### 🖼️ **Visual Diagram Summary (Text-based)**

```
React (Barcode Scan + UI)
     ↓
Supabase Edge Function (Deno)
     ↓      ↘
Open Food Facts API   Gemini 2.5 Flash
     ↓      ↙
Supabase Database (Users, Scans)
     ↓
React Dashboard (Charts + Insights)
```

---

### 📢 **How to Present It on GitHub / LinkedIn**

- Add **screenshots** (Scan Screen, Health Report, Dashboard).
- Pin a **30-sec demo video** (barcode scan → AI result → dashboard).
- Include a **section on learning outcomes**:

  > "Built a full-stack AI-driven web app integrating Gemini 2.5 Flash, Supabase, and Open Food Facts to evaluate product health scores with explainable AI."

- Add badges for tech stack (React, Supabase, Gemini, Tailwind, Vite).

---

### 💬 **Example README Summary Tagline**

> "🚀 Full-stack AI project analyzing food health using Gemini 2.5 Flash, Supabase, and Open Food Facts — scan, score, and understand your diet with explainable AI."

---

### 🤝 **Collaboration**

> "I'm open to collaborating on AI-driven food health analysis projects. Let's build something amazing together!"

---

### 📫 **Contact**

> "If you're interested in working together or have any questions, don't hesitate to reach out! Let's create something amazing together!"

> "Best regards, RISHIT RAMAN"

---

### 🌟 **Thank You**
