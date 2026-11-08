import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import PageLayout from '../../../layouts/PageLayout';
import StatusChip, {
  StatusChipTheme,
} from '../../../components/elements/StatusChip';
import { useAppSelector } from '../../../store/hooks';
import { profiles, users } from '../../../store/usersSlice';
import { selectAllEvents } from '../../../store/eventsSlice';
import {
  getProfilesData,
  getUsersData,
  loadUserAttendance,
  loadUserSkills,
} from '../../../services/users';
import { loadAllEvents } from '../../../services/event';
import { colors } from '../../../material/colors';
import { roleLabels } from '../../../helpers/roles';
import {
  designSkills,
  dietaryRestrictions,
  otherExperience,
  shirtSizes,
  skillLevels,
  technicalSkills,
} from '../../../helpers/constants';
import { parsePhone } from '../../../helpers/functions';
import { UserRole } from '../../../types/user';
import { Skill, UserSkill } from '../../../types/profile';
import { Attendance, EventAttendance } from '../../../types/event';

const userRoleDisplay: Record<
  UserRole,
  { label: string; theme: StatusChipTheme }
> = {
  admin: { label: 'Admin', theme: 'teal' },
  boardmember: { label: 'Board member', theme: 'teal' },
  volunteer: { label: 'Volunteer', theme: 'neutral' },
  nonprofit: { label: 'Nonprofit', theme: 'neutral' },
};

const attendanceDisplay: Record<
  Attendance,
  { label: string; theme: StatusChipTheme }
> = {
  attending: { label: 'Available', theme: 'success' },
  'partial-attending': { label: 'Partly available', theme: 'warning' },
  'not-attending': { label: 'Not available', theme: 'neutral' },
};

type SkillCategory = {
  title: string;
  skills: Skill[];
  surface: string;
  text: string;
};

// Design's "development" list repeats the technical dev skills; a skill is
// shown once, under the first category that lists it.
const skillCategories: SkillCategory[] = [
  {
    title: 'Technical',
    skills: [
      ...technicalSkills.experienceLevel,
      ...technicalSkills.toolsAndLanguages,
    ],
    surface: colors.teal.tint,
    text: colors.teal.deep,
  },
  {
    title: 'Design',
    skills: [
      ...designSkills.experienceLevel,
      ...designSkills.tools,
      ...designSkills.development,
    ],
    surface: colors.status.warningSurface,
    text: colors.status.warning,
  },
  {
    title: 'Other experience',
    skills: otherExperience,
    surface: colors.purple.tint,
    text: colors.purple.deep,
  },
];

const categoryBySkill = new Map<string, SkillCategory>();
for (const category of skillCategories) {
  for (const skill of category.skills) {
    if (!categoryBySkill.has(skill.code)) {
      categoryBySkill.set(skill.code, category);
    }
  }
}

/** Rated skill levels, strongest first. */
const ratedLevels = skillLevels
  .filter((level) => level.level > 0)
  .sort((a, b) => b.level - a.level);

const cardStyle = {
  backgroundColor: colors.surface.card,
  borderRadius: 5,
  padding: '28px 32px',
  boxShadow:
    '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
  marginBottom: 24,
};

const detailLabelStyle = {
  color: colors.text.secondary,
  fontSize: 12,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const formatDate = (isoDate?: string) =>
  isoDate
    ? new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

const yesNo = (value?: boolean) =>
  value === undefined ? undefined : value ? 'Yes' : 'No';

const externalHref = (url: string) =>
  url.startsWith('http') ? url : `https://${url}`;

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section aria-label={title} style={cardStyle}>
    <h2 style={{ color: colors.text.primary, marginTop: 0 }}>{title}</h2>
    <Divider sx={{ marginBottom: 2 }} />
    {children}
  </section>
);

/**
 * A labelled value. Hidden when there's nothing to show, unless `emptyText`
 * is given (for fields where "no answer" is itself worth seeing).
 */
const Detail = ({
  label,
  children,
  emptyText,
}: {
  label: string;
  children?: ReactNode;
  emptyText?: string;
}) =>
  children || emptyText ? (
    <div style={{ marginBottom: 16 }}>
      <div style={detailLabelStyle}>{label}</div>
      <div
        style={{
          color: children ? colors.text.primary : colors.text.placeholder,
          whiteSpace: 'pre-line',
          overflowWrap: 'anywhere',
        }}
      >
        {children || emptyText}
      </div>
    </div>
  ) : null;

