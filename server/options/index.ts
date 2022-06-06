import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { connect, optionsStore } from '../models/store'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  await connect(context.log);

  // supports filtering by category
  const options = await optionsStore.list(req.query.category);

  context.res = {
    header: {
        "Content-Type": "application/json"
    },
    status: 200,
    body: options
  }
};

export default httpTrigger;