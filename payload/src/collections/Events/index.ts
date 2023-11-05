import { CollectionConfig } from "payload/types";
import { anyone } from "../../access/anyone";
import { loggedIn } from "../../access/loggedIn";

export const Events: CollectionConfig = {
    slug: 'events',
    access: {
        read: anyone,
        update: loggedIn,
        create: loggedIn,
    },
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'description',
            type: 'richText'
        }
    ]
}