import type { CollectionConfig } from 'payload/types'


import { anyone } from '../../access/anyone'
import adminsAndUser from '../../access/adminsAndUser'
import { checkRole } from '../../access/checkRole'
import { admins } from '../../access/admins'

export const UserFields: CollectionConfig['fields'] = [
  {
    name: 'name',
    type: 'text',
  },
  {
    name: 'roles',
    type: 'select',
    hasMany: true,
    saveToJWT: true,
    defaultValue: ['user'],
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