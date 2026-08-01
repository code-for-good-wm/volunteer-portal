import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createErrorResult, createSuccessResult, IHttpResult } from '../lib/core';
import { checkAuthAndConnect } from '../lib/helpers';
import { slotStore, userStore } from '../lib/models/store';
import { EDIT_ALL_SLOTS } from '../lib/models/enums/user-role.enum';
import { SlotStatus } from '../lib/models/enums/slot-status.enum';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
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

  // this endpoint is for board/admin to manage slots on a position (invite, assign, correct)
  if (!EDIT_ALL_SLOTS.includes(user.userRole)) {
    context.res = createErrorResult(403, 'Forbidden', context);
    return;
  }

  switch (req.method) {
  case 'GET':
    result = await getSlots(context);
    break;
  case 'PUT':
    result = await updateSlot(context);
    break;
  case 'DELETE':
    result = await deleteSlot(context);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function getSlots(context: Context): Promise<IHttpResult> {
  const positionId = context.bindingData.positionId;
  if (!positionId) {
    return createErrorResult(404, 'Position not found', context);
  }

  const slotId = context.bindingData.slotId; // Optional

  if (slotId) {
    const slot = await slotStore.list(slotId);
    if (!slot || String(slot.position) !== String(positionId)) {
      return createErrorResult(404, 'Slot not found', context);
    }
    return createSuccessResult(200, slot, context);
  }

  const slots = await slotStore.listByPosition(positionId);
  return createSuccessResult(200, slots, context);
}

/**
 * Used to invite a volunteer to an open slot (set user + status: invited),
 * or to otherwise correct a slot's status as an admin.
 */
async function updateSlot(context: Context): Promise<IHttpResult> {
  const positionId = context.bindingData.positionId;
  const slotId = context.bindingData.slotId;
  if (!positionId || !slotId) {
    return createErrorResult(404, 'Slot not found', context);
  }

  const slot = await slotStore.list(slotId);
  if (!slot || String(slot.position) !== String(positionId)) {
    return createErrorResult(404, 'Slot not found', context);
  }

  const { user, status, partialDetail, declineReason } = context.req?.body ?? {};
  if (!status) {
    return createErrorResult(400, 'Slot data missing expected properties', context);
  }

  if ((status === SlotStatus.CONFIRMED || status === SlotStatus.CONFIRMED_PARTIAL) && user) {
    const conflict = await slotStore.hasConfirmedSlotForEvent(user, positionId, slotId);
    if (conflict) {
      return createErrorResult(409, 'Volunteer already has a confirmed slot for this event', context);
    }
  }

  const update = {
    position: positionId,
    user: user ?? slot.user,
    status,
    invitedAt: status === SlotStatus.INVITED ? new Date() : slot.invitedAt,
    respondedAt: [SlotStatus.CONFIRMED, SlotStatus.CONFIRMED_PARTIAL, SlotStatus.DECLINED].includes(status)
      ? new Date()
      : slot.respondedAt,
    partialDetail: partialDetail ?? slot.partialDetail,
    declineReason: declineReason ?? slot.declineReason
  };

  const slotData = await slotStore.update(slotId, update);

  return createSuccessResult(200, slotData, context);
}

async function deleteSlot(context: Context): Promise<IHttpResult> {
  const positionId = context.bindingData.positionId;
  const slotId = context.bindingData.slotId;
  if (!positionId || !slotId) {
    return createErrorResult(404, 'Slot not found', context);
  }

  const slot = await slotStore.list(slotId);
  if (!slot || String(slot.position) !== String(positionId)) {
    return createErrorResult(404, 'Slot not found', context);
  }

  await slotStore.delete(slotId);

  return createSuccessResult(202, null, context);
}

export default httpTrigger;
