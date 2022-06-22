# Serverless functions
## Powered by Azure

This is an Azure Functions project using Node and TypeScript.  You may interact with this code in a number of ways:  through a Visual Studio Code extension, or using the Azure CLI.  [Check out the docs](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-local) to configure your local environment.

We're using Node 16 for this project.  [Learn how to use a Node Version Manager.](https://npm.github.io/installation-setup-docs/installing/using-a-node-version-manager.html)

We're using ESLint.  If you're using Visual Studio Code, be sure to install and enable the [ESLint extension for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

We're using [MongoDB](https://www.mongodb.com/).  In order to run functions locally for testing, you'll need MondoDB running on your local machine.  [This article](https://zellwk.com/blog/local-mongodb/) can help you install and start MongoDB.

The cloud function code also takes advantage of environment variables.  In order to test the functions locally, you'll want to create a `.env` file in the root project directory and copy the contents of the `env.example` into that file.  One of these variables, `GOOGLE_APPLICATION_CREDENTIALS`, refers to a JSON file that must be present in order to access user authorization services.  (Read on...)

We're bootstrapping user authorization via [Firebase](https://firebase.google.com/).  There are two Firebase projects set up:  one for the development environment, and one for production.  We're using the [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) within our cloud functions, which must be initialized using the appropriate environment.

- During initialization, the SDK checks for a `GOOGLE_APPLICATION_CREDENTIALS` environment variable, which points to a JSON file containing settings for the SDK (including API keys).  When developing locally, you'll need to generate these and save them in the root project directory.  (We recommend the filenames `fb-credentials.dev.json` and `fb-credentials.prod.json`, which will automatically be ignored by git.  __Please ensure these files are not checked in by git.__)
- If you do not have access to the Firebase projects, ask a team admin to generate them for you.
- In your `.env` file, add the name of the JSON file (likely `fb-credentials.dev.json`) to the `GOOGLE_APPLICATION_CREDENTIALS` variable.  During initialization, the Admin SDK should automatically use the settings within that file.

If you're using the command line, [this documentation](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-node?tabs=azure-cli%2Cbrowser) will be helpful as you create new [HTTP Trigger functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=in-process%2Cfunctionsv2&pivots=programming-language-javascript) and run them locally for testing.  However, because we're using TypeScript, the functions must first be transpiled prior to testing in a software such as [Postman](https://www.postman.com/).

- If you've just cloned the repo, be sure to run `npm install` in the root project directory to install dependencies (ie TypeScript, ESLint, et cetera).
- After building your code, execute `npm run build` from the root project directory.  This will transpile the code into a `dist` folder.
- Use `npm run start` (or `func start`) to begin local emulation of the functions.

When running locally, a function's `authLevel` is ignored (unless containerized).  In production, [the function should be secured using some sort of authentication](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=in-process%2Cfunctionsv2&pivots=programming-language-javascript#secure-an-http-endpoint-in-production).
