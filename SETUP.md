## Wilderness Survival System – Setup Guide

This guide is written so that **someone who has never run a JavaScript game before** can:

- **Download the code from GitHub**
- **Install everything they need**
- **Run the game locally**

The game is a **web game** built with **React + Vite + TypeScript**, so it runs in the browser.

---

### 1. What you need to install

- **Node.js**: version **16 or newer** (**18+ recommended**)
  - Download from the official website: search for **"Node.js download"** in your browser and choose the **LTS** version for your OS (for Windows, download the `.msi` installer).
  - When running the installer, **keep all default options**.
  - This will also install **npm** (Node’s package manager).

After installing, verify it worked by opening a terminal and typing:

```bash
node -v
npm -v
```

You should see version numbers like `v18.x.x` and `10.x.x`.  
If the commands say “not recognized”, try closing and reopening your terminal, or restarting your computer.

---

### 2. Getting the project from GitHub

There are two main ways for someone to get the code from GitHub.

- **Option A – Using Git (recommended)**
  1. Install Git (search for **"Git download"** and install it with default options).
  2. Open a terminal (see next section) and run:

     ```bash
     git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     cd YOUR_REPO_NAME
     ```

     Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

- **Option B – Download ZIP from GitHub**
  1. Go to your GitHub repo page in a browser.
  2. Click the green **Code** button.
  3. Click **Download ZIP**.
  4. Extract (unzip) the file somewhere (for example: `C:\Users\YourName\Desktop\GameCode`).
  5. Open a terminal and `cd` into that folder (see below).

---

### 3. How to open a terminal and go to the project folder (Windows)

- Press **Start** and type **"PowerShell"** or **"Command Prompt"**, then press **Enter**.
- Once the terminal is open, change to the project folder. For example, if the project is on your Desktop in a folder called `GameCode`:

```bash
cd C:\Users\YourName\Desktop\GameCode
```

Replace `YourName` with your actual Windows username.  
You can confirm you’re in the right place if a file named `package.json` shows up when you run:

```bash
dir
```

---

### 4. Install dependencies (one-time setup)

From the project root (the folder containing `package.json`), run:

```bash
npm install
```

This command:

- Downloads and installs all required libraries (**React**, **Vite**, **TypeScript**, etc.) into the `node_modules` folder.
- May take a few minutes the first time. Make sure you have an internet connection.

If you see an error like **"npm is not recognized"**, it usually means Node.js/npm isn’t installed correctly or the terminal needs to be restarted.

---

### 5. Assets and Fonts

- **Banner image**
  - The game expects the banner image file at:
    - `public/wilderness-banner.png`
  - In this repo, you should already see `wilderness-banner.png` at the project root.  
    If it is not already in `public/`, copy or move it there.
  - If you want to use a different file name or path, update the `src` attribute in `App.tsx`:
    - `src="/wilderness-banner.png"`

- **Pixel fonts**
  - `src/style.css` imports two retro game fonts from Google Fonts:

    ```css
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');
    ```

  - No extra installation is needed, as long as the player’s computer has an internet connection when loading the game.

---

### 6. Running the game in development mode

1. Make sure you are in the project directory (run `cd` as shown above).
2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. The terminal will print a URL, usually something like:

   ```text
   http://localhost:5173/
   ```

4. Open that URL in your web browser (Chrome, Edge, Firefox, etc.).
5. Leave the terminal window **open** while playing; closing it stops the dev server.

While the dev server is running:

- Any changes you make to files in `src/` (like `App.tsx` or `style.css`) will automatically reload in the browser.

To stop the game/server:

- Click in the terminal window and press **Ctrl + C**, then press **Y** or **Enter** if asked to confirm.

---

### 7. Building the game for sharing/hosting

This step creates an **optimized production build** of the game that you can host on a static web server (GitHub Pages, Netlify, itch.io, etc.).

From the project root, run:

```bash
npm run build
```

This will:

- Type-check the project.
- Create a `dist/` folder containing the static files (HTML, JS, CSS) for your game.

To test the production build locally, run:

```bash
npm run preview
```

Then open the URL printed in the terminal (again, usually `http://localhost:4173` or similar).

> **Tip:** If you want people to play directly from GitHub, you can deploy the `dist/` folder using **GitHub Pages** or another static hosting service.

---

### 8. Controls & gameplay notes

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

---

### 9. Customization tips (for people who want to mod the game)

- **Tweaking spawn rates**
  - Search for `createResourceForTile` in `App.tsx`.
  - Adjust the `rates` per difficulty to increase/decrease how often resources and traders appear.

- **Adjusting resource rewards**
  - In `Game.attemptMove` within `App.tsx`, look for the `spring` and `animal` handling blocks.
  - Change the food/water gains per difficulty to make the game easier or harder.

- **Styling / theme**
  - Most visual tweaks live in `src/style.css`.
  - Colors and layout are designed for a dark, pixel‑art inspired theme, but you can adjust fonts, sizes, and colors there.

Once dependencies are installed and the dev server is running, you (or anyone who clones/downloads the repo) should be able to **open the local URL in a browser and immediately play the game**.



