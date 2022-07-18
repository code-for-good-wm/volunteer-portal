import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { checkRequestAuth } from '../helpers';

const AuthTest: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Set return value to JSON
  context.res = {
    header: {
      'Content-Type': 'application/json'
    }
  };

  console.log('Request: ', req);

  try {
    // Check access token from header
    console.log('Request: ', req);
    
    const authorization = req.headers['x-firebase-auth'];
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken) {
      context.res.status = 401;
      context.res.body = {
        'error' : {
          'code' : 401,
          'message' : 'Unauthorized'
        },
        'trace_id' : context.invocationId
      };
      return;
    }

    logger('Here is the full decoded token: ', decodedToken);

    context.res.status = 200; // This should be a default
    context.res.body = {
      'success' : true,
      'trace_id' : context.invocationId
    };
  } catch (error) {
    logger('An error occurred: ', error);
    context.res.status = 500;
    context.res.body = {
      'error' : {
        'code' : 500,
        'message' : 'Internal error'
      },
      'trace_id' : context.invocationId
    };
  }
};

export default AuthTest;