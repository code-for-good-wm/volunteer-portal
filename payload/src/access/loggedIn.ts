import type { Access, FieldAccess } from 'payload/types'

import type { User } from '../payload-types'

export const loggedIn: FieldAccess<any, User> & Access<any, User> = ({ req: { user } }) => !!user