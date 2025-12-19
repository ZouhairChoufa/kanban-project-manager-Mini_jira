# Firebase Admin Setup Instructions

## 1. Install Firebase Admin SDK
Run this command in your project directory:
```bash
npm install firebase-admin
```

## 2. Get Service Account Key from Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: "mini-jira-kanban-board"
3. Click the gear icon (Settings) → Project Settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Place it in your project root directory
9. Add `serviceAccountKey.json` to your `.gitignore` file

## 3. Environment Variables
Create a `.env` file in your project root with:
```
FIREBASE_PROJECT_ID=mini-jira-kanban-board
```

The service account key file should look like this:
```json
{
  "type": "service_account",
  "project_id": "mini-jira-kanban-board",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@mini-jira-kanban-board.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```