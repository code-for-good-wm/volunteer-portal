import { CollectionConfig } from "payload/types";
import { anyone } from "../../access/anyone";
import { loggedIn } from "../../access/loggedIn";
import { adminsAndUser } from "../../access/adminsAndUser";
import { admins } from "../../access/admins";

export const Skills: CollectionConfig = {
  slug: 'skills',
  access: {
    read: loggedIn,
    update: admins,
    create: admins,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'code',
      type: 'text',
    },
  ]
}