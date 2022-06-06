import * as mongoose from 'mongoose';
import { Logger } from '@azure/functions';
import getConfig from '../config';
import SkillOptionModel from './skill-options';

const configureMongoose = async function (log: Logger): Promise<void> {
  // Configure JSON output to client
  // Removes version, sets _id to id
  mongoose.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_, converted) => {
        converted.id = converted._id;
        delete converted._id;
    }
  });

  try {
    const db = mongoose.connection;
    db.on("connecting", () => log("Mongoose connecting..."));
    db.on("connected", () => log("Mongoose connected successfully!"));
    db.on("disconnecting", () => log("Mongoose disconnecting..."));
    db.on("disconnected", () => log("Mongoose disconnected successfully!"));
    db.on("error", (err) => log("Mongoose database error:", err));

    // Load configuration information
    const config = await getConfig(log);

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

export const optionsStore = {
  list: async(category: String | undefined) => {
    // filter by category if we have it
    if (category) {
      return await SkillOptionModel.find({category}).exec();
    }
    return await SkillOptionModel.find().exec();
  }
};