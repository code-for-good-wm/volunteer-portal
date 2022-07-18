import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createSuccessResult } from '../core';
import { connect, optionsStore } from '../models/store';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  await connect(context.log);

  // supports filtering by category
  const options = await optionsStore.list(req.query.category);

  context.res = createSuccessResult(200, options, context);
};

export default httpTrigger;