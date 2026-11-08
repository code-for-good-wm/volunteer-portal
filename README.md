# Code for Good Volunteer Portal

## Powered by Azure

For more details check out the readme files in the `client` and `server` folders. We're using authorization via [Firebase](https://firebase.google.com/), and MongoDB (CosmosDB) for data storage.

## Running locally

The preferred way to develop locally is against the shared **dev database** (the `volunteer-portal-dev` Azure Cosmos DB account, using the MongoDB API), so you don't need to install or seed MongoDB yourself.

### 1. Install the tools

- **Node.js 22.** The version is pinned in `.nvmrc` and `.tool-versions`, so `nvm install && nvm use` or `asdf install` from the repo root will pick it up.
- **Azure Functions Core Tools v4.** This provides the `func` command that runs the API locally. On macOS:

  ```bash
  brew tap azure/functions
  brew trust azure/functions
  brew install azure-functions-core-tools@4
  func --version
  ```

  For Windows and Linux, see [Work with Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local).

- **Azure CLI** (optional), for working with the Azure account that hosts the dev database: `brew install azure-cli`.

The Azure Static Web Apps CLI (`swa`) is a dev dependency of the root project, so `npm install` installs it.

### 2. Configure the client

Copy `client/.env.example` to `client/.env`. These are non-secret settings, and the defaults point at the dev Firebase project and the local API on `localhost:7071`.

### 3. Configure the server

Copy `server/local.settings.example.json` to `server/local.settings.json`, then fill in:

- `DATABASE_PASS`: the password for the dev Cosmos DB account. Get it from the Azure Portal (Cosmos DB account `volunteer-portal-dev` → Connection strings) or ask a team member. The `__DB_PASS__` placeholder in `DATABASE_URI` is replaced with this value at startup. You can also paste the full connection string into `DATABASE_URI` and remove `DATABASE_PASS`.
- `GOOGLE_APPLICATION_CREDENTIALS`: the Firebase Admin credentials file (see step 4).
- `SENDGRID_API_KEY`: only needed if you're sending email. See `server/README.md`.

### 4. Add Firebase Admin credentials

In the Firebase console, open the `cfg-volunteer-portal-dev` project, go to Project settings → Service accounts, and generate a new private key. Save it as `server/fb-credentials.dev.json`. Git ignores it, and it must never be committed.

### 5. Build and run

From the repo root:

```bash
npm install
npm run dev:install
npm run dev
```

The app runs at http://localhost:3000, and the Functions API runs on port 7071. After changing code, run `npm run dev:install` again and then `npm run dev`.

### Things to know

- **The dev database is shared.** Anything you create, edit or delete locally is visible to everyone using dev. Be careful with one-off scripts such as those in `server/scripts/`.
- **If you can't connect,** the Cosmos DB account's network settings may need your IP address allowed.
- **Working offline:** you can run MongoDB locally instead and set `DATABASE_URI` to `mongodb://localhost:27017` (and remove `DATABASE_PASS`).
- **Tests:** `cd server && npm test`. The server tests use an in-memory MongoDB and don't touch the dev database.
