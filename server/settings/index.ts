import { AzureFunction, Context, HttpRequest } from '@azure/functions';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  // Local variables should be in local.settings.json

  // set return value to JSON
  context.res = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (req.method === 'GET') {
    context.res.status = 200;
    context.res.body = {
      'pwd': context?.executionContext?.functionDirectory,
      'env': Object.keys(process.env)
    };
  }
};

export default httpTrigger;