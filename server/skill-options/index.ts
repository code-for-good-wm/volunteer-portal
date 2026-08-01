import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { checkAuthAndConnect, checkRole } from '../lib/helpers';
import { skillOptionsStore } from '../lib/models/store';
import { EDIT_ALL_SKILLS } from '../lib/models/enums/user-role.enum';
import { defaultSkillOptions } from './defaults';

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
      result = await getSkillOptions(context);
      break;
    case 'POST':
      result = await createSkillOption(context, req);
      break;
    case 'PUT':
      result = await updateSkillOption(context, req);
      break;
    case 'DELETE':
      result = await deleteSkillOptions(context, req);
      break;
  }

  if (result) {
    context.res = result;
  }
};

async function getSkillOptions(context: Context): Promise<IHttpResult> {
  // No user ID check here; skill options are public data
  // Check for either a skill code or category query param
  const skillCode = context.bindingData.skillCode; // Optional
  if (skillCode) {
    const skillOption = await skillOptionsStore.list(skillCode);
    if (!skillOption) {
      return createErrorResult(404, 'Skill option not found', context);
    }
    return createSuccessResult(200, [skillOption], context);
  }

  const category = context.req?.query?.category; // Optional
  // The skillOptionsStore listAll method handles undefined category
  const skillOptions = await skillOptionsStore.listAll(category);

  if (!skillOptions || skillOptions.length === 0) {
    // load the default skill options if none found
    return createSuccessResult(200, defaultSkillOptions, context);
  }

  return createSuccessResult(200, skillOptions, context);
}

async function createSkillOption(
  context: Context,
  req: HttpRequest,
): Promise<IHttpResult> {
  // Only admins can create skill options
  const allowed = await checkRole(context, req, EDIT_ALL_SKILLS);

  if (!allowed.success) {
    return allowed.error;
  }

  const skillData = req.body;
  if (!skillData || !skillData.code || !skillData.name) {
    return createErrorResult(
      400,
      'Skill data missing required properties',
      context,
    );
  }

  // Create the skill option
  const newSkillOption = {
    code: skillData.code,
    name: skillData.name,
    description: skillData.description,
    category: skillData.category,
    level: skillData.level,
  };

  const createdSkillOption = await skillOptionsStore.create(newSkillOption);
  return createSuccessResult(201, createdSkillOption, context);
}

async function updateSkillOption(
  context: Context,
  req: HttpRequest,
): Promise<IHttpResult> {
  // Only admins can update skill options
  const allowed = await checkRole(context, req, EDIT_ALL_SKILLS);

  if (!allowed.success) {
    return allowed.error;
  }

  const skillCode = context.bindingData.skillCode;
  if (!skillCode) {
    return createErrorResult(400, 'Skill code is required for update', context);
  }

  const skillData = req.body;
  if (!skillData || !skillData.name) {
    return createErrorResult(
      400,
      'Skill data missing required properties',
      context,
    );
  }

  // Update the skill option
  const updatedSkillOption = {
    code: skillCode,
    name: skillData.name,
    description: skillData.description,
    category: skillData.category,
    level: skillData.level,
  };

  const result = await skillOptionsStore.update(skillCode, updatedSkillOption);
  if (result.modifiedCount === 0) {
    return createErrorResult(
      404,
      'Skill option not found or no changes made',
      context,
    );
  }

  return createSuccessResult(200, updatedSkillOption, context);
}

async function deleteSkillOptions(
  context: Context,
  req: HttpRequest,
): Promise<IHttpResult> {
  // Only admins can delete skill options
  const allowed = await checkRole(context, req, EDIT_ALL_SKILLS);

  if (!allowed.success) {
    return allowed.error;
  }

  const skillCode = context.bindingData.skillCode;
  if (!skillCode) {
    return createErrorResult(
      400,
      'Skill code is required for deletion',
      context,
    );
  }

  // Delete the skill option
  const result = await skillOptionsStore.delete(skillCode);
  if (result.deletedCount === 0) {
    return createErrorResult(404, 'Skill option not found', context);
  }

  return createSuccessResult(204, null, context);
}

export default httpTrigger;
