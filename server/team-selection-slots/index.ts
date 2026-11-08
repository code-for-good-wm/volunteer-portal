import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { projectStore, slotStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { READ_TEAM_SELECTION } from '../lib/models/enums/user-role.enum';
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
      result = await getSlotsByRole(context, uid);
      break;
  }

  context.res = result;
};

/** Every slot on the project (assigned or not), grouped by position role */
async function getSlotsByRole(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can run team selection
  if (!READ_TEAM_SELECTION.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  const project = projectId ? await projectStore.list(projectId) : null;
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  const slots = await slotStore.listByProject(projectId);

  const slotsByRole: Record<string, unknown[]> = {};
  for (const slot of slots) {
    const role = (slot.position as unknown as IPosition).role;
    (slotsByRole[role] ??= []).push(slot);
  }

  return createSuccessResult(200, slotsByRole, context);
}

export default httpTrigger;
