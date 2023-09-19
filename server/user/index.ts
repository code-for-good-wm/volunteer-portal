import * as mongoose from 'mongoose';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { checkBindingDataUserId, checkAuthAndConnect } from '../lib/helpers';
import { profileStore, skillStore, userStore } from '../lib/models/store';
import { IUser } from '../lib/models/user';
import { IProfile } from '../lib/models/profile';
import { IUserSkill } from '../lib/models/user-skill';
import { UserRole } from '../lib/models/enums/user-role.enum';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // get caller uid from token and connect to DB
  // eslint-disable-next-line prefer-const
  let { uid, result } = await checkAuthAndConnect(context, req);

  // result will be non-null if there was an error
  if (result) {
    context.res = result;
    return;
  }

  switch (req.method) {
  case 'GET':
    result = await getUser(context, uid);
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

async function getUser(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // For MVP we're allowing users to only access their own data
  if (userIdent !== user.ident) {
    return createErrorResult(403, 'Forbidden', context);
  }

  return createSuccessResult(200, user, context);
}

async function createUser(context: Context, userIdent: string): Promise<Result> {
  // Check to see if this user already exists; if so, return error
  const user = await userStore.list(userIdent);
  if (user) {
    return createErrorResult(400, 'User document already exists', context);
  }

  // Build new user
  const email = context.req?.body?.email ?? '';
  if (!email) {
    return createErrorResult(400, 'Missing required parameters', context);
  }

  const newUser: IUser = {
    ident: userIdent,
    authProvider: 'firebase',
    name: '',
    phone: '',
    email,
    userRole: UserRole.VOLUNTEER
  };

  const userData = await userStore.create(newUser);

  // Build an initial profile
  const newProfile: IProfile = {
    user: userData._id,
    roles: [],
    dietaryRestrictions: [],
    skills: new mongoose.Types.DocumentArray<IUserSkill>([]),
  };

  await profileStore.create(newProfile);

  return createSuccessResult(201, userData, context);
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

  // Ensure users cannot modify their own permissions by resetting it to the current DB value, or VOLUNTEER
  // Permission changes are handled in a separate endpoint
  update.userRole = checkResult.body.userRole ?? UserRole.VOLUNTEER;

  const result = await userStore.update(userId, userIdent, update);

  if (result.modifiedCount === 1) {
    // User was updated
    return createSuccessResult(200, await userStore.list(userIdent), context);
  } else {
    // User not found, status 404
    return createErrorResult(404, 'User not found', context);
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