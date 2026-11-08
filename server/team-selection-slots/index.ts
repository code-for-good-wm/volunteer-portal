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

  const user = await userStore.list(uid);
  if (!user) {
    context.res = createErrorResult(404, 'User not found', context);
    return;
  }

  // only board / admins can run team selection
  if (!READ_TEAM_SELECTION.includes(user.userRole)) {
    context.res = createErrorResult(403, 'Forbidden', context);
    return;
  }

  const projectId = context.bindingData.projectId;
  const project = projectId ? await projectStore.list(projectId) : null;
  if (!project) {
    context.res = createErrorResult(404, 'Project not found', context);
    return;
  }

  switch (req.method) {
    case 'GET':
      result = await getSlotsByRole(context);
      break;
  }

  context.res = result;
};

/** Every slot on the project (assigned or not), grouped by position role */
async function getSlotsByRole(context: Context): Promise<IHttpResult> {
  const slots = await slotStore.listByProject(context.bindingData.projectId);

  const slotsByRole: Record<string, unknown[]> = {};
  for (const slot of slots) {
    const role = (slot.position as unknown as IPosition).role;
    (slotsByRole[role] ??= []).push(slot);
  }

  return createSuccessResult(200, slotsByRole, context);
}

export default httpTrigger;
