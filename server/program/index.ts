import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, Result } from '../lib/core';
import { programStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { EDIT_ALL_EVENTS } from '../lib/models/enums/user-role.enum';

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
    result = await getProgram(context);
    break;
  case 'POST':
    result = await createProgram(context, uid);
    break;
  case 'PUT':
    result = await updateProgram(context, uid);
    break;
  case 'DELETE':
    result = await deleteProgram(context, uid);
    break;
  }

  context.res = result;
};

async function getProgram(context: Context): Promise<Result> {
  const programId = context.bindingData.programId;
  if (!programId) {
    return createErrorResult(404, 'Program not found', context);
  }

  const program = await programStore.list(programId);

  if (!program) {
    return createErrorResult(404, 'Program not found', context);
  }

  return createSuccessResult(200, program, context);
}

async function createProgram(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can create programs
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const programCreate = context.req?.body;
  
  const programData = await programStore.create(programCreate);

  return createSuccessResult(201, programData, context);
}

async function updateProgram(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can update programs
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const programId = context.bindingData.programId;
  if (!programId) {
    return createErrorResult(404, 'Program not found', context);
  }

  const program = await programStore.list(programId);
  if (!program) {
    return createErrorResult(404, 'Program not found', context);
  }

  const programUpdate = context.req?.body;

  const programData = await programStore.update(programId, programUpdate);

  return createSuccessResult(200, programData, context);
}

async function deleteProgram(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can delete programs
  if (!EDIT_ALL_EVENTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const programId = context.bindingData.programId;
  if (!programId) {
    return createErrorResult(404, 'Program not found', context);
  }

  const program = await programStore.list(programId);
  if (!program) {
    return createErrorResult(404, 'Program not found', context);
  }

  await programStore.delete(programId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;