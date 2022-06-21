import { Logger } from '@azure/functions';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

type DecodeFirebaseToken = (token: string, logger: Logger) => Promise<DecodedIdToken | null>

/**
 * Decode Firebase token
 * Will return a decoded FB token object or null if parsing is not possible
 * @param {string} token
 * @param {Logger} logger
 * @returns {Promise<DecodedIdToken | null>}
 */
export const decodeFirebaseToken: DecodeFirebaseToken = (token, logger) => {
  return new Promise((resolve, reject) => {
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
