## Wilderness Survival System – Setup Guide

### 1. Prerequisites

- **Node.js**: v16 or newer (v18+ recommended)
- **npm**: comes bundled with Node

Check versions:

```bash
node -v
npm -v
```

### 2. Install Dependencies

From the project root (where `package.json` is located), run:

```bash
npm install
```

This installs all required libraries (React, Vite, TypeScript, etc.).

### 3. Assets and Fonts

- **Banner sprite**
  - Make sure the game banner image exists at:
    - `public/wilderness-banner.png`
  - If you want to use a different file name or path, update the `src` in `App.tsx`:
    - `src="/wilderness-banner.png"`

- **Pixel fonts**
  - `src/style.css` imports two retro game fonts from Google Fonts:

    ```css
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');
    ```

  - No additional setup is needed, as long as the client has an internet connection.

### 4. Running the Game (Development)

Start the Vite dev server:

```bash
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`) in your browser.

The dev server supports hot reload, so changes in `src/` (like `App.tsx` or `style.css`) will update automatically.

### 5. Building for Production

Create an optimized production build:

```bash
npm run build
```

To preview the build locally:

```bash
npm run preview
```

This runs a local static server that serves the built assets from `dist/`.

### 6. Controls & Gameplay Notes

- **Movement**: Arrow keys or `W`, `A`, `S`, `D`
- **Interact with trader**: `T` (when standing on a trader tile)
- **In trade menu**:
  - Adjust gold offer: Up/Down arrow keys or the `+` / `–` buttons
  - Submit counter‑offer: `Enter`
  - Cancel/leave trade: `Esc` or click **Reject Trade**

- **Difficulty** affects:
  - Map size and starting resources
  - Spawn rates for food, water, gold, and traders
  - Amount of food/water gained from resource tiles

### 7. Customization Tips

- **Tweaking spawn rates**: search for `createResourceForTile` in `App.tsx` and adjust the `rates` per difficulty.
- **Adjusting resource rewards**: in `Game.attemptMove` within `App.tsx`, look for the `spring` and `animal` handling blocks to change food/water gains by difficulty.
- **Styling**: most visual tweaks live in `src/style.css`. Colors and layout are designed for a dark, pixel‑art inspired theme.

Once dependencies are installed and the dev server is running, you should be able to play immediately and iterate on mechanics and visuals as needed.


