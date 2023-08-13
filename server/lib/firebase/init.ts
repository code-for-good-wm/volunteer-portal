import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';

// Attempt initialization of Firebase app
// Requires a GOOGLE_APPLICATION_CREDENTIALS environment variable to be set
// This should be loaded in from the local.settings.json file when running locally
// https://firebase.google.com/docs/admin/setup

function getFirebaseApp() {
  // functions are having issues loading files, so it's an encoded environment variable now
  // if not set, use the default
  const encodedCred = process.env['ENCODED_FIREBASE_CREDENTIALS'];

  if (!encodedCred) {
    return initializeApp({
      credential: applicationDefault(),
    });
  }

  // decode and parse
  const decoded = Buffer.from(encodedCred, 'base64').toString('ascii');
  const certObject = JSON.parse(decoded);

  return initializeApp({
    credential: cert(certObject),
  });
}


export const fbApp = getFirebaseApp();
