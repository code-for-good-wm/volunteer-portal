import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { projectStore, userStore } from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { EDIT_ALL_PROJECTS } from '../lib/models/enums/user-role.enum';
import { ProjectStatus } from '../lib/models/enums/project-status.enum';

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

  switch (req.method) {
    case 'GET':
      result = await getProject(context);
      break;
    case 'POST':
      result = await createProject(context, uid);
      break;
    case 'PUT':
      result = await updateProject(context, uid);
      break;
    case 'DELETE':
      result = await deleteProject(context, uid);
      break;
  }

  context.res = result;
};

async function getProject(context: Context): Promise<IHttpResult> {
  const projectId = context.bindingData.projectId;
  if (!projectId) {
    return createErrorResult(404, 'Project not found', context);
  }

  const project = await projectStore.list(projectId);

  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  return createSuccessResult(200, project, context);
}

async function createProject(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // This is the admin "add a project manually" flow; only board/admin can use it.
  if (!EDIT_ALL_PROJECTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectCreate = context.req?.body;
  // Only the two states this form's Save buttons offer are valid at creation;
  // anything else (or missing) falls back to 'proposed'.
  const allowedCreateStatuses = [
    ProjectStatus.PROPOSED,
    ProjectStatus.ACCEPTED,
  ];
  projectCreate.status = allowedCreateStatuses.includes(projectCreate.status)
    ? projectCreate.status
    : ProjectStatus.PROPOSED;
  projectCreate.submittedAt = new Date();

  const projectData = await projectStore.create(projectCreate);

  return createSuccessResult(201, projectData, context);
}

async function updateProject(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can update a project (accept/reject/archive/edit)
  if (!EDIT_ALL_PROJECTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  if (!projectId) {
    return createErrorResult(404, 'Project not found', context);
  }

  const project = await projectStore.list(projectId);
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  const projectUpdate = context.req?.body;

  const projectData = await projectStore.update(projectId, projectUpdate);

  return createSuccessResult(200, projectData, context);
}

async function deleteProject(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can delete projects
  if (!EDIT_ALL_PROJECTS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const projectId = context.bindingData.projectId;
  if (!projectId) {
    return createErrorResult(404, 'Project not found', context);
  }

  const project = await projectStore.list(projectId);
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  await projectStore.delete(projectId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
