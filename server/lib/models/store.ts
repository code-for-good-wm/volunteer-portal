import * as mongoose from 'mongoose';
import { Logger } from '@azure/functions';
import getConfig from '../config';

// users
import { SkillOption, SkillOptionModel } from './skill-options';
import { IUser, UserModel } from './user';
import { IProfile, ProfileModel } from './profile';
import { IUserSkill, UserSkillModel } from './user-skill';

// programs & events
import { IProgram, ProgramModel } from './program';
import { IEvent, EventModel } from './event';
import { Status } from './enums/status.enum';
import { IEventAttendance, EventAttendanceModel } from './event-attendance';
import { create } from 'domain';

// nonprofits & projects
import { INonprofit, NonprofitModel } from './nonprofit';
import { IProject, ProjectModel } from './project';
import { IPosition, PositionModel } from './position';
import { IPositionSkill, PositionSkillModel } from './position-skill';
import { ISlot, SlotModel } from './slot';
import { SlotStatus } from './enums/slot-status.enum';

// Database config

const configureMongoose = async function (log: Logger): Promise<void> {
  // Configure JSON output to client
  // Removes version
  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
  });
  // mongoose.set('useNewUrlParser', true);
  // mongoose.set('useCreateIndex', true);

  try {
    const db = mongoose.connection;
    db.on('connecting', () => log('Mongoose connecting...'));
    db.on('connected', () => log('Mongoose connected successfully!'));
    db.on('disconnecting', () => log('Mongoose disconnecting...'));
    db.on('disconnected', () => log('Mongoose disconnected successfully!'));
    db.on('error', (err) => log('Mongoose database error:', err));

    // Load configuration information
    const config = await getConfig();

    if (!config.database.connectionString) {
      throw 'No connection string provided!';
    }

    await mongoose.connect(config.database.connectionString, {
      dbName: config.database.databaseName,
    });
  } catch (err) {
    log(`Mongoose database error: ${err}`);
    throw err;
  }
};

export async function connect(log: Logger): Promise<void> {
  // check whether the connection needs to be enabled
  if (mongoose.connection.readyState === 1) {
    log('Connection active.');
    return;
  }
  await configureMongoose(log);
}

// Store config
export const skillOptionsStore = {
  list: async (code: string) => {
    return await SkillOptionModel.findOne({ code }).exec();
  },
  listAll: async (category: string | undefined) => {
    if (category) {
      return await SkillOptionModel.find({ category } as SkillOption).exec();
    }
    return await SkillOptionModel.find();
  },
  create: async (skillOption: SkillOption) => {
    return await SkillOptionModel.create(skillOption);
  },
  update: async (_id: mongoose.Types.ObjectId, skillOption: SkillOption) => {
    return await SkillOptionModel.updateOne({ _id }, skillOption);
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await SkillOptionModel.deleteOne({ _id });
  },
};

export const userStore = {
  list: async (ident: string) => {
    return await UserModel.findOne({ ident });
  },
  listAll: async () => {
    return await UserModel.find();
  },
  create: async (user: IUser) => {
    return await UserModel.create(user);
  },
  update: async (_id: mongoose.Types.ObjectId, ident: string, user: IUser) => {
    return await UserModel.updateOne({ _id, ident }, user);
  },
  delete: async (_id: mongoose.Types.ObjectId, ident: string) => {
    return await UserModel.deleteOne({ _id, ident });
  },
};

export const profileStore = {
  list: async (userId: mongoose.Types.ObjectId) => {
    return await ProfileModel.findOne({ user: userId });
  },
  listAll: async () => {
    return await ProfileModel.find();
  },
  create: async (profile: IProfile) => {
    profile.updatedDate = new Date().toISOString(); // Update timestamp
    return await ProfileModel.create(profile);
  },
  update: async (
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    profile: IProfile,
  ) => {
    profile.user = userId;
    profile.updatedDate = new Date().toISOString(); // Update timestamp
    return await ProfileModel.updateOne({ _id, user: userId }, profile);
  },
  delete: async (
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) => {
    return await ProfileModel.deleteOne({ _id, user: userId });
  },
};

