import { Role } from '../types/profile';

/** Short display names for volunteer roles, in the order they're offered. */
export const roleLabels: Record<Role, string> = {
  designer: 'Designer',
  developer: 'Developer',
  support: 'Support',
  lead: 'Team lead',
};

export const roleOptions = (Object.keys(roleLabels) as Role[]).map((value) => ({
  value,
  label: roleLabels[value],
}));
