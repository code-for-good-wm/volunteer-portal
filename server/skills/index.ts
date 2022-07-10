import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Types } from 'mongoose';
import { createErrorResult, createSuccessResult, Result } from '../core';
import { checkBindingDataUserId, checkRequestAuth } from '../helpers';
import { connect, skillStore } from '../models/store';
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
    result = await getUserSkills(context, uid);
    break;
  case 'POST':
    result = await createUserSkills(context, uid);
    break;
  case 'PUT':
    result = await updateUserSkills(context, uid);
    break;
  case 'DELETE':
    result = await deleteUserSkills(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getUserSkills(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;
  const skillCode = context.bindingData.skillCode; // Optional

  let userSkills = await skillStore.list(userId);

  // Filter by provided code
  if (skillCode) {
    userSkills = userSkills.filter(s => s.code === skillCode);
  }

  return createSuccessResult(200, userSkills);
}

async function createUserSkills(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;
  const skills = context.req?.body; // Could be a single skill object or an array of user skills

  if (Array.isArray(skills)) {
    const newSkills = skills
      .filter(({code, level}) => code && level !== undefined)
      .map(({code, level}) => {
        return {
          user: userId,
          code,
          level
        } as UserSkill;
      });

    if (newSkills.length === 0) {
      return createErrorResult(400, 'Skill data missing expected properties');
    }

    return createSuccessResult(201, await skillStore.createMany(userId, newSkills));
  }

  // Treat as a single skill
  const code = skills?.code;
  const level = skills?.level;

  if (!code || level === undefined) {
    return createErrorResult(400, 'Skill data missing expected properties');
  }

  const newSkill = {
    user: userId,
    code,
    level,
  };

  return createSuccessResult(201, await skillStore.create(userId, newSkill));
}

async function updateUserSkills(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;
  const skills = context.req?.body; // Could be a single skill object or an array of user skills

  const newSkills: UserSkill[] = [];

  // This method assumes we're updating existing skills;
  // if _id is not included, discard the data
  if (Array.isArray(skills)) {
    skills
      .filter(({_id, code, level}) => _id && code && level !== undefined)
      .forEach(({_id, code, level}) => {
        newSkills.push({
          _id,
          user: userId,
          code,
          level
        } as UserSkill);
      });
  } else {
    // Treat as a single skill
    if (skills?._id && skills?.code && skills?.level) {
      const {_id, code, level} = skills;

      newSkills.push({
        _id,
        user: userId,
        code,
        level
      } as UserSkill);
    }
  }

  if (newSkills.length === 0) {
    return createErrorResult(400, 'Skill data missing expected properties');
  }

  // Attempt updates
  const updatedSkills: UserSkill[] = [];

  for (let i = 0; i < newSkills.length; i++) {
    const s = newSkills[i];
    const updateResult = await skillStore.update(s._id as Types.ObjectId, userId, s);
    if (updateResult.nModified === 1) {
      updatedSkills.push(s);
    }
  }

  if (updatedSkills.length === 0) {
    return createErrorResult(404, 'No skills to update');
  }

  return createSuccessResult(201, updatedSkills);
}

async function deleteUserSkills(context: Context, userIdent: string): Promise<Result> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }
  
  const userId = checkResult.body._id;
  const skillCode = context.bindingData.skillCode;
  const skillId = context.req?.body?._id;

  // This endpoint allows us to 1) delete by skill ID,
  // 2) delete by skill code, or 3) delete all skills for a user.
  if (skillId) {
    await skillStore.delete(skillId, userId); // Remove a specific skill document
  } else if (skillCode)  {
    await skillStore.deleteByCode(userId, skillCode); // Remove all skills with passed skill code
  } else {
    await skillStore.deleteAllForUser(userId); // Remove all skill documents for user
  }
  
  return createSuccessResult(202, null);
}

export default httpTrigger;