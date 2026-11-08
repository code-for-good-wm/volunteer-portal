import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import {
  eventAttendanceStore,
  projectStore,
  userStore,
} from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { READ_TEAM_SELECTION } from '../lib/models/enums/user-role.enum';
import { Role } from '../lib/models/enums/role.enum';

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
      result = await getAttendeesByRole(context, req, uid);
      break;
  }

  context.res = result;
};

/**
 * Attendees of the project's event (anyone not marked not-attending), grouped
 * by the roles they signed up for. An attendee with several roles appears
 * under each of them. The optional `role` query param limits the result to
 * that one role.
 */
async function getAttendeesByRole(
  context: Context,
  req: HttpRequest,
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

  const roleFilter = req.query?.['role']; // Optional
  if (roleFilter && !Object.values(Role).includes(roleFilter as Role)) {
    return createErrorResult(400, `Invalid role: ${roleFilter}`, context);
  }

  const projectId = context.bindingData.projectId;
  const project = projectId ? await projectStore.list(projectId) : null;
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  if (!project.event) {
    return createErrorResult(
      400,
      'Project is not assigned to an event',
      context,
    );
  }

  const attendances = await eventAttendanceStore.listAttendeesByEvent(
    project.event,
  );

  const attendeesByRole: Record<string, unknown[]> = {};
  for (const attendance of attendances) {
    for (const role of attendance.roles) {
      if (roleFilter && role !== roleFilter) {
        continue;
      }
      (attendeesByRole[role] ??= []).push(attendance);
    }
  }

  return createSuccessResult(200, attendeesByRole, context);
}

export default httpTrigger;
