import { Context, Logger } from '@azure/functions';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { Result } from './core';
import { userStore } from './models/store';

type CheckRequestAuth = (authorization: string | undefined, logger: Logger) => Promise<DecodedIdToken | null>
type CheckBindingDataUserId = (context: Context, userIdent: string) => Promise<Result>

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

/**
 * Check binding data userId against requestor identifier
 * Returns a Result with the user data or an error
 * @param {Context} context - Azure function context
 * @param {string} userIdent - the user's identifier from the app's auth system
 * @returns {Promise<Result>}
 */
export const checkBindingDataUserId: CheckBindingDataUserId = async (context: Context, userIdent: string) => {
  // Attempt to acquire user data from userIdent
  const user = await userStore.list(userIdent);
  if (!user) {
    return {
      body: {
        'error' : {
          'code' : 404,
          'message' : 'User not found'
        }
      },
      status: 404,
    };
  }

  // Acquire user ID from binding data
  const userId = context.bindingData.userId;
  if (!userId) {
    return {
      body: {
        'error': {
          'code' : 400,
          'message' : 'Missing required parameter',
        }
      },
      status: 400,
    };
  }

  // Compare; if requestor and userId are not the same, return error
  if (userId !== user._id) {
    return {
      body: {
        'error': {
          'code' : 403,
          'message' : 'Forbidden',
        }
      },
      status: 403,
    };
  }

  return { body: user, status: 200 };
};