const linkStyle = {
  color: colors.teal.main,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

const externalLink = (url?: string) =>
  url ? (
    <a
      href={externalHref(url)}
      target="_blank"
      rel="noreferrer"
      style={linkStyle}
    >
      {url}
    </a>
  ) : undefined;

/** Everything we know about one user, for board members and admins. */
const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const usersData = useAppSelector(users);
  const profilesData = useAppSelector(profiles);
  const events = useAppSelector(selectAllEvents);

  const [skills, setSkills] = useState<UserSkill[] | null>(null);
  const [attendance, setAttendance] = useState<EventAttendance[] | null>(null);

  // The Users page loads everyone; load them here too for direct links.
  useEffect(() => {
    if (!usersData) {
      getUsersData().catch(() => undefined);
    }
    if (!profilesData) {
      getProfilesData().catch(() => undefined);
    }
    // Only on first visit; the store keeps them afterwards.
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    loadAllEvents();
    loadUserSkills(userId).then((data) => setSkills(data ?? []));
    loadUserAttendance(userId).then((data) => setAttendance(data ?? []));
  }, [userId]);

  const user = usersData?.find((u) => u._id === userId);
  const profile = profilesData?.find((p) => p.user === userId);

  const backLink = (
    <a
      onClick={() => navigate('/users')}
      style={{ cursor: 'pointer', color: colors.text.secondary, fontSize: 15 }}
    >
      ← Back to users
    </a>
  );

  if (!user) {
    return (
      <PageLayout>
        <div className="fullViewContainer">
          <div className="gutters">
            {backLink}
            <h1 className="pageTitle">User</h1>
            <p style={{ textAlign: 'center', color: colors.text.secondary }}>
              {usersData ? 'User not found.' : 'Loading…'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const levelBySkill = new Map(
    (skills ?? []).map((skill) => [skill.code, skill.level]),
  );
  const skillsByLevel = ratedLevels
    .map((level) => ({
      ...level,
      skills: [...categoryBySkill.entries()]
        .filter(([code]) => levelBySkill.get(code) === level.level)
        .map(([code, category]) => ({
          code,
          category,
          description:
            category.skills.find((skill) => skill.code === code)?.description ??
            code,
        })),
    }))
    .filter((level) => level.skills.length > 0);
  const usedCategories = skillCategories.filter((category) =>
    skillsByLevel.some((level) =>
      level.skills.some((skill) => skill.category === category),
    ),
  );

  const dietary = [
    ...(profile?.dietaryRestrictions ?? []).map(
      (id) => dietaryRestrictions.find((d) => d.id === id)?.description ?? id,
    ),
  ].join(', ');
  const shirtSize = shirtSizes.find(
    (s) => s.id === profile?.shirtSize,
  )?.description;
  const hasEventNeeds = Boolean(
    shirtSize ||
    dietary ||
    profile?.additionalDietaryRestrictions ||
    profile?.accessibilityRequirements,
  );

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          {backLink}

          <h1 className="pageTitle">User</h1>

          <Grid container spacing={3} sx={{ marginTop: 0 }}>
            <Grid item xs={12} md={4}>
              <section aria-label={fullName} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <h2 style={{ color: colors.text.primary, margin: '0 0 4px' }}>
                    {fullName}
                  </h2>
                  <StatusChip
                    label={
                      userRoleDisplay[user.userRole]?.label ?? user.userRole
                    }
                    theme={userRoleDisplay[user.userRole]?.theme ?? 'neutral'}
                  />
                </div>
                {(profile?.preferredName || profile?.pronouns) && (
                  <p
                    style={{ color: colors.text.secondary, margin: '0 0 12px' }}
                  >
                    {[
                      profile?.preferredName &&
                        `Goes by ${profile.preferredName}`,
                      profile?.pronouns,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(profile?.roles ?? []).map((role) => (
                    <Chip
                      key={role}
                      label={roleLabels[role] ?? role}
                      sx={{ backgroundColor: colors.status.neutralSurface }}
                    />
                  ))}
                  {!profile && (
                    <Chip
                      label="No volunteer profile yet"
                      sx={{ backgroundColor: colors.status.neutralSurface }}
                    />
                  )}
                </div>
                <Divider sx={{ margin: '20px 0 16px' }} />
                <Detail label="Email">
                  <a href={`mailto:${user.email}`} style={linkStyle}>
                    {user.email}
                  </a>
                </Detail>
                <Detail label="Phone">
                  {user.phone ? parsePhone(user.phone).formatted : undefined}
                </Detail>
                <Detail label="Current employer">
                  {profile?.currentEmployer}
                </Detail>
                <Detail label="LinkedIn">
                  {externalLink(profile?.linkedInUrl)}
                </Detail>
                <Detail label="Website">
                  {externalLink(profile?.websiteUrl)}
                </Detail>
                <Detail label="Portfolio">
                  {externalLink(profile?.portfolioUrl)}
                </Detail>
              </section>

              <Card title="Volunteer profile">
                <Detail label="Previous volunteer">
                  {yesNo(profile?.previousVolunteer)}
                </Detail>
                <Detail label="Team lead candidate">
                  {yesNo(profile?.teamLeadCandidate)}
                </Detail>
                <Detail label="Profile completed" emptyText="Not completed">
                  {formatDate(profile?.completionDate)}
                </Detail>
                <Detail label="Last updated">
                  {formatDate(profile?.updatedDate)}
                </Detail>
              </Card>

              <Card title="Event needs">
                {!hasEventNeeds && (
                  <p style={{ color: colors.text.secondary, margin: 0 }}>
                    Nothing provided yet.
                  </p>
                )}
                <Detail label="Shirt size">{shirtSize}</Detail>
                <Detail label="Dietary restrictions">{dietary}</Detail>
                <Detail label="Other dietary needs">
                  {profile?.additionalDietaryRestrictions}
                </Detail>
                <Detail label="Accessibility requirements">
                  {profile?.accessibilityRequirements}
                </Detail>
              </Card>

              <Card title="Agreements">
                <Detail label="Terms and conditions" emptyText="Not signed">
                  {formatDate(profile?.agreements?.termsAndConditions)}
                </Detail>
                <Detail label="Code of conduct" emptyText="Not signed">
                  {formatDate(profile?.agreements?.codeOfConduct)}
                </Detail>
                <Detail label="Photo release" emptyText="Not signed">
                  {formatDate(profile?.agreements?.photoRelease)}
                </Detail>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card title="Event availability">
                {attendance === null ? (
                  <p style={{ color: colors.text.secondary }}>Loading…</p>
                ) : attendance.length === 0 ? (
                  <p style={{ color: colors.text.secondary }}>
                    No event responses yet.
                  </p>
                ) : (
                  attendance.map((entry) => {
                    const event = events.find((e) => e._id === entry.event);
                    const display = attendanceDisplay[entry.attendance];
                    return (
                      <div
                        key={entry._id}
                        aria-label={event?.name ?? 'Event'}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 16,
                          padding: '12px 0',
                          borderBottom: `1px solid ${colors.border.subtle}`,
                        }}
                      >
                        <div>
                          <div style={{ color: colors.text.primary }}>
                            {event?.name ?? 'Unknown event'}
                          </div>
                          {entry.attendanceDetail && (
                            <div
                              style={{
                                color: colors.text.secondary,
                                fontSize: 15,
                              }}
                            >
                              {entry.attendanceDetail}
                            </div>
                          )}
                        </div>
                        {display && (
                          <StatusChip
                            label={display.label}
                            theme={display.theme}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </Card>

              <Card title="Skills">
                {skills === null ? (
                  <p style={{ color: colors.text.secondary }}>Loading…</p>
                ) : skillsByLevel.length === 0 ? (
                  <p style={{ color: colors.text.secondary }}>
                    No skills rated yet.
                  </p>
                ) : (
                  <>
                    <ul
                      aria-label="Skill categories"
                      style={{
                        display: 'flex',
                        gap: 16,
                        flexWrap: 'wrap',
                        listStyle: 'none',
                        margin: '0 0 16px',
                        padding: 0,
                        fontSize: 13,
                        color: colors.text.secondary,
                      }}
                    >
                      {usedCategories.map((category) => (
                        <li
                          key={category.title}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: category.surface,
                              border: `1px solid ${category.text}`,
                            }}
                          />
                          {category.title}
                        </li>
                      ))}
                    </ul>
                    {skillsByLevel.map((level) => (
                      <div
                        key={level.level}
                        role="group"
                        aria-label={level.description}
                        style={{ marginBottom: 16 }}
                      >
                        <div style={detailLabelStyle}>{level.description}</div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginTop: 8,
                          }}
                        >
                          {level.skills.map((skill) => (
                            <Chip
                              key={skill.code}
                              label={skill.description}
                              title={skill.category.title}
                              aria-label={`${skill.description} (${skill.category.title})`}
                              sx={{
                                backgroundColor: skill.category.surface,
                                color: skill.category.text,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {profile?.additionalSkills && (
                  <Detail label="Additional skills">
                    {profile.additionalSkills}
                  </Detail>
                )}
                {profile?.aiSkills && (
                  <Detail label="AI skills">{profile.aiSkills}</Detail>
                )}
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserDetail;
