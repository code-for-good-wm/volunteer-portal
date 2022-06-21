import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import '../firebase/init'; // Initialize the Firebase Admin SDK

import { decodeFirebaseToken } from '../helpers';

const AuthTest: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const contentType = 'application/json'; // JSON responses
  const logger = context.log;

  try {
    // Acquire access token from header
    const authorization = req.headers.authorization;
    let token = '';

    if (authorization) {
      const parts = authorization.split('Bearer ');
      token = parts[1];
    }

    if (!token) {
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

    // Verify JWT access token w/Firebase Admin SDK
    const decodedToken = await decodeFirebaseToken(token, logger);
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

    const { uid } = decodedToken;

    logger('Here is the ID of the Firebase user: ', uid);

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