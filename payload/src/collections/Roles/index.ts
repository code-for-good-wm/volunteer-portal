import { CollectionConfig } from "payload/types";

export const Roles: CollectionConfig = {
    slug: 'roles',
    fields: [
        {
            name: 'name',
            type: 'text'
        }
    ]    
}