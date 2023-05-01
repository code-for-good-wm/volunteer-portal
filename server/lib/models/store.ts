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
import { IEventAttendance, EventAttendanceModel } from './event-attendance';

// Database config

const configureMongoose = async function (log: Logger): Promise<void> {
  // Configure JSON output to client
  // Removes version
  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false
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

    await mongoose.connect(
      config.database.connectionString,
      { dbName: config.database.databaseName }
    );
  }
  catch (err) {
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

export const optionsStore = {
  list: async(category: string | undefined) => {
    // filter by category if we have it
    if (category) {
      return await SkillOptionModel.find({ category } as SkillOption).exec();
    }
    return await SkillOptionModel.find().exec();
  }
};

export const userStore = {
  list: async(ident: string) => {
    return await UserModel.findOne({ident});
  },
  listAll: async() => {
    return await UserModel.find();
  },
  create: async(user: IUser) => {
    return await UserModel.create(user);
  },
  update: async(_id: mongoose.Types.ObjectId, ident: string, user: IUser) => {
    return await UserModel.updateOne({_id, ident}, user);
  },
  delete: async(_id: mongoose.Types.ObjectId, ident: string) => {
    return await UserModel.deleteOne({_id, ident});
  }
};

export const profileStore = {
  list: async(userId: mongoose.Types.ObjectId, populateSkills: boolean) => {
    return await (populateSkills ? ProfileModel.findOne({user: userId}).populate('skills') : ProfileModel.findOne({user: userId}));
  },
  listAll: async(populateSkills: boolean) => {
    return await (populateSkills ? ProfileModel.find().populate('skills') : ProfileModel.find());
  },
  create: async(profile: IProfile) => {
    return await ProfileModel.create(profile);
  },
  update: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, profile: IProfile) => {
    profile.user = userId;
    return await ProfileModel.updateOne({_id, user: userId}, profile);
  },
  delete: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {
    return await ProfileModel.deleteOne({_id, user: userId});
  }
};

export const skillStore = {
  list: async(userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.find({user: userId});
  },
  listAll: async() => {
    return await UserSkillModel.find();
  },
  create: async(userId: mongoose.Types.ObjectId, skill: IUserSkill) => {
    skill.user = userId;
    return await UserSkillModel.create(skill);
  },
  createMany: async(userId: mongoose.Types.ObjectId, skills: IUserSkill[]) => {
    skills.forEach(s => s.user = userId);
    return await UserSkillModel.create(skills);
  },
  update: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, skill: IUserSkill) => {
    skill.user = userId;
    return await UserSkillModel.updateOne({_id, user: userId}, skill);
  },
  delete: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.deleteOne({_id, user: userId});
  },
  deleteByCode: async(userId: mongoose.Types.ObjectId, code: string) => {
    return await UserSkillModel.deleteOne({user: userId, code});
  },
  deleteAllForUser: async(userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.deleteMany({user: userId});
  }
};

export const programStore = {
  list: async(_id: mongoose.Types.ObjectId) => {
    return await ProgramModel.findOne({_id}).populate('events');
  },
  listAll: async(includeEvents: boolean) => {
    return await (includeEvents ? ProgramModel.find().populate('events') : ProgramModel.find());
  },
  create: async(program: IProgram) => {
    return await ProgramModel.create(program);
  },
  update: async(_id: mongoose.Types.ObjectId, program: IProgram) => {
    return await ProgramModel.updateOne({_id}, program);
  },
  delete: async(_id: mongoose.Types.ObjectId) => {
    return await ProgramModel.deleteOne({_id});
  }
};

export const eventStore = {
  list: async(_id: mongoose.Types.ObjectId) => {
    return await EventModel.findOne({_id}).populate('program');
  },
  listByProgram: async(programId: mongoose.Types.ObjectId) => {
    return await EventModel.find({program: programId});
  },
  listAll: async() => {
    return await EventModel.find();
  },
  /** list upcoming & active events */
  upcoming: async() => {
    const now = new Date().toISOString();
    return await EventModel.find({endDate: {$gt: now}});
  },
  create: async(event: IEvent) => {
    return await EventModel.create(event);
  },
  update: async(_id: mongoose.Types.ObjectId, event: IEvent) => {
    return await EventModel.updateOne({_id}, event);
  },
  delete: async(_id: mongoose.Types.ObjectId) => {
    return await EventModel.deleteOne({_id});
  }
};

export const eventAttendanceStore = {
  list: async(eventId: mongoose.Types.ObjectId) => {
    return await EventAttendanceModel.find({event: eventId});
  },
  listByUser: async(userId: mongoose.Types.ObjectId, events: mongoose.Types.ObjectId[]) => {
    const query = (events && events.length > 0)
      ? {user: userId, event: {$in: events}}
      : {user: userId};
    return await EventAttendanceModel.find(query);
  },
  // should be singular
  listByUserAndEvent: async(userId: mongoose.Types.ObjectId, eventId: mongoose.Types.ObjectId) => {
    return await EventAttendanceModel.findOne({user: userId, event: eventId});
  },
  create: async(userId: mongoose.Types.ObjectId, eventId: mongoose.Types.ObjectId, attendance: IEventAttendance) => {
    attendance.user = userId;
    attendance.event = eventId;
    return await EventAttendanceModel.create(attendance);
  },
  update: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, eventId: mongoose.Types.ObjectId, attendance: IEventAttendance) => {
    attendance.user = userId;
    attendance.event = eventId;
    return await EventAttendanceModel.findOneAndUpdate({_id}, attendance, {new: true});
  },
  delete: async(_id: mongoose.Types.ObjectId) => {
    return await EventAttendanceModel.deleteOne({_id});
  }
};