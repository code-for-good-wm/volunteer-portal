import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { eventStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect, tryParseDateToISO } from '../lib/helpers';
import { EDIT_ALL_EVENTS } from '../lib/models/enums/user-role.enum';

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
    result = await getEvent(context);
    break;
  case 'POST':
    result = await createEvent(context, uid);
    break;
  case 'PUT':
    result = await updateEvent(context, uid);
    break;
  case 'DELETE':
    result = await deleteEvent(context, uid);
    break;
  }

  context.res = result;
};

async function getEvent(context: Context): Promise<Result> {
  const eventId = context.bindingData.eventId;
  if (!eventId) {
    return createErrorResult(404, 'Event ID not found', context);
  }

  const event = await eventStore.list(eventId);

  if (!event) {
    return createErrorResult(404, 'Event not found', context);
  }

  return createSuccessResult(200, event, context);
}

async function createEvent(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can create events
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const eventCreate = context.req?.body;

  // convert dates, if present
  if (eventCreate.startDate) {
    eventCreate.startDate = tryParseDateToISO(eventCreate.startDate);
  }
  if (eventCreate.endDate) {
    eventCreate.endDate = tryParseDateToISO(eventCreate.endDate);
  }
  
  const eventData = await eventStore.create(eventCreate);

  return createSuccessResult(201, eventData, context);
}

async function updateEvent(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can update events
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const eventId = context.bindingData.eventId;
  if (!eventId) {
    return createErrorResult(404, 'Event ID not found', context);
  }

  const event = await eventStore.list(eventId);
  if (!event) {
    return createErrorResult(404, 'Event not found', context);
  }

  const eventUpdate = context.req?.body;

  // convert dates, if present
  if (eventUpdate.startDate) {
    eventUpdate.startDate = tryParseDateToISO(eventUpdate.startDate);
  }
  if (eventUpdate.endDate) {
    eventUpdate.endDate = tryParseDateToISO(eventUpdate.endDate);
  }

  const eventData = await eventStore.update(eventId, eventUpdate);

  return createSuccessResult(200, eventData, context);
}

async function deleteEvent(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can delete events
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const eventId = context.bindingData.eventId;
  if (!eventId) {
    return createErrorResult(404, 'Event ID not found', context);
  }

  const event = await eventStore.list(eventId);
  if (!event) {
    return createErrorResult(404, 'Event not found', context);
  }

  await eventStore.delete(eventId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;