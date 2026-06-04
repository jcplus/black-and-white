# Cute Black and White - Tap the Macaron Tiles 🌸

A premium, modern, and cute adaptation of the classic "Don't Tap the White Tile" (Piano Tiles) web game. This project is built as a lightweight serverless application, fully ready to deploy on **Cloudflare Workers**.

---

## 🎮 Gameplay & Rules

1. **Tap the Colored Tiles:** Tap the randomly appearing colored macaron blocks on the screen.
2. **Avoid Mistakes:** The game ends immediately if:
   - The board becomes completely filled with blocks (20 cells max).
   - You tap on an empty white space.
3. **Combo Multipliers:** Tapping tiles of the **same color** consecutively builds up your combo.Tapping a different color resets the combo. High combo levels multiply your score up to x16!
4. **Fever Mode:** Reaching a combo of 10 or more triggers Fever Mode, activating rainbow neon glow animations.

---

## ✨ Features

- **Cute Aesthetic:** Beautiful pastel/macaron color scheme, smooth micro-animations, glassmorphism HUD, and typography using Google Fonts (Fredoka).
- **Web Audio Sound Synthesis:** Cute animal-crossing style sound effects generated dynamically using the browser's Web Audio API. Frequency scales up dynamically with your combo.
- **Global Leaderboard:** Features a global high-score leaderboard.
- **Serverless Architecture:** Completely powered by Cloudflare Workers and Cloudflare KV database.
- **Resilient Fallback:** Automatically degrades to local storage caching for the leaderboard if KV storage quota is exceeded or the service is temporarily offline.
- **Rate Limiting:** Built-in IP-based rate limiting prevents spamming entries to the global leaderboard.

---

## 🛠️ Technical Stack

- **Core**: HTML5, Vanilla JavaScript (ES Modules).
- **Styling**: Vanilla CSS3 with flexbox, grid, custom CSS variables, and modern keyframe animations.
- **Backend / Hosting**: Cloudflare Workers.
- **Database**: Cloudflare Workers KV.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your system.

### Install Dependencies

Install the Wrangler CLI tool, which is used for local development and deployment:

```bash
npm install
```

### Local Development

Run the development server locally:

```bash
npm run dev
```

This starts a local dev server at `http://localhost:8787` mimicking the Cloudflare Worker runtime environment.

### Deploy to Cloudflare Workers

To deploy the game to your Cloudflare account:

```bash
npm run deploy
```

---

## 📂 Project Structure

- [package.json](file:///package.json): Project scripts and package configuration.
- [wrangler.toml.example](file:///wrangler.toml.example): Template Cloudflare Worker configuration. Copy this to `wrangler.toml` and populate with your own KV namespace ID.
- [src/index.js](file:///src/index.js): Serverless Worker entrypoint handling API routes and serving the HTML.
- [src/game.html.js](file:///src/game.html.js): The main game page containing the front-end layout, styling, and game logic.

---

## 🔗 Repository
GitHub repository: [https://github.com/jcplus/black-and-white](https://github.com/jcplus/black-and-white)
