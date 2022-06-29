
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../core';
import { connect, profileStore, skillStore } from '../models/store';
import { Profile } from '../models/profile';
import { checkBindingDataUserId, checkRequestAuth } from '../helpers';
import { UserSkill } from '../models/user-skill';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Attempt to capture caller information from token
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken?.uid) {
      context.res = createErrorResult(401, 'Unauthorized')
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
    result = await getProfile(context, uid);
    break;
  case 'POST':
    result = await createProfile(context, uid);
    break;
  case 'PUT':
    result = await updateProfile(context, uid);
    break;
  case 'DELETE':
    result = await deleteProfile(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Pull this user's corresponding profile data
  const profile = await profileStore.list(userId);
  if (profile) {
    profile.skills = await skillStore.list(userId);
  }

  if (!profile) {
    return createErrorResult(404, 'Profile data not found');
  }

  return createSuccessResult(200, profile);
}

async function createProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Build an initial profile
  const newProfile: Profile = {
    user: userId,
    roles: [],
    dietaryRestrictions: [],
    skills: [], // We're not adding any skills at this time
  };

  const profileData = await profileStore.create(newProfile);

  return createSuccessResult(201, profileData);
}

async function updateProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Pull this user's corresponding profile data
  const profile = await profileStore.list(userId);
  if (!profile) {
    return createErrorResult(404, 'Profile data not found');
  }

  const profileId = profile._id;
  const profileUpdate = context.req?.body;
  const skillsUpdate = profileUpdate?.skills as UserSkill[];
  delete profileUpdate?.skills;

  // Attempt profile update
  const profileUpdateResult = await profileStore.update(profileId, userId, profileUpdate);

  if (profileUpdateResult.nModified !== 1) {
    // Profile not found, status 404
    return createErrorResult(404, 'Profile data not found');
  }

  // Attempt skills update
  if (skillsUpdate) {
    // Here we need to handle both possible new skills and/or
    // updates to existing skills documents for this user.
    // We'll assume the existence of an _id in the skill object
    // means we're updating an existing user skill document.
    const newSkills: UserSkill[] = [];
    const existingSkills: UserSkill[] = [];

    skillsUpdate.forEach(({_id, code, level}) => {
      if (code && level !== undefined) {
        if (_id) {
          existingSkills.push({
            _id,
            user: userId,
            code,
            level
          });
        } else {
          newSkills.push({
            user: userId,
            code,
            level
          });
        }
      }
    });

    // Create and update data
    if (newSkills.length > 0) {
      await skillStore.createMany(userId, newSkills);
    }
    if (existingSkills.length > 0) {
      for (let i = 0; i < existingSkills.length; i++) {
        const s = existingSkills[i];
        await skillStore.update(s._id as any, userId, s);
      }
    }
  }

  // Acquire updated data
  const updatedProfile = await profileStore.list(userId);
  if (updatedProfile) {
    updatedProfile.skills = await skillStore.list(userId);
  }

  return createSuccessResult(200, updatedProfile);
}

async function deleteProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Pull this user's corresponding profile data
  const profile = await profileStore.list(userId);
  if (!profile) {
    // should this be an error?
    return createErrorResult(404, 'Profile data not found');
  }

  const profileId = profile._id;
  await profileStore.delete(profileId, userId);
  await skillStore.deleteAllForUser(userId);
  return createSuccessResult(202, null);
}

export default httpTrigger;