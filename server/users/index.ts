import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { userStore } from '../lib/models/store';
import { READ_ALL_USERS } from '../lib/models/enums/user-role.enum';

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
    result = await getUsers(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getUsers(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can see all users
  if (!READ_ALL_USERS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const users = await userStore.listAll();

  return createSuccessResult(200, users, context);
}

export default httpTrigger;