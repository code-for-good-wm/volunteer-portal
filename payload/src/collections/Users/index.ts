import type { CollectionConfig } from 'payload/types'


import { anyone } from '../../access/anyone'
import { checkRole } from '../../access/checkRole'
import { admins } from '../../access/admins'
import { adminsAndUser } from '../../access/adminsAndUser'

const shirtSizeOptions = [
  {
    label: 'small',
    value: 'small',
  },
  {
    label: 'medium',
    value: 'medium',
  },
  {
    label: 'large',
    value: 'large',
  },
  {
    label: 'x-large',
    value: 'xl',
  },
  {
    label: '2xl',
    value: 'xxl',
  },
  {
    label: '3xl',
    value: '3xl',
  },
  {
    label: '4xl',
    value: '4xl',
  },
  {
    label: '5xl',
    value: '5xl',
  },
];

const dietaryRestrictionOptions = [
  {
    label: 'vegan',
    value: 'vegan',
  },
  {
    label: 'vegetarian',
    value: 'vegetarian',
  },
  {
    label: 'dairy',
    value: 'dairy',
  },
  {
    label: 'gluten',
    value: 'gluten',
  },
  {
    label: 'kosher',
    value: 'kosher',
  },
  {
    label: 'nuts',
    value: 'nuts',
  },
  {
    label: 'fish',
    value: 'fish',
  },
  {
    label: 'eggs',
    value: 'eggs',
  },
  {
    label: 'soy',
    value: 'soy',
  },
  {
    label: 'corn',
    value: 'corn',
  },
  {
    label: 'other',
    value: 'other',
  },
]

export const UserFields: CollectionConfig['fields'] = [
  {
    name: 'name',
    type: 'text',
  },
  {
    // Firebase auth ID for this user
    name: 'ident',
    type: 'text',
  },
  {
    name: 'email',
    type: 'email',
  },
  {
    name: 'phone',
    type: 'text',
  },
  {
    name: 'roles',
    type: 'select',
    hasMany: true,
    saveToJWT: true,
    options: [
      {
        label: 'admin',
        value: 'admin',
      },
      {
        label: 'volunteer',
        value: 'volunteer'
      },
      {
        label: 'non-profit',
        value: 'nonprofit',
      },
    ],
    access: {
      read: admins,
      create: admins,
      update: admins,
    },
  },
  {
    name: 'profile',
    type: 'group',
    fields: [
      {
        name: 'completionDate',
        type: 'text', // ISO timestamp
      },
      {
        name: 'linkedInUrl',
        type: 'text',
      },
      {
        name: 'websiteUrl',
        type: 'text',
      },
      {
        name: 'portfolioUrl',
        type: 'text',
      },
      {
        name: 'previousVolunteer',
        type: 'checkbox',
      },
      {
        name: 'teamLeadCandidate',
        type: 'checkbox',
      },
      {
        name: 'shirtSize',
        type: 'select',
        options: shirtSizeOptions,
      },
      {
        name: 'dietaryRestrictions',
        type: 'select',
        options: dietaryRestrictionOptions,
      },
      {
        name: 'additionalDietaryRestrictions',
        type: 'textarea',
      },
      {
        name: 'accessibilityRequirements',
        type: 'textarea',
      },
      {
        name: 'agreements',
        type: 'group',
        fields: [
          // TODO: These documents should also be described
          // by a version, which is currently not a thing
          {
            name: 'termsAndConditions',
            type: 'text', // ISO timestamp
          },
          {
            name: 'photoRelease',
            type: 'text', // ISO timestamp
          },
          {
            name: 'codeOfConduct',
            type: 'text', // ISO timestamp
          },
        ],
      },
      {
        name: 'additionalSkills',
        type: 'textarea',
      },
    ],
  }
]

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email'],
    group: 'Site Information',
  },
  access: {
    read: adminsAndUser,
    create: anyone,
    update: adminsAndUser,
    delete: admins,
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  auth: {
    tokenExpiration: 28800,
    cookies: {
      sameSite: 'none',
      secure: true,
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  fields: UserFields,
  timestamps: true,
}

export default Users