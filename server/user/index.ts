import * as mongoose from 'mongoose';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../core';
import { checkBindingDataUserId, checkRequestAuth } from '../helpers';
import { connect, profileStore, skillStore, userStore } from '../models/store';
import { User } from '../models/user';
import { Profile } from '../models/profile';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Attempt to capture caller information from token
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken?.uid) {
      context.res = createErrorResult(401, 'Unauthorized');
      return;
    }

    // Acquire caller Firebase ID from decoded token
    uid = decodedToken.uid;
  } catch (error) {
    logger('Authentication error: ', error);
    context.res = createErrorResult(500, 'Internal error');
    return;
  }

  try {
    // Connect to database
    await connect(logger);
  } catch (error) {
    logger('Database error: ', error);
    context.res = createErrorResult(500, 'Internal error');
    return;
  }

  let result: Result | null = null;

  switch (req.method) {
  case 'GET':
    result = await getUser(uid);
    break;
  case 'POST':
    result = await createUser(context, uid);
    break;
  case 'PUT':
    result = await updateUser(context, uid);
    break;
  case 'DELETE':
    result = await deleteUser(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getUser(userIdent: string): Promise<Result> {
  // Attempt to acquire user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found');
  }

  // For MVP we're allowing users to only access their own data
  if (userIdent !== user.ident) {
    return createErrorResult(403, 'Forbidden');
  }

  return createSuccessResult(200, user);
}

async function createUser(context: Context, userIdent: string): Promise<Result> {
  // Check to see if this user already exists; if so, return error
  const user = await userStore.list(userIdent);
  if (user) {
    return createErrorResult(400, 'User document already exists');
  }

  // Build new user
  const email = context.req?.body?.email ?? '';
  if (!email) {
    return createErrorResult(400, 'Missing required parameters');
  }

  const newUser: User = {
    ident: userIdent,
    authProvider: 'firebase',
    name: '',
    phone: '',
    email,
  };

  const userData = await userStore.create(newUser);
  const userId = userData._id as mongoose.Types.ObjectId;

  // Build an initial profile
  const newProfile: Profile = {
    user: userId,
    roles: [],
    dietaryRestrictions: [],
    skills: [],
  };

  await profileStore.create(newProfile);

  return createSuccessResult(201, userData);
}

async function updateUser(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Move forward with update
  const update = context.req?.body;
  const result = await userStore.update(userId, userIdent, update);

  if (result.nModified === 1) {
    // User was updated
    return { 
      body: await userStore.list(userIdent),
      status: 200,
    };
  } else {
    // User not found, status 404
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
}

async function deleteUser(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to delete only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  await userStore.delete(userId, userIdent);

  // Delete this user's corresponding profile data
  const profile = await profileStore.list(userId);
  if (profile) {
    const profileId = profile._id;
    await profileStore.delete(profileId, userId);
    await skillStore.deleteAllForUser(userId);
  }

  return { body: null, status: 202 };
}

export default httpTrigger;