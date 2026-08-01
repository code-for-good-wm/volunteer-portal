/**
 * One-time migration: populate `firstName` / `lastName` on existing users.
 *
 * Matches users by email against an input list and sets their first/last name,
 * removing the legacy `name` field. Users not present in the list are left
 * untouched and reported so they can be followed up.
 *
 * Input file: JSON array of { email, firstName, lastName }, e.g.
 *   [
 *     { "email": "ada@example.com", "firstName": "Ada", "lastName": "Lovelace" },
 *     { "email": "grace@example.com", "firstName": "Grace", "lastName": "Hopper" }
 *   ]
 *
 * Usage (from the server/ directory):
 *   # ensure DATABASE_URI / DATABASE_NAME (and DATABASE_PASS if used) are set,
 *   # e.g. via a local .env file loaded by dotenv
 *   npx ts-node scripts/split-user-names.ts ./names.json
 *
 *   # or, after `npm run build`:
 *   node dist/scripts/split-user-names.js ./names.json
 *
 * Add --dry-run to report matches without writing anything.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import * as mongoose from 'mongoose';

import getConfig from '../lib/config';
import { UserModel } from '../lib/models/user';

type NameEntry = {
  email: string;
  firstName: string;
  lastName: string;
};

const log = (...args: unknown[]) => console.log(...args);

const parseEntries = (path: string): NameEntry[] => {
  const raw = readFileSync(path, 'utf-8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error(
      'Input file must contain a JSON array of { email, firstName, lastName }.',
    );
  }

  return data.map((entry, i) => {
    const { email, firstName, lastName } = entry ?? {};
    if (!email || !firstName || !lastName) {
      throw new Error(
        `Entry at index ${i} is missing email, firstName, or lastName.`,
      );
    }
    return {
      email: String(email).trim(),
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
    };
  });
};

const run = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const inputPath = args.find((a) => !a.startsWith('--'));

  if (!inputPath) {
    log(
      'Usage: ts-node scripts/split-user-names.ts <path-to-names.json> [--dry-run]',
    );
    process.exit(1);
  }

  const entries = parseEntries(inputPath);
  log(
    `Loaded ${entries.length} name entr${entries.length === 1 ? 'y' : 'ies'} from ${inputPath}.`,
  );

  const config = await getConfig();
  if (!config.database.connectionString) {
    throw new Error(
      'No database connection string provided (set DATABASE_URI).',
    );
  }

  await mongoose.connect(config.database.connectionString, {
    dbName: config.database.databaseName,
  });
  log(`Connected to database "${config.database.databaseName}".`);

  const matched: string[] = [];
  const unmatched: string[] = [];

  try {
    for (const { email, firstName, lastName } of entries) {
      // Case-insensitive exact match on email
      const filter = {
        email: new RegExp(
          `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i',
        ),
      };

      if (dryRun) {
        const existing = await UserModel.findOne(filter).select('email').lean();
        (existing ? matched : unmatched).push(email);
        continue;
      }

      const result = await UserModel.updateOne(filter, {
        $set: { firstName, lastName },
        $unset: { name: '' },
      });

      if (result.matchedCount > 0) {
        matched.push(email);
      } else {
        unmatched.push(email);
      }
    }
  } finally {
    await mongoose.disconnect();
  }

  log('');
  log(`${dryRun ? '[dry-run] ' : ''}Matched & updated: ${matched.length}`);
  log(`Unmatched (no user with that email): ${unmatched.length}`);
  if (unmatched.length) {
    log('Unmatched emails:');
    unmatched.forEach((e) => log(`  - ${e}`));
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
