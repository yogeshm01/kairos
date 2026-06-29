# Mission Control AI Backend

## Phase 1 Auth Setup

The backend verifies Firebase Authentication ID tokens with Firebase Admin SDK.

Required environment variables:

```txt
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_STORAGE_BUCKET=""
```

For local `.env` files, keep `FIREBASE_PRIVATE_KEY` on one line with escaped newlines:

```txt
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Protected requests must include:

```txt
Authorization: Bearer <firebase_id_token>
```

## Current Endpoints

```txt
GET /api/health
GET /api/me
POST /api/missions
GET /api/missions
GET /api/missions/{mission_id}
PATCH /api/missions/{mission_id}
```

## Firestore Collections

The backend repository layer currently supports:

```txt
users
missions
milestones
tasks
daily_plans
reflections
ai_events
```

## Gemini

AI calls are isolated behind `GeminiService`. It requests JSON responses and validates them with Pydantic schemas before the rest of the application can use them.

Required environment variable:

```txt
GEMINI_API_KEY=""
```
