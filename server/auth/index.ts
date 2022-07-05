import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import '../firebase/init'; // Initialize the Firebase Admin SDK

import { checkRequestAuth } from '../helpers';

const AuthTest: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Set return value to JSON
  context.res = {
    header: {
      'Content-Type': 'application/json'
    }
  };

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

    logger('Here is the full decoded token: ', decodedToken);

    context.res.status = 200; // This should be a default
    context.res.body = {
      'success' : true
    };
  } catch (error) {
    logger('An error occurred: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      }
    };
  }
};

export default AuthTest;