# Code for Good Volunteer Portal
## Powered by Azure

For more details check out the readment files in the `client` and `server` folders. We're using authorization via [Firebase](https://firebase.google.com/), and MongoDB (CosmosDB) for data storage. To build and run the entire app locally (after seeting up MongoDB):

1. Create a `.env` file in the `client` project directory and copy the contents of the `env.example` into that file
1. Create a `local.settings.json` file in the `server` project directory. Copy the contents of the `local.settings.example.json` file into `local.settings.json` and adjust where necessary
1. Run the following scripts, whcih will build both the client and the server and start the app locally

```bash
npm run dev:install
npm run dev
```