export const skillStore = {
  list: async (userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.find({ user: userId });
  },
  listAll: async () => {
    return await UserSkillModel.find();
  },
  create: async (userId: mongoose.Types.ObjectId, skill: IUserSkill) => {
    skill.user = userId;
    return await UserSkillModel.create(skill);
  },
  createMany: async (userId: mongoose.Types.ObjectId, skills: IUserSkill[]) => {
    skills.forEach((s) => (s.user = userId));
    return await UserSkillModel.create(skills);
  },
  update: async (
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    skill: IUserSkill,
  ) => {
    skill.user = userId;
    return await UserSkillModel.updateOne({ _id, user: userId }, skill);
  },
  delete: async (
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) => {
    return await UserSkillModel.deleteOne({ _id, user: userId });
  },
  deleteByCode: async (userId: mongoose.Types.ObjectId, code: string) => {
    return await UserSkillModel.deleteOne({ user: userId, code });
  },
  deleteAllForUser: async (userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.deleteMany({ user: userId });
  },
};

export const programStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await ProgramModel.findOne({ _id }).populate('events');
  },
  listAll: async (includeEvents: boolean) => {
    return await (includeEvents
      ? ProgramModel.find().populate('events')
      : ProgramModel.find());
  },
  create: async (program: IProgram) => {
    return await ProgramModel.create(program);
  },
  update: async (_id: mongoose.Types.ObjectId, program: IProgram) => {
    return await ProgramModel.updateOne({ _id }, program);
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await ProgramModel.deleteOne({ _id });
  },
};

export const eventStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await EventModel.findOne({ _id }).populate('program');
  },
  listByProgram: async (programId: mongoose.Types.ObjectId) => {
    return await EventModel.find({ program: programId });
  },
  listAll: async () => {
    return await EventModel.find().populate('program');
  },
  /** list events visible to volunteers: published (upcoming), or active and not yet ended */
  upcoming: async () => {
    const now = new Date().toISOString();
    return await EventModel.find({
      $or: [
        { status: Status.UPCOMING },
        { status: Status.ACTIVE, endDate: { $gt: now } },
      ],
    }).populate('program');
  },
  create: async (event: IEvent) => {
    const created = await EventModel.create(event);
    return await created.populate('program');
  },
  update: async (_id: mongoose.Types.ObjectId, event: IEvent) => {
    return await EventModel.findOneAndUpdate({ _id }, event, {
      new: true,
    }).populate('program');
  },
};

export const eventAttendanceStore = {
  list: async (eventId: mongoose.Types.ObjectId) => {
    return await EventAttendanceModel.find({ event: eventId });
  },
  listByUser: async (
    userId: mongoose.Types.ObjectId,
    events: mongoose.Types.ObjectId[],
  ) => {
    const query =
      events && events.length > 0
        ? { user: userId, event: { $in: events } }
        : { user: userId };
    return await EventAttendanceModel.find(query);
  },
  // should be singular
  listByUserAndEvent: async (
    userId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
  ) => {
    return await EventAttendanceModel.findOne({ user: userId, event: eventId });
  },
  listAll: async () => {
    return await EventAttendanceModel.find();
  },
  create: async (
    userId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    attendance: IEventAttendance,
  ) => {
    attendance.user = userId;
    attendance.event = eventId;
    return await EventAttendanceModel.create(attendance);
  },
  update: async (
    _id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    attendance: IEventAttendance,
  ) => {
    attendance.user = userId;
    attendance.event = eventId;
    return await EventAttendanceModel.findOneAndUpdate({ _id }, attendance, {
      new: true,
    });
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await EventAttendanceModel.deleteOne({ _id });
  },
};

export const nonprofitStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await NonprofitModel.findOne({ _id });
  },
  listAll: async () => {
    return await NonprofitModel.find();
  },
  create: async (nonprofit: INonprofit) => {
    return await NonprofitModel.create(nonprofit);
  },
  update: async (_id: mongoose.Types.ObjectId, nonprofit: INonprofit) => {
    return await NonprofitModel.findOneAndUpdate({ _id }, nonprofit, {
      new: true,
    });
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await NonprofitModel.deleteOne({ _id });
  },
};

export const projectStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await ProjectModel.findOne({ _id });
  },
  listAll: async () => {
    return await ProjectModel.find();
  },
  listByNonprofit: async (nonprofitId: mongoose.Types.ObjectId) => {
    return await ProjectModel.find({ nonprofit: nonprofitId });
  },
  listByEvent: async (eventId: mongoose.Types.ObjectId) => {
    return await ProjectModel.find({ event: eventId });
  },
  create: async (project: IProject) => {
    return await ProjectModel.create(project);
  },
  update: async (_id: mongoose.Types.ObjectId, project: IProject) => {
    return await ProjectModel.updateOne({ _id }, project);
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await ProjectModel.deleteOne({ _id });
  },
};

