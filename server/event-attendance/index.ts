import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { eventAttendanceStore } from '../lib/models/store';
import { checkAuthAndConnect, checkBindingDataUserId } from '../lib/helpers';

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
    result = await getEventAttendance(context, uid);
    break;
  case 'POST':
    result = await createEventAttendance(context, uid);
    break;
  case 'PUT':
    result = await updateEventAttendance(context, uid);
    break;
  case 'DELETE':
    result = await deleteEventAttendance(context, uid);
    break;
  }

  context.res = result;
};

async function getEventAttendance(context: Context, userIdent: string): Promise<Result> {
  // check that a user is accessing their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  const eventId = context.bindingData.eventId;

  // included an event ID so get the user's attendance for that specific event
  if (eventId) {
    const attendance = await eventAttendanceStore.listByUserAndEvent(userId, eventId);

    if (!attendance) {
      return createErrorResult(404, 'Event Attendance data not found', context);
    }
  
    return createSuccessResult(200, attendance, context);
  }

  const attendances = await eventAttendanceStore.listByUser(userId, []);

  if (!attendances) {
    return createErrorResult(404, 'Event Attendance data not found', context);
  }

  return createSuccessResult(200, attendances, context);
}

async function createEventAttendance(context: Context, userIdent: string): Promise<Result> {
  // check that a user is accessing their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  const eventId = context.bindingData.eventId;

  const attedanceCreate = context.req?.body;
  
  const attendance = await eventAttendanceStore.create(userId, eventId, attedanceCreate);

  return createSuccessResult(201, attendance, context);
}

async function updateEventAttendance(context: Context, userIdent: string): Promise<Result> {
  // check that a user is accessing their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  const eventId = context.bindingData.eventId;

  if (!eventId) {
    return createErrorResult(404, 'Event ID is required', context);
  }

  const attendance = await eventAttendanceStore.listByUserAndEvent(userId, eventId);

  if (!attendance) {
    // create a new attendance
    const newAttendance = await eventAttendanceStore.create(userId, eventId, context.req?.body);
    return createSuccessResult(201, newAttendance, context);
  }

  const attendanceUpdate = context.req?.body;

  attendance.attendance = attendanceUpdate.attendance;
  attendance.attendanceDetail = attendanceUpdate.attendanceDetail;
  attendance.roles = attendanceUpdate.roles;
  attendance.allocation = attendanceUpdate.allocation;

  const attendanceData = await eventAttendanceStore.update(attendance._id, userId, eventId, attendance);

  return createSuccessResult(200, attendanceData, context);
}

async function deleteEventAttendance(context: Context, userIdent: string): Promise<Result> {
  // check that a user is accessing their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;

  const eventId = context.bindingData.eventId;

  if (!eventId) {
    return createErrorResult(404, 'Event ID is required', context);
  }

  const attendance = await eventAttendanceStore.listByUserAndEvent(userId, eventId);

  if (!attendance) {
    return createErrorResult(404, 'Event Attendance not found', context);
  }

  await eventAttendanceStore.delete(attendance._id);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;