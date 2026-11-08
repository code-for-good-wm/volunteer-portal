import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Types } from 'mongoose';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import {
  positionStore,
  projectStore,
  slotStore,
  userStore,
} from '../lib/models/store';
import { checkAuthAndConnect } from '../lib/helpers';
import { EDIT_ALL_SLOTS } from '../lib/models/enums/user-role.enum';
import { SlotStatus } from '../lib/models/enums/slot-status.enum';

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

  const user = await userStore.list(uid);
  if (!user) {
    context.res = createErrorResult(404, 'User not found', context);
    return;
  }

  // only board / admins can run team selection
  if (!EDIT_ALL_SLOTS.includes(user.userRole)) {
    context.res = createErrorResult(403, 'Forbidden', context);
    return;
  }

  switch (req.method) {
    case 'PUT':
      result = await assignSlot(context);
      break;
  }

  context.res = result;
};

/**
 * Assigns a volunteer to a slot: body `userId` populates the
 * slot's user, and `status` defaults to invited. Without a `userId` the slot's
 * current volunteer is removed (a no-op if it has none). Responds with the
 * slot, with its position and user populated.
 */
async function assignSlot(context: Context): Promise<IHttpResult> {
  const slotId = context.bindingData.slotId;
  if (!slotId || !Types.ObjectId.isValid(slotId)) {
    return createErrorResult(404, 'Slot not found', context);
  }

  // the project is derived from the slot: slot -> position -> project
  const slot = await slotStore.list(slotId);
  const position = slot
    ? await positionStore.list(slot.position as Types.ObjectId)
    : null;
  if (!slot || !position) {
    return createErrorResult(404, 'Slot not found', context);
  }

  const project = await projectStore.list(position.project as Types.ObjectId);
  if (!project) {
    return createErrorResult(404, 'Project not found', context);
  }

  const { userId, status = SlotStatus.INVITED } = context.req?.body ?? {};

  // no userId: remove the slot's volunteer, if it has one
  if (!userId) {
    const slotData = slot.user
      ? await slotStore.unassign(slotId)
      : await slotStore.listWithDetails(slotId);
    return createSuccessResult(200, slotData, context);
  }

  if (!Types.ObjectId.isValid(userId)) {
    return createErrorResult(400, 'A valid userId is required', context);
  }
  if (!Object.values(SlotStatus).includes(status)) {
    return createErrorResult(400, 'Invalid status', context);
  }
  if (status === SlotStatus.OPEN) {
    return createErrorResult(
      400,
      'A slot with an assigned user cannot be open',
      context,
    );
  }

  const assignee = await userStore.listById(userId);
  if (!assignee) {
    return createErrorResult(404, 'Volunteer not found', context);
  }

  if (
    status === SlotStatus.CONFIRMED ||
    status === SlotStatus.CONFIRMED_PARTIAL
  ) {
    const conflict = await slotStore.hasConfirmedSlotForEvent(
      userId,
      slot.position as Types.ObjectId,
      slotId,
    );
    if (conflict) {
      return createErrorResult(
        409,
        'Volunteer already has a confirmed slot for this event',
        context,
      );
    }
  }

  const now = new Date();
  const responded = [
    SlotStatus.CONFIRMED,
    SlotStatus.CONFIRMED_PARTIAL,
    SlotStatus.DECLINED,
  ].includes(status);
  const changedHands = !slot.user || String(slot.user) !== String(userId);

  const slotData = await slotStore.assign(
    slotId,
    {
      user: userId,
      status,
      // keep the original invite time unless this (re)issues the invitation
      invitedAt:
        status === SlotStatus.INVITED || changedHands ? now : slot.invitedAt,
      respondedAt: responded ? now : undefined,
    },
    changedHands,
  );

  return createSuccessResult(200, slotData, context);
}

export default httpTrigger;
