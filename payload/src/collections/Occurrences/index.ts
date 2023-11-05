import { CollectionConfig } from "payload/types";
import { anyone } from "../../access/anyone";
import { loggedIn } from "../../access/loggedIn";
import { admins } from "../../access/admins";

export const Occurrences: CollectionConfig = {
    slug: 'occurrences',
    access: {
        read: anyone,
        update: admins,
        create: admins,
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'startDate',
            type: 'date',
        },
        {
            name: 'endDate',
            type: 'date',
        },
        {
            name: 'description',
            type: 'richText',
        },
        {
            name: 'location',
            type: 'text'
        },
    ]
}