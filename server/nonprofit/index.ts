import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, IHttpResult } from '../lib/core';
import { nonprofitStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { EDIT_ALL_NONPROFITS, READ_NONPROFIT_PII } from '../lib/models/enums/user-role.enum';
import { INonprofit } from '../lib/models/nonprofit';
import { UserRole } from '../lib/models/enums/user-role.enum';
import { NonprofitStatus } from '../lib/models/enums/nonprofit-status.enum';

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
    result = await getNonprofit(context, uid);
    break;
  case 'POST':
    result = await createNonprofit(context, uid);
    break;
  case 'PUT':
    result = await updateNonprofit(context, uid);
    break;
  case 'DELETE':
    result = await deleteNonprofit(context, uid);
    break;
  }

  context.res = result;
};

/** Strips PII fields for callers that aren't board/admin */
function redact(nonprofit: INonprofit, callerRole: UserRole): Partial<INonprofit> {
  if (READ_NONPROFIT_PII.includes(callerRole)) {
    return nonprofit;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contactName, contactRole, contactEmail, contactPhone, einNumber, ...safe } = nonprofit;
  return safe;
}

async function getNonprofit(context: Context, userIdent: string): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  const nonprofitId = context.bindingData.nonprofitId;
  if (!nonprofitId) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  const nonprofit = await nonprofitStore.list(nonprofitId);
  if (!nonprofit) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  return createSuccessResult(200, redact(nonprofit.toObject(), user.userRole), context);
}

async function createNonprofit(context: Context, userIdent: string): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can create nonprofits
  if (!EDIT_ALL_NONPROFITS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const nonprofitCreate = context.req?.body;
  // New nonprofits always start in 'interested' status regardless of what was submitted;
  // moving to 'accepted'/'archived' happens later via PUT.
  nonprofitCreate.status = NonprofitStatus.INTERESTED;

  const nonprofitData = await nonprofitStore.create(nonprofitCreate);

  return createSuccessResult(201, nonprofitData, context);
}

async function updateNonprofit(context: Context, userIdent: string): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can update nonprofits
  if (!EDIT_ALL_NONPROFITS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const nonprofitId = context.bindingData.nonprofitId;
  if (!nonprofitId) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  const nonprofit = await nonprofitStore.list(nonprofitId);
  if (!nonprofit) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  const nonprofitUpdate = context.req?.body;

  const nonprofitData = await nonprofitStore.update(nonprofitId, nonprofitUpdate);

  return createSuccessResult(200, nonprofitData, context);
}

async function deleteNonprofit(context: Context, userIdent: string): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can delete nonprofits
  if (!EDIT_ALL_NONPROFITS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const nonprofitId = context.bindingData.nonprofitId;
  if (!nonprofitId) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  const nonprofit = await nonprofitStore.list(nonprofitId);
  if (!nonprofit) {
    return createErrorResult(404, 'Nonprofit not found', context);
  }

  await nonprofitStore.delete(nonprofitId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
