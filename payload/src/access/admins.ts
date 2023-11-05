import type { AccessArgs } from 'payload/config'


import type { User } from '../payload-types'
import { checkRole } from './checkRole'

type isAdmin = (args: AccessArgs<any, User>) => boolean

export const admins: isAdmin = ({ req: { user } }) => {
  return checkRole(['admin'], user)
}