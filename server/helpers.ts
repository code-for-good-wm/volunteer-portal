import { Context, Logger } from '@azure/functions';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { createErrorResult, createSuccessResult, Result } from './core';
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
    return createErrorResult(404, 'User not found');
  }

  // Acquire user ID from binding data
  const userId = context.bindingData.userId;
  if (!userId) {
    return createErrorResult(400, 'Missing required parameter');
  }

  // Compare; if requestor and userId are not the same, return error
  // IMPORTANT: We're ignoring type here; the _id field is technically an object
  if (userId != user._id) {
    return createErrorResult(403, 'Forbidden');
  }

  return createSuccessResult(200, user);
};
