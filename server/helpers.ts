import { Logger } from '@azure/functions';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

type CheckRequestAuth = (authorization: string | undefined, logger: Logger) => Promise<DecodedIdToken | null>

/**
 * Check HTTP authorization
 * Returns an object of decoded token data or null if unauthorized
 * @param {string} [authorization]
 * @param {Logger} logger
 * @returns {Promise<DecodedIdToken | null>}
 */
export const checkRequestAuth: CheckRequestAuth = (authorization, logger) => {
  return new Promise((resolve, reject) => {
    let token = '';

    // Check header authorization for token
    if (authorization) {
      const parts = authorization.split('Bearer ');
      token = parts[1];
    }

    if (!token) {
      return null;
    }

    // Verify token with Firebase Admin SDK
    getAuth().verifyIdToken(token)
      .then((decoded) => {
        resolve(decoded);
      })
      .catch((error) => {
        logger('Could not verify Firebase token: ', error);
        resolve(null);
      });
  });
};
