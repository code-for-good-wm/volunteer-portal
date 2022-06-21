import { AzureFunction, Context } from '@azure/functions';

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const header = {
    'Content-Type': 'application/json'
  };

  try {
    context.res = {
      header,
      status: 200,
      body: {
        message: 'Trigger function test successful.',
        success: true
      }
    };
  } catch (error) {
    context.res = {
      header,
      status: 500,
      body: {
        message: 'An internal error occurred.',
        success: false
      }
    };
  }
};

export default httpTrigger;