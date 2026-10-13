# ShopEase – Development Guide

How to run the ShopEase app locally for development and testing.

---

## 1. Prerequisites

| Tool    | Version | Check with      |
|---------|---------|-----------------|
| Node.js | 20+     | `node -v`       |
| npm     | 10+     | `npm -v`        |
| Git     | any     | `git --version` |

## 2. First-Time Setup

From the repository root:

```bash
cd shopease-app
npm install
```

## 3. Start the App

```bash
cd shopease-app
npm run dev
```

Wait for:

```
ShopEase running at http://localhost:3000
```

### Verify

| Check        | URL                                  | Expected            |
|--------------|--------------------------------------|---------------------|
| Server is up | http://localhost:3000/api/health     | `{"status":"ok"}`   |
| App is up    | http://localhost:3000/               | Login page          |

### Test Accounts (BRD §8.1)

| Username      | Password   | Type             |
|---------------|------------|------------------|
| `alice`       | `Shop@123` | Active customer  |
| `bob`         | `Shop@123` | Active customer  |
| `locked_user` | `Shop@123` | Locked customer  |

## 4. Recommended Terminal Setup

Use two terminals so the server is never interrupted:

| Terminal       | Purpose                                         |
|----------------|-------------------------------------------------|
| **1 – Server** | `npm run dev` only. Leave it running.           |
| **2 – Work**   | Git, scripts, and any other commands.           |

## 5. Common Tasks

| Task                         | Command                                                     |
|------------------------------|-------------------------------------------------------------|
| Stop the server              | `Ctrl+C` in the server terminal                             |
| Start the server             | `npm run dev`                                               |
| Run in production mode       | `NODE_ENV=production npm start` (Git Bash) · `$env:NODE_ENV="production"; npm start` (PowerShell) |
| Reset test data (no restart) | `POST http://localhost:3000/api/test/reset`                 |

Reset test data from the command line:

```bash
# Git Bash / macOS / Linux
curl -X POST http://localhost:3000/api/test/reset

# PowerShell
Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset
```

> Reset restores the seed data (BRD §8) and logs out all users.
> It is **not available** in production mode.

## 6. What Happens When You Change a File

| Changed file in…     | Effect                                      | You need to…                    |
|----------------------|---------------------------------------------|---------------------------------|
| `src/` (server code) | Server restarts automatically (`--watch`)   | Wait for "ShopEase running at…" |
| `public/` (UI files) | Nothing on the server                       | Refresh the browser (`Ctrl+F5`) |

> A server restart clears all in-memory data, so you will need to log in again.

## 7. Troubleshooting

| Symptom                                             | Cause                                   | Fix                                                   |
|-----------------------------------------------------|-----------------------------------------|-------------------------------------------------------|
| Browser: *Cannot reach the server*                  | Server not running, or restarting       | Start it with `npm run dev`, or wait for the restart  |
| Terminal: `EADDRINUSE`                              | Server already running on port 3000     | Use the existing terminal, or stop it first           |
| Terminal: `SyntaxError` / `Cannot find module`      | Error in a `src/` file                  | Read the file and line shown in the error             |
| Suddenly back on the login page                     | Server restarted or test data was reset | Log in again (expected)                               |
| UI change not visible                               | Browser cache                           | Hard refresh: `Ctrl+F5`                               |
