
import { AzureFunction, Context, HttpRequest, Logger } from '@azure/functions';
import { createErrorResult, Result } from '../core';
import { connect, userStore } from '../models/store';
import { checkRequestAuth, sendTestEmail } from '../helpers';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const logger = context.log;

  // Attempt to capture caller information from token
  let uid = '';

  try {
    // Check access token from header
    const authorization = req.headers.authorization;
    const decodedToken = await checkRequestAuth(authorization, logger);

    if (!decodedToken?.uid) {
      context.res = createErrorResult(401, 'Unauthorized');
      return;
    }

    // Acquire caller Firebase ID from decoded token
    uid = decodedToken.uid;
  } catch (error) {
    logger('Authentication error: ', error);
    context.res = createErrorResult(500, 'Internal error');
    return;
  }

  try {
    // Connect to database
    await connect(logger);
  } catch (error) {
    logger('Database error: ', error);
    context.res = createErrorResult(500, 'Internal error');
    return;
  }

  let result: Result | null = null;

  // TODO: The method switch here may be redundant if we're
  // controlling the available methods via function.json
  switch (req.method) {
  case 'GET':
    result = createErrorResult(405, 'Method not allowed');
    break;
  case 'POST':
    result = await createEmail(context, uid, logger);
    break;
  case 'PUT':
    result = createErrorResult(405, 'Method not allowed');
    break;
  case 'DELETE':
    result = createErrorResult(405, 'Method not allowed');
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function createEmail(context: Context, userIdent: string, logger: Logger): Promise<Result> {
  // Attempt to acquire user data from userIdent
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found');
  }

  // Acquire user ID from binding data
  const userId = context.bindingData.userId;
  if (!userId) {
    return createErrorResult(400, 'Missing required parameter');
  }

  // Compare; if requestor and userId are not the same, return error
  // IMPORTANT: We're ignoring type here; the _id field is technically an object
  if (userId != user._id) {
    return createErrorResult(403, 'Forbidden');
  }

  // Acquire template ID from binding data
  const templateId = context.bindingData.templateId;
  if (!templateId) {
    return createErrorResult(400, 'Missing required parameter');
  }

  // Acquire email for his user
  const recipientEmail = user.email;

  // Get template data from request body
  const templateData = context.req?.body ?? {};

  const result = await sendTestEmail(recipientEmail, logger);

  return result;
}

export default httpTrigger;