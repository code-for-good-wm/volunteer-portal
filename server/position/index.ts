import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { positionStore, projectStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
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
      result = await getPositions(context);
      break;
    case 'POST':
      result = await createPosition(context, uid);
      break;
    case 'PUT':
      result = await updatePosition(context, uid);
      break;
    case 'DELETE':
      result = await deletePosition(context, uid);
      break;
  }

  context.res = result;
};

async function getPositions(context: Context): Promise<IHttpResult> {
  const projectId = context.bindingData.projectId;
  if (!projectId) {
    return createErrorResult(404, 'Project not found', context);
  }

  const positionId = context.bindingData.positionId; // Optional

  if (positionId) {
    const position = await positionStore.list(positionId);
    if (!position || String(position.project) !== String(projectId)) {
      return createErrorResult(404, 'Position not found', context);
    }
    return createSuccessResult(200, position, context);
  }

  const positions = await positionStore.listByProject(projectId);
  return createSuccessResult(200, positions, context);
}

async function createPosition(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can create positions
  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  if (!projectId) {
    return createErrorResult(404, 'Project not found', context);
  }

  const project = await projectStore.list(projectId);
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  const positionCreate = context.req?.body;
  positionCreate.project = projectId;

  const positionData = await positionStore.create(positionCreate);

  return createSuccessResult(201, positionData, context);
}

async function updatePosition(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can update positions
  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  const positionId = context.bindingData.positionId;
  if (!projectId || !positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const position = await positionStore.list(positionId);
  if (!position || String(position.project) !== String(projectId)) {
    return createErrorResult(404, 'Position not found', context);
  }

  const positionUpdate = context.req?.body;
  positionUpdate.project = projectId;

  const positionData = await positionStore.update(positionId, positionUpdate);

  return createSuccessResult(200, positionData, context);
}

async function deletePosition(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can delete positions
  if (!EDIT_ALL_POSITIONS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  const positionId = context.bindingData.positionId;
  if (!projectId || !positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const position = await positionStore.list(positionId);
  if (!position || String(position.project) !== String(projectId)) {
    return createErrorResult(404, 'Position not found', context);
  }

  await positionStore.delete(positionId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
