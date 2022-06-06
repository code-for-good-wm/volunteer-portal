import * as dotenv from 'dotenv';

const getConfig = async (log: any) => {
    // Load any ENV vars from local .env file
    if (process.env.NODE_ENV !== "production") {
        dotenv.config();
    }

    // load database configuration
    const databaseConn = process.env.DATABASE_URI;
    const databaseName  = process.env.DATABASE_NAME || 'cfg-volunteers';
    return {
        database: {
            connectionString: databaseConn,
            databaseName
        }
    };
};

export default getConfig;