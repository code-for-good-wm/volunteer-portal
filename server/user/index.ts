import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result } from '../core';
import { checkRequestAuth } from '../helpers';
import { connect, userStore } from '../models/store'
import { User } from '../models/user';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Set return value to JSON
  context.res = {
    header: {
      'Content-Type': 'application/json'
    }
  };

  let email = '';
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken) {
      context.res.status = 401;
      context.res.body = {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        }
      };
      return;
    }

    // Acquire user email and Firebase ID from decoded token
    email = decodedToken.email ?? '';
    uid = decodedToken.uid;
  } catch (error) {
    logger('Authentication error: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      }
    };
    return;
  }

  try {
    // Connect to database
    await connect(logger);
  } catch (error) {
    logger('Database error: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      }
    };
    return;
  }

  let result: Result | null = null;

  switch (req.method) {
  case 'GET':
    result = await getUser(uid);
    break;
  case 'POST':
    result = await createUser(email, uid);
    break;
  case 'PUT':
    result = await updateUser(context, uid);
    break;
  case 'DELETE':
    result = await deleteUser(context, uid);
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

async function createUser(email: string, userIdent: string): Promise<Result> {
  // Build new user
  const newUser: User = {
    ident: userIdent,
    authProvider: 'firebase',
    name: '',
    email,
  };
  const userData = await userStore.create(newUser);
  return { body: userData, status: 201 };
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