export const positionStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await PositionModel.findOne({ _id });
  },
  listByProject: async (projectId: mongoose.Types.ObjectId) => {
    return await PositionModel.find({ project: projectId });
  },
  // Creates the position along with one open Slot per slotCount, per the
  // "a Position with slotCount: 2 creates two Slots" rule.
  create: async (position: IPosition) => {
    const created = await PositionModel.create(position);
    const openSlots = Array.from({ length: created.slotCount }, () => ({
      position: created._id,
      status: SlotStatus.OPEN,
    })) as ISlot[];
    await SlotModel.create(openSlots);
    return created;
  },
  update: async (_id: mongoose.Types.ObjectId, position: IPosition) => {
    return await PositionModel.updateOne({ _id }, position);
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    await SlotModel.deleteMany({ position: _id });
    await PositionSkillModel.deleteMany({ position: _id });
    return await PositionModel.deleteOne({ _id });
  },
};

export const positionSkillStore = {
  listByPosition: async (positionId: mongoose.Types.ObjectId) => {
    return await PositionSkillModel.find({ position: positionId });
  },
  create: async (
    positionId: mongoose.Types.ObjectId,
    positionSkill: IPositionSkill,
  ) => {
    positionSkill.position = positionId;
    return await PositionSkillModel.create(positionSkill);
  },
  update: async (
    _id: mongoose.Types.ObjectId,
    positionId: mongoose.Types.ObjectId,
    positionSkill: IPositionSkill,
  ) => {
    positionSkill.position = positionId;
    return await PositionSkillModel.updateOne(
      { _id, position: positionId },
      positionSkill,
    );
  },
  delete: async (
    _id: mongoose.Types.ObjectId,
    positionId: mongoose.Types.ObjectId,
  ) => {
    return await PositionSkillModel.deleteOne({ _id, position: positionId });
  },
  deleteByCode: async (positionId: mongoose.Types.ObjectId, code: string) => {
    return await PositionSkillModel.deleteOne({ position: positionId, code });
  },
};

async function getEventIdForPosition(
  positionId: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId | undefined> {
  const position = await PositionModel.findById(positionId).populate({
    path: 'project',
    select: 'event',
  });
  const project = position?.project as unknown as IProject | undefined;
  return project?.event as mongoose.Types.ObjectId | undefined;
}

export const slotStore = {
  list: async (_id: mongoose.Types.ObjectId) => {
    return await SlotModel.findOne({ _id });
  },
  listByPosition: async (positionId: mongoose.Types.ObjectId) => {
    return await SlotModel.find({ position: positionId });
  },
  listByUser: async (userId: mongoose.Types.ObjectId) => {
    return await SlotModel.find({ user: userId });
  },
  update: async (_id: mongoose.Types.ObjectId, slot: ISlot) => {
    return await SlotModel.updateOne({ _id }, slot);
  },
  delete: async (_id: mongoose.Types.ObjectId) => {
    return await SlotModel.deleteOne({ _id });
  },
  /**
   * Enforces "one assigned slot per volunteer per event": checks whether the
   * given user already holds a confirmed slot on any position whose project
   * is tied to the same event as the given position.
   */
  hasConfirmedSlotForEvent: async (
    userId: mongoose.Types.ObjectId,
    positionId: mongoose.Types.ObjectId,
    excludeSlotId?: mongoose.Types.ObjectId,
  ): Promise<boolean> => {
    const eventId = await getEventIdForPosition(positionId);
    if (!eventId) {
      return false; // project not yet assigned to an event; nothing to conflict with
    }

    const positionsForEvent = await PositionModel.find().populate({
      path: 'project',
      match: { event: eventId },
      select: '_id',
    });
    const positionIds = positionsForEvent
      .filter((p) => p.project)
      .map((p) => p._id);

    const query: mongoose.FilterQuery<ISlot> = {
      user: userId,
      position: { $in: positionIds },
      status: { $in: [SlotStatus.CONFIRMED, SlotStatus.CONFIRMED_PARTIAL] },
    };
    if (excludeSlotId) {
      query._id = { $ne: excludeSlotId };
    }

    return !!(await SlotModel.exists(query));
  },
};
