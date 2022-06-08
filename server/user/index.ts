import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result, tryGetUserIdent } from '../core';
import { connect, userStore } from '../models/store'
import { User } from '../models/user';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  // set return value to JSON
  context.res = {
    header: {
        "Content-Type": "application/json"
    }
  }

  // TODO uncomment to support user id checks
  let { userIdent, status } = { userIdent: 'example', status: 200 }
  // const { userIdent, status } = tryGetUserIdent(req, context);
  context.res.status = status;
  if (context.res.status !== 200) {
    return;
  }

  await connect(context.log);

  let result: Result | null = null;

  switch (req.method) {
    case 'GET':
      result = await getUser(userIdent);
      break;
    case 'POST':
      result = await createUser(context, userIdent);
      break;
    case 'PUT':
      result = await updateUser(context, userIdent);
      break;
    case 'DELETE':
      result = await deleteUser(context, userIdent);
      break;
  }

  if (result) {
    context.res.status = result.status;
    context.res.body = result.body;
  }
};

async function getUser(userIdent: string): Promise<Result> {
  const user = await userStore.list(userIdent);
  return { body: user, status: user ? 200 : 404 };
}

async function createUser(context: Context, userIdent: string): Promise<Result> {
  let user = context.req?.body;
  user.ident = userIdent;
  user = await userStore.create(user);
  return { body: user, status: 201 };
}

async function updateUser(context: Context, userIdent: string): Promise<Result> {
  let user = context.req?.body;
  const userId = context.bindingData.userId;
  user.ident = userIdent;
  const result = await userStore.update(userId, userIdent, user);
  if (result.nModified === 1) {
    // User was updated
    return { body: user, status: 200 };
  } else {
    // User not found, status 404
    return { body: null, status: 404 };
  }
}

async function deleteUser(context: Context, userIdent: string): Promise<Result> {
  const userId = context.bindingData.userId;
  await userStore.delete(userId, userIdent);
  return { body: null, status: 202 };
}

export default httpTrigger;