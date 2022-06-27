import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result, tryGetUserIdent } from '../core';
import { checkBindingDataUserId } from '../helpers';
import { connect, skillStore } from '../models/store'
import { User } from '../models/user';
import { UserSkill, UserSkillModel } from '../models/user-skill';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Set return value to JSON
  context.res = {
    header: {
      'Content-Type': 'application/json'
    }
  };

  // Attempt to capture caller information from token
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken?.uid) {
      context.res.status = 401;
      context.res.body = {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        }
      };
      return;
    }

    // Acquire caller Firebase ID from decoded token
    uid = decodedToken.uid;
  } catch (error) {
    logger('Authentication error: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      }
    };
    return;
  }

  try {
    // Connect to database
    await connect(logger);
  } catch (error) {
    logger('Database error: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      }
    };
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
    context.res.status = result.status;
    context.res.body = result.body;
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

  return { body: userSkills, status: 200 };
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
      return { 
        body: { 
          'error' : {
            'code' : 400,
            'message' : 'Skill data missing expected properties'
          }
        }, 
        status: 400 
      };
    }

    await skillStore.createMany(userId, newSkills);

    return { body: await skillStore.createMany(userId, newSkills), status: 201 };
  }

  // Treat as a single skill
  const {code, level} = skills;

  if (!code || level === undefined) {
    return { 
      body: { 
        'error' : {
          'code' : 400,
          'message' : 'Skill data missing expected properties'
        }
      }, 
      status: 400 
    };
  }

  const newSkill = {
    user: userId,
    code,
    level,
  };

  return { body: await skillStore.create(userId, newSkill), status: 201 };
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
    const {_id, code, level} = skills;

    newSkills.push({
      _id,
      user: userId,
      code,
      level
    } as UserSkill);
  }

  if (newSkills.length === 0) {
    return { 
      body: { 
        'error' : {
          'code' : 400,
          'message' : 'Skill data missing expected properties'
        }
      }, 
      status: 400 
    };
  }

  // Attempt updates
  const updatedSkills: UserSkill[] = [];

  newSkills.forEach(async (s) => {
    const updateResult = await skillStore.update(s._id as any, userId, s);
    if (updateResult.nModified === 1) {
      updatedSkills.push(s);
    }
  });

  return { body: updatedSkills, status: updatedSkills.length > 0 ? 201 : 404 };
}

async function deleteUserSkills(context: Context, userIdent: string): Promise<Result> {
  const userId = context.bindingData.userId;
  const skillCode = context.bindingData.skillCode;
  const { _id } = context.req?.body;

  if (_id) {
    await skillStore.delete(_id, userId);
  } else if (skillCode)  {
    await skillStore.deleteByCode(userId, skillCode);
  } else {
    await skillStore.deleteAllForUser(userId);
  }
  
  return { body: null, status: 202 };
}

export default httpTrigger;