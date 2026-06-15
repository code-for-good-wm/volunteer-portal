/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { stringify } from 'csv-stringify/sync';
import { createErrorResult, IHttpResult } from '../lib/core';
import { checkAuthAndConnect, getUserId, groupBy } from '../lib/helpers';
import { profileStore, userStore, eventStore, eventAttendanceStore, skillStore } from '../lib/models/store';
import { READ_ALL_USERS } from '../lib/models/enums/user-role.enum';
import { IProfile } from '../lib/models/profile';
import { IUserSkill } from '../lib/models/user-skill';
import { IEventAttendance } from '../lib/models/event-attendance';
import { defaultSkillOptions } from '../skill-options/defaults';

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

async function exportUsersAndProfiles(context: Context, userIdent: string): Promise<IHttpResult> {
  // Attempt to acquire current user data
  const user = await userStore.list(userIdent);
  if (!user) {
    return createErrorResult(404, 'User not found', context);
  }

  // only board / admins can see all users
  if (!READ_ALL_USERS.includes(user.userRole)) {
    return createErrorResult(403, 'Forbidden', context);
  }

  const profileDict: Record<string, IProfile> = {};
  const skillsDict: Record<string, Record<string, number>> = {};
  const attendanceDict: Record<string, IEventAttendance> = {};

  // get all data for export
  const [users, profiles, skills] = await Promise.all([userStore.listAll(), profileStore.listAll(), skillStore.listAll()]);
  const userSkills = groupBy<IUserSkill>(skills, (s) => getUserId(s.user));

  for (const profile of profiles) {
    const userId = getUserId(profile.user);
    profileDict[userId.toString()] = profile as IProfile;
    skillsDict[userId.toString()] = (userSkills[userId] ?? []).reduce(
      (m, s) => (m[s.code] = s.level, m), {} as Record<string, number>);
  }

  // getting the current WfG event
  // TODO: make this dynamic
  const event = (await eventStore.listAll()).find(e => e.description === 'Weekend for Good 2025');
  if (!event) {
    return createErrorResult(404, 'Cannot find latest event', context);
  }
  const attendance = await eventAttendanceStore.list(event._id);
  for (const eventAttendance of attendance) {
    const userId = getUserId(eventAttendance.user);
    attendanceDict[userId.toString()] = eventAttendance;
  }

  const csvData: any[] = [];

  for (const user of users) {
    const userId = user._id.toString();
    const profile = profileDict[userId];
    const attendance = attendanceDict[userId];
    const csvRecord: any = {
      id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredName: profile?.preferredName,
      phone: user.phone,
      pronouns: profile?.pronouns,
      userRole: user.userRole,
      roles: profile?.roles?.join(', '),
      linkedin: profile?.linkedInUrl,
      website: profile?.websiteUrl,
      portfolio: profile?.portfolioUrl,
      employer: profile?.currentEmployer,
      prevVolunteer: profile?.previousVolunteer,
      teamLead: profile?.teamLeadCandidate,
      shirtSize: profile?.shirtSize,
      dietaryRestrictions: profile?.dietaryRestrictions?.join(', '),
      addlDietaryRestrictions: profile?.additionalDietaryRestrictions,
      a11yReq: profile?.accessibilityRequirements,
      photosAllowed: !!profile?.agreements?.photoRelease,
      attendance: attendance?.attendance,
      attendanceDetail: attendance?.attendanceDetail,
    };

    const skills = defaultSkillOptions.map(skill => skill.code);

    for (const skill of skills) {
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
