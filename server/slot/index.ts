import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Types } from 'mongoose';
import {
  createErrorResult,
  createSuccessResult,
  IHttpResult,
} from '../lib/core';
import { checkAuthAndConnect, checkBindingDataUserId } from '../lib/helpers';
import { slotStore } from '../lib/models/store';
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

  switch (req.method) {
    case 'GET':
      result = await getUserSlots(context, uid);
      break;
    case 'PUT':
      result = await respondToSlot(context, uid);
      break;
  }

  if (result) {
    context.res = result;
  }
};

async function getUserSlots(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;
  const slotId = context.bindingData.slotId; // Optional

  if (slotId) {
    const slot = await slotStore.list(slotId);
    if (!slot || String(slot.user) !== String(userId)) {
      return createErrorResult(404, 'Slot not found', context);
    }
    return createSuccessResult(200, slot, context);
  }

  const slots = await slotStore.listByUser(userId);
  return createSuccessResult(200, slots, context);
}

/** Lets a volunteer confirm, partially confirm, or decline a slot they've been invited to */
async function respondToSlot(
  context: Context,
  userIdent: string,
): Promise<IHttpResult> {
  // For MVP we're allowing users to access only their own data
  const checkResult = await checkBindingDataUserId(context, userIdent);
  if (checkResult.body.error) {
    return checkResult;
  }

  const userId = checkResult.body._id;
  const slotId = context.bindingData.slotId;
  if (!slotId) {
    return createErrorResult(404, 'Slot not found', context);
  }

  const slot = await slotStore.list(slotId);
  if (!slot || String(slot.user) !== String(userId)) {
    return createErrorResult(404, 'Slot not found', context);
  }

  if (slot.status !== SlotStatus.INVITED) {
    return createErrorResult(400, 'Slot is not awaiting a response', context);
  }

  const { status, partialDetail, declineReason } = context.req?.body ?? {};
  const respondableStatuses = [
    SlotStatus.CONFIRMED,
    SlotStatus.CONFIRMED_PARTIAL,
    SlotStatus.DECLINED,
  ];
  if (!respondableStatuses.includes(status)) {
    return createErrorResult(400, 'Invalid response status', context);
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
        'You already have a confirmed slot for this event',
        context,
      );
    }
  }

  const update = {
    position: slot.position,
    user: userId,
    status,
    invitedAt: slot.invitedAt,
    respondedAt: new Date(),
    partialDetail:
      status === SlotStatus.CONFIRMED_PARTIAL
        ? partialDetail
        : slot.partialDetail,
    declineReason:
      status === SlotStatus.DECLINED ? declineReason : slot.declineReason,
  };

  const slotData = await slotStore.update(slotId, update);

  return createSuccessResult(200, slotData, context);
}

export default httpTrigger;
