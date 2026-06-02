# Venez nous voir à Londres 🇬🇧

A small site for family to book the days they come and visit us. **One booking
per day max** (enforced by a unique index in the database). Days that are already
taken are visible to everyone, and access is protected by a shared code.

## Stack

- **Next.js 15** (App Router) + React 19
- **MongoDB** (native driver, no Mongoose)
- **Tailwind CSS v4**
- **Vercel** deployment

The user-facing UI is in French (it's for a French-speaking family); the code,
comments and docs are in English.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment variables and fill them in:

   ```bash
   cp .env.example .env.local
   ```

   - `MONGODB_URI`: your MongoDB connection string (create a free cluster on
     [MongoDB Atlas](https://www.mongodb.com/atlas)).
   - `ACCESS_CODE`: the code you hand out to your family (lets them book).
   - `ADMIN_CODE`: your private code. Logging in with it unlocks cancellation.
   - `SESSION_SECRET`: random secret signing the session cookie
     (`openssl rand -hex 32`).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Deploying to Vercel

1. Push the project to GitHub.
2. On [vercel.com](https://vercel.com), import the repo.
3. Under **Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `ACCESS_CODE`
   - `ADMIN_CODE`
   - `SESSION_SECRET`
   - `MONGODB_DB` (optional)
4. In MongoDB Atlas, allow connections from Vercel
   (**Network Access → 0.0.0.0/0**, or Vercel's IP ranges).
5. Deploy. That's it 🎉

## How it works

- Access is protected by `ACCESS_CODE` (or `ADMIN_CODE`); both set an httpOnly
  cookie valid 6 months. Auth is checked via `/api/session`, which never touches
  the database, so the calendar still loads even if MongoDB is slow.
- The calendar shows the current month: green = free, pink = booked.
- A visit is booked over a date range (arrival → departure) with a name and an
  optional short message. Each day of the range is one document sharing a
  `groupId`; the unique index on `date` guarantees one booking per day, and the
  whole range is inserted atomically in a transaction (all-or-nothing).
- Only an admin (logged in with `ADMIN_CODE`) can cancel. Cancelling any day of
  a stay cancels the whole stay.
- Past dates and already-booked days cannot be booked.

## Structure

```
src/
  app/
    api/
      auth/route.ts            # checks the access code, sets the cookie
      session/route.ts         # returns auth + admin status (no DB)
      bookings/route.ts        # list + create bookings (date range)
      bookings/[date]/route.ts # cancel a stay (admin only)
    layout.tsx
    page.tsx                   # access gate or calendar
  components/
    AccessGate.tsx
    Calendar.tsx
    DayPanel.tsx
  lib/
    auth.ts                    # cookie + access code
    mongodb.ts                 # connection + unique index
    date.ts                    # date helpers (no dependency)
```
