const AWS = require('aws-sdk');
const pg = require('pg');

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD_PARAM = process.env.DB_PASSWORD_PARAM;

exports.handler = async () => {
    let conn;
    let categories;

    try {
        // connect to db and query for all categories
        conn = await getDbClient();
        await conn.connect();
        console.log('Connected to database');
        categories = await conn.query('SELECT id, name FROM category ORDER BY name;');
    } catch (error) {
        console.log(`There was a problem querying the database: ${error} `);
        throw error;
    } finally {
        if (conn) {
            try {
                await conn.end(); // make sure it disconnects
            } catch (err) {
                console.error(`Error disconnecting from ${DB_NAME}`, err);
            }
        }
    }

    // return categories
    const response = {
        statusCode: 200,
        body: JSON.stringify(categories.rows),
    };
    return response;
};

async function getDbClient() {
  try {
    const pwdParam = await getSSMParam(DB_PASSWORD_PARAM);
    return new pg.Client({
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USERNAME,
      password: pwdParam,
      port: 5432,
      ssl: true
    });
  } catch (error) {
    throw error;
  }
}

async function getSSMParam(paramName) {
  const ssm = new AWS.SSM({ region: 'us-east-2' });
  const options = {
    Name: paramName,
    WithDecryption: false
  };

  const paramValue = await ssm.getParameter(options).promise()
  .then((data) => data.Parameter.Value)
  .catch((err) => {
      console.error('failed to get param: ', err);
  });
  return paramValue;
}