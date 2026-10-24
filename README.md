# NEXORA AI

Open-innovation hackathon project: **17 fully AI-automated car features** for next-generation cars.
Each feature page explains what the feature is, how it helps in cars, and plays an AI reference video beside it.
Includes sign up / login (MongoDB) and a unified safety dashboard.

**Stack:** Next.js 14 (App Router), MongoDB + Mongoose, JWT in an httpOnly cookie, bcrypt password hashing.

## Run locally
```bash
npm install
cp .env.example .env.local     # then fill MONGODB_URI and JWT_SECRET
npm run dev                    # http://localhost:3000
```


## Google login + Gemini camera (new)
1. **Google login:** Google Cloud Console > APIs & Services > Credentials > Create OAuth client ID > *Web application*.
   Under *Authorized JavaScript origins* add `http://localhost:3000` and your Vercel/Render URL. Copy the client ID into `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
   (This one is baked in at build time, so redeploy after changing it.)
2. **Gemini key:** create a key at https://aistudio.google.com/apikey and put it in `GEMINI_API_KEY`. It is only used on the server (`/api/vision`), never sent to the browser.
3. Camera works on HTTPS (Vercel/Render) and on `localhost`. The browser asks for permission when a camera feature opens.
4. 14 of the 17 features analyse the camera. Car-to-Car, Safe Route Finder and Unified Dashboard use radio/GPS/vehicle data, so they do not.
5. Gesture feature (#4): open palm = unlock + open front doors, fist = close + lock, thumbs up/down = windows down/up, index up = hold.
   Protocols: same gesture on 2 frames in a row, 3 s cooldown, doors locked while "driving", windows capped at 30% while driving, rear child-lock.

## 1. MongoDB Atlas (authentication database)
1. Create a free cluster at mongodb.com/atlas.
2. Database Access: add a user with a password.
3. Network Access: add `0.0.0.0/0` (Vercel and Render use changing IPs).
4. Connect > Drivers: copy the connection string into `MONGODB_URI` (put the password in, and keep `/nexora` as the database name).

Test it before deploying: `npm run test:db` (prints OK or the exact reason it failed). After deploying, open `/api/health`: it shows `db: connected`.

## 2. Push to GitHub (Git Bash)
```bash
git init
git add .
git commit -m "NEXORA AI hackathon project"
git branch -M main
git remote add origin https://github.com/<your-username>/nexora-ai.git
git push -u origin main
```

## 3a. Deploy on Vercel
1. vercel.com > Add New Project > import the GitHub repo.
2. Environment Variables: `MONGODB_URI`, `JWT_SECRET` (any long random string).
3. Deploy.

## 3b. Deploy on Render
1. render.com > New > Blueprint (uses `render.yaml`) or New > Web Service.
2. Build: `npm install && npm run build`, Start: `npm start`.
3. Environment: set `MONGODB_URI` and `JWT_SECRET`.
4. Health check path: `/api/health` (returns 200 when MongoDB is connected).

## Reference videos
Every feature has a built-in animated AI simulation, so it works with no files.
To use your own AI-generated video for a feature, drop an MP4 named after the feature slug into `public/videos/`
(for example `public/videos/anti-door-crash.mp4`). It replaces the simulation automatically.

Slugs: road-danger-predictor, rain-flood-protection, night-vision-pedestrian-guardian, gesture-controlled-functions,
car-to-car-communication, anti-door-crash, driver-drowsiness-detection, driver-distraction-detection,
emergency-accident-detection, collision-risk-predictor, smart-safe-route-finder, predictive-vehicle-maintenance,
air-quality-cabin-monitor, unified-safety-dashboard, future-accident-simulator, vehicle-intention-predictor,
invisible-road-hazard-detector.

## Notes
- Dashboard telemetry is a simulation for demo purposes, not a real vehicle feed.
- Never commit `.env` / `.env.local` (already in `.gitignore`).
