# Deploying to Netlify

## One-time setup

### 1. Push to GitHub
Create a new repository on GitHub and push this folder:
```bash
git init
git add .
git commit -m "Initial inspection app"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
2. Connect your GitHub account and select the repository
3. Netlify will auto-detect the build settings from `netlify.toml` — no changes needed
4. Click **Deploy site**

### 3. Set your API key
In Netlify → **Site configuration → Environment variables**, add:

| Key | Value |
|-----|-------|
| `APEX27_API_KEY` | Your Apex27 API key |

Then trigger a redeploy: **Deploys → Trigger deploy → Deploy site**

---

## Customising the branding

Replace `public/logo.svg` with your own logo. The logo appears in the app header and on the PDF cover page.

- Recommended size: 200 × 60px
- Transparent or white background works best against the dark blue header

---

## How the app works

- The app runs entirely in the browser (React SPA)
- All Apex27 API calls go through a Netlify serverless function (`netlify/functions/apex27.js`) — this keeps your API key hidden from the browser
- Drafts are auto-saved to the agent's phone (localStorage) so they survive closing the browser mid-inspection
- On submit, the app: creates the inspection record → uploads photos → creates issues → sends an Apex27 notification → generates and downloads a PDF report

---

## Inspection flow

| Step | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Upcoming inspections + resume draft |
| Select property | `/search` | Search Apex27 listings |
| Inspection details | `/inspection/details` | Date, agent, type |
| Room walkthrough | `/inspection/rooms` | Room-by-room condition + photos |
| Utilities | `/inspection/utilities` | Meter readings + safety checks |
| Maintenance issues | `/inspection/issues` | Flag issues (synced to Apex27) |
| Review & submit | `/inspection/review` | Final check + submit to Apex27 |
| Confirmation | `/inspection/complete` | Download PDF |
