const AWS = require('aws-sdk');
const pg = require('pg');
const WordExtractor = require("word-extractor"); 

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    AWS.config.update({region: 'us-east-2'});

    // get new file details from event notification from s3
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    
    // set up s3 client and params    
    const s3 = new AWS.S3();
    const params = {
        Bucket: bucket,
        Key: key
    };

    // download file from s3
    const file = await s3.getObject(params).promise()
    .then((data) => data)
    .catch((err) => {
        console.log(`Error getting ${key} from bucket ${bucket}`);
        console.error(err, err.stack);
    });
    console.log('file');
    console.log(file);

    const extractor = new WordExtractor();
    const extracted = extractor.extract(file);

    extracted.then((doc) => {
      const text = doc.getBody();
      console.log(text);
      text.split("\n").map((line) => {
        console.log(line);
      })
    });    
    
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
