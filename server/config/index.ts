const getConfig = async () => {
  // load database configuration
  let databaseConn = process.env.DATABASE_URI;
  const databaseName = process.env.DATABASE_NAME || 'cfg-volunteers';
  
  // encode a passowrd if it's provided separately
  const databasePassword = process.env.DATABASE_PASS;
  if (databasePassword && databaseConn) {
    databaseConn = databaseConn.replace("__DB_PASS__", encodeURIComponent(databasePassword));
  }

  return {
    database: {
      connectionString: databaseConn,
      databaseName
    }
  };
};

export default getConfig;