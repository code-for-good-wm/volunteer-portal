/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { stringify } from 'csv-stringify/sync';
import { Types } from 'mongoose';
import { createErrorResult, Result } from '../core';
import { checkAuthAndConnect, getUserId, groupBy } from '../helpers';
import { profileStore, skillStore, userStore } from '../models/store';
import { READ_ALL_USERS } from '../models/enums/user-role.enum';
import { User } from '../models/user';
import { Profile } from '../models/profile';
import { UserSkill } from '../models/user-skill';

// TODO: replace this with DB call once skills are modifyiable
const skillOptions = [
  'frontEndDev',
  'backEndDev',
  'databases',
  'mobileDev',
  'devOps',
  'wordPress',
  'squarespace',
  'wix',
  'weebly',
  'htmlCss',
  'javaScript',
  'react',
  'vue',
  'angular',
  'nodeExpress',
  'phpLaravel',
  'print',
  'ux',
  'ui',
  'designThinking',
  'illustration',
  'brand',
  'motionGraphics',
  'adobeSuite',
  'sketch',
  'figma',
  'zeplin',
  'inVision',
  'marvel',
  'adobeXd',
  'frontEndDev',
  'backEndDev',
  'databases',
  'mobileDev',
  'devOps',
  'projMgmt',
  'brand',
  'copy',
  'crm',
  'marketing',
  'seo',
  'social',
  'technicalWriting',
  'testing',
  'photography',
  'videography',
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // get caller uid from token and connect to DB
  // eslint-disable-next-line prefer-const
  let { uid, result } = await checkAuthAndConnect(context, req);

  // result will be non-null if there was an error
  if (result) {
    context.res = result;
    return;
  }

  switch (req.method) {
  case 'POST':
    result = await exportUsersAndProfiles(context, uid);
    break;
  }

  if (result) {
    context.res = result;
  }
};

async function exportUsersAndProfiles(context: Context, userIdent: string): Promise<Result> {
  // Attempt to acquire user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can see all users
  if (!READ_ALL_USERS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const profileDict: Record<string, Profile> = {};
  const skillsDict: Record<string, Record<string, number>> = {};

  // get all data for export
  const users = await userStore.listAll();
  const profiles = await profileStore.listAll();
  const userSkills = groupBy<UserSkill>(await skillStore.listAll(), (s) => getUserId(s.user));
  for (const profile of profiles) {
    const userId = getUserId(profile.user);
    const skills = userSkills[userId] ?? [];
    profileDict[userId.toString()] = profile;
    skillsDict[userId.toString()] = {};

    for (const skill of skills) {
      skillsDict[userId.toString()][skill.code] = skill.level;
    }
  }

  const csvData = [];

  for (const user of users) {
    const userId = user._id.toString();
    const profile = profileDict[userId];
    const csvRecord: any = {
      id: userId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      userRole: user.userRole,
      roles: profile?.roles?.join(', '),
      prevVolunteer: profile?.previousVolunteer,
      teamLead: profile?.teamLeadCandidate,
      shirtSize: profile?.shirtSize,
      dietaryRestrictions: profile?.dietaryRestrictions?.join(', '),
      addlDietaryRestrictions: profile?.additionalDietaryRestrictions,
      a11yReq: profile?.accessibilityRequirements,
      photosAllowed: !!profile?.agreements?.photoRelease
    };

    for (const skill of skillOptions) {
      csvRecord[skill] = skillsDict[userId] ? skillsDict[userId][skill] : 0;
    }

    csvRecord.additionalSkills = profile?.additionalSkills;

    csvData.push(csvRecord);
  }

  try {
    return {
      headers: {
        'Content-Type': 'test/csv',
        'Content-Disposition': `attachment; filename=users-${new Date().toISOString().slice(0, 10)}.csv`,
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'X-Invocation-ID': context.invocationId
      },
      body: stringify(csvData, { header: true }),
      status: 200 
    };
  } catch (err: any) {
    return createErrorResult(500, err.message, context);
  }
}

export default httpTrigger;