
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, Result } from '../core';
import { userStore } from '../models/store';
import { checkAuthAndConnect, sendTemplateEmail } from '../helpers';

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
  case 'POST':
    result = await createEmail(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function createEmail(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire user data from userIdent
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // Acquire user ID from binding data
  const userId = context.bindingData.userId;
  if (!userId) {
    return createErrorResult(400, 'Missing required parameter', context);
  }

  // Compare; if requestor and userId are not the same, return error
  // IMPORTANT: We're ignoring type here; the _id field is technically an object
  if (userId != user._id) {
    return createErrorResult(403, 'Forbidden', context);
  }

  // Acquire template ID from binding data
  const templateId = context.bindingData.templateId;
  if (!templateId) {
    return createErrorResult(400, 'Missing required parameter', context);
  }

  // Acquire email for his user
  const recipientEmail = user.email;

  // Get template data from request body
  const templateData = context.req?.body ?? {};

  // const result = await sendTestEmail(recipientEmail, context);
  const result = await sendTemplateEmail(recipientEmail, templateId, templateData, context);

  return result;
}

export default httpTrigger;