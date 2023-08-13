import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { programStore, userStore } from '../lib/models/store';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // get caller uid from token and connect to DB
  // eslint-disable-next-line prefer-const
  let { uid, result } = await checkAuthAndConnect(context, req);

  // result will be non-null if there was an error
  if (result) {
    context.res = result;
    return;
  }

  const includeEvents = !!req.query['includeEvents'];

  switch (req.method) {
  case 'GET':
    result = await getPrograms(context, uid, includeEvents);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getPrograms(context: Context, userIdent: string, includeEvents: boolean): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  const programs = await programStore.listAll(includeEvents);

  return createSuccessResult(200, programs, context);
}

export default httpTrigger;