import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Types } from 'mongoose';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { projectStore, userStore } from '../lib/models/store';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  // get caller uid from token and connect to DB
  // eslint-disable-next-line prefer-const
  let { uid, result } = await checkAuthAndConnect(context, req);

  // result will be non-null if there was an error
  if (result) {
    context.res = result;
    return;
  }

  const nonprofitId = req.query['nonprofitId'];
  const eventId = req.query['eventId'];

  switch (req.method) {
    case 'GET':
      result = await getProjects(context, uid, nonprofitId, eventId);
      break;
  }

  if (result) {
    context.res = result;
  }
};

async function getProjects(
  context: Context,
  userIdent: string,
  nonprofitId?: string,
  eventId?: string,
): Promise<IHttpResult> {
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  let projects;
  if (nonprofitId) {
    projects = await projectStore.listByNonprofit(
      new Types.ObjectId(nonprofitId),
    );
  } else if (eventId) {
    projects = await projectStore.listByEvent(new Types.ObjectId(eventId));
  } else {
    projects = await projectStore.listAll();
  }

  return createSuccessResult(200, projects, context);
}

export default httpTrigger;
