const AWS = require('aws-sdk');
const pg = require('pg');
const { v4: uuidv4 } = require('uuid');

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    // get body and request info
    const body = JSON.parse(event.body);
    const categories = body.categories;
    const stringifiedCategories = categories.map((c) => `'${c}'`);
    const questionsPer = body.questionsPer;

    // define initial quiz object that will be built upon
    const quiz = categories.map((c) => {
        return { category: c, questions: [] };
    });

    let conn;
    try {
        // connect to database
        conn = await getDbClient();
        await conn.connect();

        // define the query, which will probably not scale well
        // 1. use JOINs to get all questions associated (via question_category table) to categories passed in, and order randomly
        // 2. select DISTINCT ON the quetion_id column to remove dupes
        // 3. add the row number with PARTITION ON to include count for each category
        // 4. limit each category to questionsPer with z.r <=
        //
        // the main issue is that we need to remove duplicates before applying the limit, or some categories will come up short
        // and we cannot use LIMIT, because the limit needs to be applied to each category, not as a whole
        const query = `
            SELECT *
            FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY category_id) AS r
                FROM (
                    SELECT DISTINCT ON (question_id) *
                        FROM (
                            SELECT
                                q.id AS question_id,
                                q.content AS question,
                                q.is_multiple_choice,
                                c.id AS category_id,
                                c.name AS category_name
                            FROM question q
                            LEFT JOIN question_category qc
                            ON q.id = qc.question_id
                            LEFT JOIN category c
                            ON qc.category_id = c.id
                            WHERE c.name IN (${stringifiedCategories})
                            ORDER BY RANDOM()
                        ) as x
                    ) as y
                ) as z
            WHERE z.r <= ${questionsPer};
        `;

        // run query
        const questionResp = await conn.query(query);

        // get question details and question ids
        const questions = questionResp.rows;
        const questionIds = questions.map((q) => q.question_id);

        // get all answer records associated with these questions
        const answerResp = await conn.query(`SELECT question_id, content, correct FROM answer WHERE question_id IN (${questionIds});`);
        const answers = answerResp.rows;

        // loop through questions/answers and add them to the right category in 'quiz' json object
        questions.forEach((q) => {
            quiz.find(x => x.category === q.category_name).questions.push({
                id: q.question_id,
                question: q.question,
                answers: answers.filter((a) => a.question_id === q.question_id),
                multipleChoice: q.is_multiple_choice
            });
        });
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

    // set up s3 client and params
    const s3 = new AWS.S3({
      region: 'us-east-2'
    });

    // generate unique key for this particular quiz file
    const jsonDir = uuidv4();
    const jsonKey = `drafts/${jsonDir}/quiz.json`;

    // create params for the s3 client
    const putJsonParams = {
        Bucket: 'quiz-download',
        Key: jsonKey,
        Body: JSON.stringify(quiz),
        ContentType: 'application/json',
    };

    // call putObject to upload file to s3
    await s3.putObject(putJsonParams).promise()
    .then((data) => {
        console.info('successfully uploaded json to s3: ' + data);
    })
    .catch((err) => {
        console.info('failed adding file to s3: ', err);
    });

    // send back response
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            quiz: quiz,
            s3Path: jsonKey
        }),
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

