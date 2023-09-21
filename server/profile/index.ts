import * as mongoose from 'mongoose';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { profileStore, skillStore } from '../lib/models/store';
import { IProfile } from '../lib/models/profile';
import { checkBindingDataUserId, checkAuthAndConnect } from '../lib/helpers';
import { IUserSkill } from '../lib/models/user-skill';
import { Types } from 'mongoose';

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

  context.res = result;
};

async function getProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Pull this user's corresponding profile & skills data
  const [profile, skills] = await Promise.all([profileStore.list(userId), skillStore.list(userId)]);
  if (profile) {
    profile.skills.push(...skills);
  } 

  if (!profile) {
    return createErrorResult(404, 'Profile data not found', context);
  }

  return createSuccessResult(200, profile, context);
}

async function createProfile(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  // Build an initial profile
  const newProfile: IProfile = {
    user: userId,
    roles: [],
    dietaryRestrictions: [],
    skills: new mongoose.Types.DocumentArray<IUserSkill>([]), // We're not adding any skills at this time
  };

  const profileData = await profileStore.create(newProfile);

  return createSuccessResult(201, profileData, context);
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
    return createErrorResult(404, 'Profile data not found', context);
  }

  const profileId = profile._id;
  const profileUpdate = context.req?.body;
  const skillsUpdate = profileUpdate?.skills as IUserSkill[];
  delete profileUpdate?.skills;

  // Attempt profile update
  const profileUpdateResult = await profileStore.update(profileId, userId, profileUpdate);

  if (profileUpdateResult.modifiedCount !== 1) {
    // Profile not found, status 404
    return createErrorResult(404, 'Profile data not found', context);
  }

  // Attempt skills update
  if (skillsUpdate) {
    // Here we need to handle both possible new skills and/or
    // updates to existing skills documents for this user.
    // We'll get the current known skills to see if we need to update any.
    const skills = await skillStore.list(userId);

    // Create a dictionary for easy lookup
    const existing = new Map(skills.map(s => [s.code, s]));
    // Targets for new / updated skills
    const newSkills: IUserSkill[] = [];
    const existingSkills: IUserSkill[] = [];

    skillsUpdate.forEach(({code, level}) => {
      if (code && level !== undefined) {
        if (existing.has(code)) {
          const s = existing.get(code);
          existingSkills.push({
            _id: s?._id,
            user: userId,
            code: s?.code,
            level
          } as IUserSkill);
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
      const updates = existingSkills.map(s => skillStore.update(s._id as Types.ObjectId, userId, s));
      await Promise.all(updates);
    }
  }

  // Acquire updated data
  const [updatedProfile, updatedSkills] = await Promise.all([profileStore.list(userId), skillStore.list(userId)]);
  if (updatedProfile) {
    updatedProfile.skills.push(...updatedSkills);
  } 
  return createSuccessResult(200, updatedProfile, context);
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
    return createErrorResult(404, 'Profile data not found', context);
  }

  const profileId = profile._id;
  await profileStore.delete(profileId, userId);
  await skillStore.deleteAllForUser(userId);
  return createSuccessResult(202, null, context);
}

export default httpTrigger;