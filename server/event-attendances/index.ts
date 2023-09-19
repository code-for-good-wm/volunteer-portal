import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { eventAttendanceStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { READ_ALL_EVENTS } from '../lib/models/enums/user-role.enum';

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
    result = await getEventAttendances(context, uid);
    break;
  }

  context.res = result;
};

async function getEventAttendances(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can see all users
  if (!READ_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const eventId = context.bindingData.eventId;

  // included an event ID so get attendance for that specific event
  if (eventId) {
    const attendance = await eventAttendanceStore.list(eventId);

    if (!attendance) {
      return createErrorResult(404, 'Event Attendance data not found', context);
    }
  
    return createSuccessResult(200, attendance, context);
  }

  const attendances = await eventAttendanceStore.listAll();

  if (!attendances) {
    return createErrorResult(404, 'Event Attendance data not found', context);
  }

  return createSuccessResult(200, attendances, context);
}

export default httpTrigger;