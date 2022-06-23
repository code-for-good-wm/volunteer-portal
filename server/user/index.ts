import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result } from '../core';
import { checkRequestAuth } from '../helpers';
import { connect, userStore } from '../models/store';
import { User } from '../models/user';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Set return value to JSON
  context.res = {
    header: {
      'Content-Type': 'application/json'
    }
  };

  // Attempt to capture caller information from token
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken?.uid) {
      context.res.status = 401;
      context.res.body = {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        }
      };
      return;
    }

    // Acquire caller Firebase ID from decoded token
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
    result = await createUser(context, uid);
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
  const body = user ?? {
    'code' : 404,
    'message' : 'User not found'
  };

  return { body, status: user ? 200 : 404 };
}

async function createUser(context: Context, userIdent: string): Promise<Result> {
  // Check to see if this user already exists; if so, return error
  const user = await userStore.list(userIdent);
  if (user) {
    return {
      body: {
        'error' : {
          'code' : 400,
          'message' : 'User document already exists'
        }
      },
      status: 400,
    };
  }

  // Build new user
  const email = context.req?.body?.email ?? '';
  if (!email) {
    return {
      body: {
        'error' : {
          'code' : 400,
          'message' : 'Missing required parameters'
        }
      },
      status: 400,
    };
  }

  const newUser: User = {
    ident: userIdent,
    authProvider: 'firebase',
    name: '',
    phone: '',
    email,
  };

  const userData = await userStore.create(newUser);
  return { body: userData, status: 201 };
}

async function updateUser(context: Context, userIdent: string): Promise<Result> {
  // Verify we're updating this user's information
  const user = await userStore.list(userIdent);
  if (!user) {
    return {
      body: {
        'error' : {
          'code' : 404,
          'message' : 'User not found'
        }
      },
      status: 404,
    };
  }

  if (user.ident !== userIdent) {
    return {
      body: {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        }
      },
      status: 401,
    };
  }

  // Move forward with update
  const update = context.req?.body;
  const userId = context.bindingData.userId;
  const result = await userStore.update(userId, userIdent, update);

  if (result.nModified === 1) {
    // User was updated
    return { 
      body: { 
        ...user, 
        ...update 
      }, 
      status: 200,
    };
  } else {
    // User not found, status 404
    return {
      body: {
        'error' : {
          'code' : 404,
          'message' : 'User not found'
        }
      },
      status: 404,
    };
  }
}

async function deleteUser(context: Context, userIdent: string): Promise<Result> {
  // Verify we're deleting the current user's data
  const user = await userStore.list(userIdent);
  if (!user) {
    return {
      body: {
        'error' : {
          'code' : 404,
          'message' : 'User not found'
        }
      },
      status: 404,
    };
  }

  if (user.ident !== userIdent) {
    return {
      body: {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        }
      },
      status: 401,
    };
  }

  const userId = context.bindingData.userId;
  await userStore.delete(userId, userIdent);
  return { body: null, status: 202 };
}

export default httpTrigger;