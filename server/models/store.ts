import * as mongoose from 'mongoose';
import { Logger } from '@azure/functions';
import getConfig from '../config';
import { SkillOption, SkillOptionModel } from './skill-options';
import { User, UserModel } from './user';
import { Profile, ProfileModel } from './profile';
import { UserSkill, UserSkillModel } from './user-skill';

// Database config

const configureMongoose = async function (log: Logger): Promise<void> {
  // Configure JSON output to client
  // Removes version
  mongoose.set("toJSON", {
    virtuals: true,
    versionKey: false
  });
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useCreateIndex', true);

  try {
    const db = mongoose.connection;
    db.on("connecting", () => log("Mongoose connecting..."));
    db.on("connected", () => log("Mongoose connected successfully!"));
    db.on("disconnecting", () => log("Mongoose disconnecting..."));
    db.on("disconnected", () => log("Mongoose disconnected successfully!"));
    db.on("error", (err) => log("Mongoose database error:", err));

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
  list: async(category: String | undefined) => {
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
  create: async(user: User) => {
    return await UserModel.create(user);
  },
  update: async(_id: mongoose.Types.ObjectId, ident: string, user: User) => {
    return await UserModel.updateOne({_id, ident}, user);
  },
  delete: async(_id: mongoose.Types.ObjectId, ident: string) => {
    // TODO: clean up other items?
    return await UserModel.deleteOne({_id, ident});
  }
};

export const profileStore = {
  list: async(userId: mongoose.Types.ObjectId) => {
    // TODO: include skills with populate
    return await ProfileModel.findOne({user: userId});
  },
  create: async(profile: Profile) => {
    return await ProfileModel.create(profile);
  },
  update: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, profile: Profile) => {
    profile.user = userId;
    return await ProfileModel.updateOne({_id, user: userId}, profile);
  },
  delete: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {
    // TODO: clean up other items?
    return await ProfileModel.deleteOne({_id, user: userId});
  }
};

export const skillStore = {
  list: async(userId: mongoose.Types.ObjectId) => {
    return await UserSkillModel.find({user: userId});
  },
  create: async(userId: mongoose.Types.ObjectId, skill: UserSkill) => {
    skill.user = userId;
    return await UserSkillModel.create(skill);
  },
  createMany: async(userId: mongoose.Types.ObjectId, skills: UserSkill[]) => {
    skills.forEach(s => s.user = userId);
    return await UserSkillModel.create(skills);
  },
  update: async(_id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, skill: UserSkill) => {
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