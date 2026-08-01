import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, IHttpResult } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { nonprofitStore, userStore } from '../lib/models/store';
import { READ_NONPROFIT_PII, UserRole } from '../lib/models/enums/user-role.enum';
import { INonprofit } from '../lib/models/nonprofit';

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
    result = await getNonprofits(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
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

async function getNonprofits(context: Context, userIdent: string): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  const nonprofits = await nonprofitStore.listAll();

  return createSuccessResult(200, nonprofits.map(n => redact(n.toObject(), user.userRole)), context);
}

export default httpTrigger;
