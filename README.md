# 🧩 FoodScore Hub — AI-Powered Food Health Analyzer

## 🚀 Overview

FoodScore Hub is an AI-integrated web app that helps users understand the healthiness of their food. Users can scan barcodes or speak directly to the app using the **Voice Interaction feature**, and Gemini 2.5 Flash analyzes the product to generate a **health score (0–10)**, nutritional insights, and visual analytics.

This project combines AI, data visualization, and full-stack development (MERN + Supabase Edge Functions + Gemini) to deliver a smart, user-friendly health assistant.

---

## 🧠 Key Features

| Feature                | Description                                               | Tech Used                         |
| ---------------------- | --------------------------------------------------------- | --------------------------------- |
| **AI Health Analysis** | Gemini 2.5 Flash rates food health and explains reasoning | Gemini 2.5 Flash, Open Food Facts |

| **Voice Interaction** | Users can literally talk to the app: “Tell me if this food is healthy,” and Gemini responds by voice | Web Speech API, SpeechSynthesis, Gemini 2.5 Flash |

| **Smart Recommendations** | Suggests healthier alternatives based on scanned product | Gemini + Open Food Facts |

| **User Authentication** | Secure login and personalized dashboard | Supabase Auth |

| **Visual Dashboard** | Interactive charts for tracking health trends | React, Recharts, Chart.js |

| **Pie Chart** | Shows macronutrient breakdown (Carbs, Protein, Fat) | Recharts |

| **Bar Chart** | Displays user health score trends over time | Recharts |

| **Gauge Chart** | Shows current product’s health score visually (0–10) | Recharts / Chart.js |

| **Admin Panel** | Manage global analytics and user data | Supabase + Dashboard UI |

---

## ⚙️ Tech Stack

**Frontend:** React, Vite, TypeScript, TailwindCSS, Recharts, Chart.js  
**Backend:** Supabase Edge Functions (Deno), Gemini 2.5 Flash, Open Food Facts API  
**Database:** Supabase (PostgreSQL)  
**Auth:** Supabase Auth  
**AI:** Gemini 2.5 Flash (for reasoning, voice responses, and recommendations)

---

## 🧩 System Flow

```
🎙 User SCAN'S the product
     ↓
Supabase Edge Function processes it → Calls Gemini
     ↓
Gemini analyzes food → returns health score + explanation
     ↓
Frontend displays:
  - Product Health Score
  - Macronutrient Breakdown
  - Health Trends
```

---

## 📊 Visual Analytics

### 🥧 **Pie Chart — Macronutrient Breakdown**

Displays the proportion of Carbs, Protein, and Fat from the scanned product.

### 📈 **Bar Chart — Health Score Trends**

Shows changes in health scores over time for each product scanned by the user.

### 🎯 **Gauge Chart — Health Rating Meter (0–10)**

Represents the current product’s AI-generated score visually for quick evaluation.

---

## 🧠 Voice Interaction Feature

The app now supports **natural voice queries** via the Web Speech API.  
Users can say things like:

- “Is this food healthy?”
- “Tell me about this product’s sugar content.”
- “Rate this food for me.”

Gemini responds conversationally and the app reads the answer aloud using the **SpeechSynthesis API**.

---

## 📦 How It Works

1. User scans barcode or speaks query.
2. The frontend sends a request to Supabase Edge Function.
3. The backend fetches product data from Open Food Facts.
4. Gemini analyzes the nutritional values and generates:
   - Health Score (0–10)
   - Reasoning (why this score)
   - Voice-friendly response
5. The frontend:
   - Displays product info, AI insights, and charts.

---

## 🧭 Future Enhancements

- OCR-based nutrition label scanning.
- AI meal planner with personalized suggestions.
- Multilingual voice interaction (English + Hindi).
- Exportable health reports (PDF/CSV).

---

## 🖼 Example Architecture

```
React (Voice + UI + Charts)
     ↓
Supabase Edge Functions (Deno)
     ↓        ↘
Open Food Facts API   Gemini 2.5 Flash
     ↓        ↙
Supabase Database (Users, Scans, Health Scores)
     ↓
React Dashboard (Voice + Pie + Bar + Gauge)
```

---

## 💬 Example Tagline

> "🎙️ Speak to your AI Nutrition Assistant! FoodScore Hub analyzes your food, explains its health score, and visualizes your diet with smart charts — powered by Gemini 2.5 Flash and Supabase Edge."
