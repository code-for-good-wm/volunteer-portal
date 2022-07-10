import { initializeApp, applicationDefault } from 'firebase-admin/app';

// Attempt initialization of Firebase app
// Requires a GOOGLE_APPLICATION_CREDENTIALS environment variable to be set
// This should be loaded in from the local.settings.json file when running locaxslly
// https://firebase.google.com/docs/admin/setup
const fbApp = initializeApp({
  credential: applicationDefault(),
});
