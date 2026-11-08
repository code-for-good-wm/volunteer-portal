import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { positionStore, projectStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { EDIT_ALL_POSITIONS } from '../lib/models/enums/user-role.enum';
import { Role } from '../lib/models/enums/role.enum';
import { IPosition } from '../lib/models/position';

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

  const body = context.req?.body ?? {};
  const validationError = validatePosition(body);
  if (validationError) {
    return createErrorResult(400, validationError, context);
  }

  if (await hasRoleConflict(projectId, body.role)) {
    return createErrorResult(409, roleConflictMessage(body.role), context);
  }

  const positionData = await positionStore.create({
    project: projectId,
    role: body.role,
    slotCount: body.slotCount,
    notes: body.notes,
  });

  return createSuccessResult(201, positionData, context);
}

const MAX_SLOT_COUNT = 100;

// Returns an error message when the body can't become a position, or null if it's valid.
function validatePosition(body: Partial<IPosition>): string | null {
  if (!body.role || !Object.values(Role).includes(body.role)) {
    return `role must be one of: ${Object.values(Role).join(', ')}`;
  }
  if (
    !Number.isInteger(body.slotCount) ||
    (body.slotCount as number) < 1 ||
    (body.slotCount as number) > MAX_SLOT_COUNT
  ) {
    return `slotCount must be a whole number from 1 to ${MAX_SLOT_COUNT}`;
  }
  return null;
}

// A project has at most one position per role; change its count instead.
async function hasRoleConflict(
  projectId: Parameters<typeof positionStore.listByProject>[0],
  role: Role,
  ignorePositionId?: string,
): Promise<boolean> {
  const positions = await positionStore.listByProject(projectId);
  return positions.some(
    (p) => p.role === role && String(p._id) !== String(ignorePositionId),
  );
}

const roleConflictMessage = (role: Role) =>
  `This project already has a ${role} position. Edit that position to change how many people it needs.`;

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

  const body = context.req?.body ?? {};
  const validationError = validatePosition(body);
  if (validationError) {
    return createErrorResult(400, validationError, context);
  }

  if (await hasRoleConflict(projectId, body.role, positionId)) {
    return createErrorResult(409, roleConflictMessage(body.role), context);
  }

  // Only open slots can be removed, so a position can't shrink below the
  // number of slots that are invited or filled.
  const removeCount = position.slotCount - body.slotCount;
  if (removeCount > 0) {
    const removable = await positionStore.countRemovableSlots(positionId);
    if (removable < removeCount) {
      const minimum = position.slotCount - removable;
      return createErrorResult(
        400,
        `This position has people invited or confirmed, so it needs at least ${minimum} ${minimum === 1 ? 'slot' : 'slots'}.`,
        context,
      );
    }
  }

  const positionData = await positionStore.update(positionId, {
    project: projectId,
    role: body.role,
    slotCount: body.slotCount,
    notes: body.notes,
  });

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

  // Same rule as shrinking a position: never remove slots people are in.
  const locked = await positionStore.countLockedSlots(positionId);
  if (locked > 0) {
    return createErrorResult(
      409,
      `This position has ${locked} ${locked === 1 ? 'person' : 'people'} invited or confirmed, so it can't be deleted.`,
      context,
    );
  }

  await positionStore.delete(positionId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
