import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import '../firebase/init'; // Initialize the Firebase Admin SDK

import { checkRequestAuth } from '../helpers';

const AuthTest: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const contentType = 'application/json'; // JSON responses
  const logger = context.log;

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken) {
      context.res = {
        status: 401,
        contentType,
        body: {
          'error' : {
            'code' : 401,
            'message' : 'Unauthorized'
          }
        },
      };
      return;
    }

    logger('Here is the full decoded token: ', decodedToken);

    context.res = {
      // Defaults to 200 status response
      contentType: 'application/json',
      body: {
        'success' : true
      }
    };
  } catch (error) {
    logger('An error occurred: ', error);
    context.res = {
      status: 500,
      contentType,
      body: {
        'error' : {
          'code' : 500,
          'message' : 'Internal error'
        }
      },
    };
  }
};

export default AuthTest;