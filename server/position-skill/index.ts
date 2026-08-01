import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import {
  positionSkillStore,
  positionStore,
  userStore,
} from '../lib/models/store';
import { EDIT_ALL_POSITIONS } from '../lib/models/enums/user-role.enum';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
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
      result = await getPositionSkills(context);
      break;
    case 'POST':
      result = await createPositionSkill(context, uid);
      break;
    case 'PUT':
      result = await updatePositionSkill(context, uid);
      break;
    case 'DELETE':
      result = await deletePositionSkill(context, uid);
      break;
  }

  if (result) {
    context.res = result;
  }
};

async function getPositionSkills(context: Context): Promise<IHttpResult> {
  const positionId = context.bindingData.positionId;
  if (!positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const skillCode = context.bindingData.skillCode; // Optional

  let positionSkills = await positionSkillStore.listByPosition(positionId);

  if (skillCode) {
    positionSkills = positionSkills.filter((s) => s.code === skillCode);
  }

  return createSuccessResult(200, positionSkills, context);
}

async function createPositionSkill(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can define required skills for a position
  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const positionId = context.bindingData.positionId;
  if (!positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const position = await positionStore.list(positionId);
  if (!position) {
    return createErrorResult(404, 'Position not found', context);
  }

  const { code, minimumLevel, importance } = context.req?.body ?? {};
  if (!code || minimumLevel === undefined || !importance) {
    return createErrorResult(
      400,
      'Position skill data missing expected properties',
      context,
    );
  }

  const positionSkillData = await positionSkillStore.create(positionId, {
    position: positionId,
    code,
    minimumLevel,
    importance,
  });

  return createSuccessResult(201, positionSkillData, context);
}

async function updatePositionSkill(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const positionId = context.bindingData.positionId;
  if (!positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const { _id, code, minimumLevel, importance } = context.req?.body ?? {};
  if (!_id || !code || minimumLevel === undefined || !importance) {
    return createErrorResult(
      400,
      'Position skill data missing expected properties',
      context,
    );
  }

  const updateResult = await positionSkillStore.update(_id, positionId, {
    position: positionId,
    code,
    minimumLevel,
    importance,
  });
  if (!updateResult || updateResult.modifiedCount !== 1) {
    return createErrorResult(404, 'Position skill not found', context);
  }

  return createSuccessResult(
    200,
    { _id, position: positionId, code, minimumLevel, importance },
    context,
  );
}

async function deletePositionSkill(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const positionId = context.bindingData.positionId;
  if (!positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const skillCode = context.bindingData.skillCode;
  const skillId = context.req?.body?._id;

  if (skillId) {
    await positionSkillStore.delete(skillId, positionId);
  } else if (skillCode) {
    await positionSkillStore.deleteByCode(positionId, skillCode);
  } else {
    return createErrorResult(400, 'Missing skill identifier', context);
  }

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
