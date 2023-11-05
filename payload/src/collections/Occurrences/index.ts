import { CollectionConfig } from "payload/types";
import { anyone } from "../../access/anyone";
import { loggedIn } from "../../access/loggedIn";

export const Occurrences: CollectionConfig = {
    slug: 'occurrences',
    access: {
        read: anyone,
        update: loggedIn,
        create: loggedIn
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'startDate',
            type: 'text'
        },
        {
            name: 'endDate',
            type: 'text'
        },
        {
            name: 'description',
            type: 'text'
        },
        {
            name: 'location',
            type: 'text'
        },
        {
            name: 'event',
            type: 'relationship',
            relationTo: 'events'
        }
    ]
}