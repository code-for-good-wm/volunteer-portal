import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Result, tryGetUserIdent } from '../core';
import { connect, profileStore, skillStore } from '../models/store'
import { Profile, ProfileModel } from '../models/profile';
import { User } from '../models/user';

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

  let result: Result | null = null;

  switch (req.method) {
    case 'GET':
      result = await getProfile(context, userIdent);
      break;
    case 'POST':
      result = await createProfile(context, userIdent);
      break;
    case 'PUT':
      result = await updateProfile(context, userIdent);
      break;
    case 'DELETE':
      result = await deleteProfile(context, userIdent);
      break;
  }

  if (result) {
    context.res.status = result.status;
    context.res.body = result.body;
  }
};

async function getProfile(context: Context, userIdent: string): Promise<Result> {
  const userId = context.bindingData.userId;
  // TODO: confirm userId == userIdent provided

  const profile = await profileStore.list(userId);

  if (profile) {
    profile.skills = await skillStore.list(userId);
  }

  return { body: profile, status: profile ? 200 : 404 };
}

async function createProfile(context: Context, userIdent: string): Promise<Result> {
  let profile = context.req?.body;

  const userId = context.bindingData.userId;
  // TODO: confirm userId == userIdent provided

  profile.user = userId;
  
  // TODO: handle skills here or ask the UI to do it?
  delete profile.skills;

  return { body: await profileStore.create(profile), status: 201 };
}

async function updateProfile(context: Context, userIdent: string): Promise<Result> {
  let profile = context.req?.body;

  const { _id } = context.req?.body;
  const userId = context.bindingData.userId;
  // TODO: confirm userId == userIdent provided

  profile.user = userId;
  // TODO: handle skills here or ask the UI to do it?
  delete profile.skills;

  const result = await profileStore.update(_id, userId, profile);

  if (result.nModified === 1) {
    return { body: profile, status: 200 };
  } else {
    return { body: null, status: 404 };
  }
}

async function deleteProfile(context: Context, userIdent: string): Promise<Result> {
  const userId = context.bindingData.userId;
  const { _id } = context.req?.body;
  await profileStore.delete(_id, userId);
  return { body: null, status: 202 };
}

export default httpTrigger;