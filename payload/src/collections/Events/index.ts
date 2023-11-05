import { CollectionConfig } from "payload/types";
import { anyone } from "../../access/anyone";
import { loggedIn } from "../../access/loggedIn";
import { admins } from "../../access/admins";

export const Events: CollectionConfig = {
    slug: 'events',
    access: {
        read: anyone,
        update: admins,
        create: admins,
    },
    admin: {
        useAsTitle: 'name'
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'description',
            type: 'richText'
        },
        {
            name: 'occurrences',
            type: 'relationship',
            relationTo: 'occurrences',
            hasMany: true,
        },
    ]
}