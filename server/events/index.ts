import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { eventStore, userStore } from '../lib/models/store';
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
    result = await getEvents(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getEvents(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  const showAll = context.bindingData.all ? true : false; // Optional

  // only board / admins can see all events
  if (showAll && !READ_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const events = await (showAll ? eventStore.listAll() : eventStore.upcoming());

  return createSuccessResult(200, events, context);
}

export default httpTrigger;