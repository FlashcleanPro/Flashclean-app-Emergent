# FlashClean Client App — PRD

## Product
Mobile (Expo) client app for a cleaning company. The home page reproduces the design provided by the user: header, search, hero banner, benefits row, services row, recurring plans block, "how it works" steps, and a 5-button bottom navigation with a floating central "Reserva Rápida" button.

## Tech stack
- **Frontend:** Expo Router (React Native 0.81, RN-Web), TypeScript.
- **Backend:** FastAPI + MongoDB (Motor).
- **Auth:** JWT email/password + Emergent Google Auth (unified `users` + `user_sessions` collections).
- **Storage:** `@/src/utils/storage` (SecureStore on native / localStorage on web) for the auth token.
- **Static data:** Services, plans, benefits and steps live in `/app/frontend/src/data/services.ts`.

## Key features
1. **Auth (JWT + Google).** Sign-in / sign-up screens, Emergent-managed Google sign-in via `WebBrowser.openAuthSessionAsync` (mobile) or full redirect (web). Session token persists in secure storage.
2. **Home screen.** Pixel-faithful reproduction of the reference image — header, title, search + filter, dark-blue promo banner, 4-benefit row, 3-service grid, recurring plans card (Semanal highlighted as "Mais escolhido"), 5-step "Reserva em menos de 60 segundos" rail.
3. **Quick booking bottom sheet.** Triggered by the central tab and by `Reservar Serviço` / service cards / plan cards. Allows choosing service, plan, date, time, address, notes — submits to `POST /api/bookings`.
4. **Tabs.** 5 tabs: Início, Serviços, Reserva Rápida (floating central), Reservas, Perfil. Reservas lists the user's bookings; Perfil shows account and logout.

## API
- `POST /api/auth/register` — `{email, password, full_name?}` → `{access_token, user}`
- `POST /api/auth/login` — `{email, password}` → `{access_token, user}`
- `POST /api/auth/session` — `{session_id}` (Emergent Google) → `{access_token, user}`
- `GET /api/auth/me` — Bearer → `User`
- `POST /api/auth/logout` — Bearer → `{ok}`
- `POST /api/bookings` — Bearer + booking payload → booking
- `GET /api/bookings` — Bearer → list of user bookings

## Test credentials
See `/app/memory/test_credentials.md`.
