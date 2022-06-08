import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { connect, optionsStore } from '../models/store'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  // set return value to JSON
  context.res = {
    header: {
        "Content-Type": "application/json"
    }
  }

  // TODO uncomment to support user id checks
  let { userIdent, status } = { userIdent: 'example', status: 200 }
  // const { userIdent, status } = tryGetUserIdent(req, context);
  context.res.status = status;
  if (context.res.status !== 200) {
    return;
  }

  await connect(context.log);

  // supports filtering by category
  const options = await optionsStore.list(req.query.category);

  context.res.status = 200;
  context.res.body = options;
};

export default httpTrigger;