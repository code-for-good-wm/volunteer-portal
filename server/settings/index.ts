import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as dotenv from 'dotenv';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  // Local variables should be in local.settings.json

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

  if (req.method !== 'GET') {
    return;
  }

  context.res.body = Object.keys(process.env);
};

export default httpTrigger;