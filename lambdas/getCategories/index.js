const pg = require('pg');

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async () => {
    let conn;
    let categories;

    try {
        // connect to db and query for all categories
        conn = await getDbClient();
        await conn.connect();
        console.log('Connected to database');
        categories = await conn.query('SELECT id, name FROM category;');
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
    return new pg.Client({
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      port: 5432,
      ssl: true
    });
  } catch (error) {
    throw error;
  }
}
