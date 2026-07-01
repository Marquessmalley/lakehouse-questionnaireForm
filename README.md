# Lakehouse Discovery Questionnaire

A static HTML/CSS/JavaScript discovery form for the Lake House Rental Web App. Responses autosave to `localStorage` and submit to Cloud Firestore.

## Features

- 7 sections including **Client Budget & Project Spend**
- Autosave draft to `localStorage` (key: `lakehouse-discovery-draft-v2`)
- Conditional fields (e.g. budget helper when "Not sure", yes/no reveals details)
- Firestore submission with `schemaVersion: 2` data model
- No build step — deploy directly to GitHub Pages

## Local development

From this folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:3000` (serve) or `http://localhost:8080` (python).

> ES modules require a local server — opening `index.html` directly from the filesystem may block module loading.

## Firebase setup

### Option A: Firebase MCP (in Cursor)

1. Sign in: use the Firebase MCP `firebase_login` tool
2. Create project: `firebase_create_project` with your chosen project ID
3. Create web app: `firebase_create_app` with `platform: web`
4. Get config: `firebase_get_sdk_config` with `platform: web`
5. Paste values into [`js/config.js`](js/config.js)
6. Enable Firestore in the [Firebase Console](https://console.firebase.google.com/)
7. Deploy rules from this folder:

```bash
npx firebase-tools@latest login
npx firebase-tools@latest use --add YOUR_PROJECT_ID
npx firebase-tools@latest deploy --only firestore:rules
```

### Option B: Firebase Console (manual)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Add a **Web** app and copy the `firebaseConfig` object
3. Paste into [`js/config.js`](js/config.js)
4. Create a **Firestore** database
5. Deploy [`firestore.rules`](firestore.rules) using the Firebase CLI (see above)

## Data model

Submissions are stored in the `discoveryQuestionnaires` collection with:

- `schemaVersion: 2`
- `status: "submitted"`
- `submittedAt` (ISO string)
- `clientBudget`, `guestAccountBooking`, `propertyRules`, `availability`, `payments`, `pricingRules`, `propertyDetails`

See [`js/models/questionnaire.js`](js/models/questionnaire.js) for the full shape.

## State persistence

**Default (implemented):** `localStorage` — survives page refresh on the same browser/device.

| Approach             | Best for                     | Tradeoff                         |
| -------------------- | ---------------------------- | -------------------------------- |
| `localStorage`       | Simple drafts, no backend    | Same browser only                |
| IndexedDB            | Larger payloads, attachments | More complex API                 |
| Firestore draft sync | Cross-device resume          | Requires auth + draft rules      |
| URL-encoded state    | Shareable links              | Size limits, exposes data in URL |

## GitHub repository & Pages

This folder is intended to be its own repository (not the parent `lakehouse-app` monorepo).

```bash
cd business-requirements/lakehouse-discovery-form   # from lakehouse-app root
git init
git add .
git commit -m "Add lakehouse discovery questionnaire form"
gh repo create lakehouse-discovery-form --public --source=. --remote=origin --push
```

Enable GitHub Pages:

1. Repo **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` → `/ (root)`
4. Site URL: `https://<username>.github.io/lakehouse-discovery-form/`

After deploying, update Firebase **authorized domains** (Firebase Console → Authentication → Settings → Authorized domains) to include your `github.io` domain if you add App Check or Auth later.

## Project structure

```
├── index.html
├── css/styles.css
├── js/
│   ├── config.js           # Firebase config + constants
│   ├── models/questionnaire.js
│   ├── storage.js
│   ├── form.js
│   └── firebase.js
├── firestore.rules
├── firebase.json
└── README.md
```

## Security notes

- Firestore rules allow **create only** on `discoveryQuestionnaires` with `schemaVersion == 2`
- Reads, updates, and deletes from the client are denied
- For production, consider [Firebase App Check](https://firebase.google.com/docs/app-check) to reduce spam submissions
