import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createSuccessResult } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { Role } from '../lib/models/enums/role.enum';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  // get caller uid from token and connect to DB
  const { result } = await checkAuthAndConnect(context, req);

  // result will be non-null if there was an error
  if (result) {
    context.res = result;
    return;
  }

  context.res = createSuccessResult(200, Object.values(Role), context);
};

export default httpTrigger;
