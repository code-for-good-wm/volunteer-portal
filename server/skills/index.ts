import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result, tryGetUserIdent } from '../core';
import { connect, skillStore } from '../models/store'
import { User } from '../models/user';
import { UserSkill, UserSkillModel } from '../models/user-skill';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  // set return value to JSON
  context.res = {
    header: {
        "Content-Type": "application/json"
    }
  }

  // TODO uncomment to support user id checks
  let { userIdent, status } = { userIdent: 'example', status: 200 }
  // const { userIdent, status } = tryGetUserIdent(req, context);
  context.res.status = status;
  if (context.res.status !== 200) {
    return;
  }

  await connect(context.log);

  let result: Result | null = null;

  switch (req.method) {
    case 'GET':
      result = await getUserSkills(context, userIdent);
      break;
    case 'POST':
      result = await createUserSkills(context, userIdent);
      break;
    case 'PUT':
      result = await updateUserSkills(context, userIdent);
      break;
    case 'DELETE':
      result = await deleteUserSkills(context, userIdent);
      break;
  }

  if (result) {
    context.res.status = result.status;
    context.res.body = result.body;
  }
};

async function getUserSkills(context: Context, userIdent: string): Promise<Result> {
  const userId = context.bindingData.userId;
  const skillCode = context.bindingData.skillCode;

  // TODO: confirm userId == userIdent provided

  let userSkills = await skillStore.list(userId);

  // Filter by provided code
  if (skillCode) {
    userSkills = userSkills.filter(s => s.code === skillCode);
  }

  return { body: userSkills, status: 200 };
}

async function createUserSkills(context: Context, userIdent: string): Promise<Result> {
  let skills = context.req?.body;

  const userId = context.bindingData.userId;
  // TODO: confirm userId == userIdent provided

  // parse the body as either a single or array of skills
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
      return { body: { error: "Unable to parse UserSkill array" }, status: 400 };
    }

    return { body: await skillStore.createMany(userId, newSkills), status: 201 };
  }

  // treat as a single skill
  const {code, level} = skills;

  if (code === undefined || level === undefined) {
    return { body: { error: "Unable to parse UserSkill" }, status: 400 };
  }

  return { body: await skillStore.create(userId, { user: userId, code, level}), status: 201 };
}

async function updateUserSkills(context: Context, userIdent: string): Promise<Result> {
  let skills = context.req?.body;

  const userId = context.bindingData.userId;
  // TODO: confirm userId == userIdent provided

  const newSkills: UserSkill[] = [];

  // parse the body as either a single or array of skills
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

    if (newSkills.length === 0) {
      return { body: { error: "Unable to parse UserSkill array" }, status: 400 };
    }
  } else {
    // treat as a single skill
    const {_id, code, level} = skills;

    if (!_id || !code || level === undefined) {
      return { body: { error: "Unable to parse UserSkill" }, status: 400 };
    }

    newSkills.push({
      _id,
      user: userId,
      code,
      level
    } as UserSkill);
  }

  const updatedSkills: UserSkill[] = [];
  newSkills.forEach(async (s) => {
    const updateResult = await skillStore.update(s._id as any, userId, s);
    if (updateResult.nModified === 1) {
      updatedSkills.push(s);
    }
  })

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