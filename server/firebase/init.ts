import * as dotenv from 'dotenv';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

// Load any ENV vars from local .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Attempt initialization of Firebase app
// Requires a GOOGLE_APPLICATION_CREDENTIALS environment variable to be set
// https://firebase.google.com/docs/admin/setup
const fbApp = initializeApp({
  credential: applicationDefault(),
});
