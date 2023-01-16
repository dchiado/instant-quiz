const AWS = require('aws-sdk');
const { Pool } = require("pg");
const WordExtractor = require("word-extractor"); 
const fs = require('fs');

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
    
    const quizFile = '/tmp/quiz.docx';
    fs.writeFile(quizFile, file.Body, (err) => {
      if (err) {
        console.log(err.code, "-", err.message);
      }
    });

    const extractor = new WordExtractor();
    const extracted = await extractor.extract(quizFile);
    let origBody = extracted.getBody().replace(/\n|\r/g, "");


    let type;
    let correct;
    let closeTag;
    let beginOpenTag;
    let endOpenTag;
    let openTag;
    let content;
    let rest;
    let body = origBody;
    let quiz = [];
    let questionObj;

    while (body.includes('[') && body.includes(']')) {
      correct = false
  
      // get next open tag
      beginOpenTag = body.indexOf('[');
      endOpenTag = body.indexOf(']');
      openTag = body.substring(beginOpenTag + 1, endOpenTag);
  
      // determine some stuff based on that
      switch (openTag) {
      case 'qa':
          // add previous question obj
          if (questionObj) {
              quiz.push(questionObj);
          }
  
          // reset question obj
          questionObj = {
              question: '',
              categories: [],
              answers: []
          };
  
          type = 'question';
          closeTag = 'qz';
          break;
      case 'ca':
          type = 'category';
          closeTag = 'cz';
          break;
      case 'aa':
          type = 'answer';
          closeTag = 'az';
          break;
      case 'xaa':
          type = 'answer';
          correct = true;
          closeTag = 'xaz';
          break;
      default:
          break;
      }
  
      // split by the open and close tags and store the rest back in body
      [content, ...rest] = body.substring(beginOpenTag + `[${openTag}]`.length).split(`[${closeTag}]`);
      body = rest.join(`[${closeTag}]`);
  
      // add content to appropriate part of questionObj
      switch (type) {
        case 'question':
          questionObj.question = content;
          break;
        case 'answer':
          questionObj.answers.push({
            answer: content,
            correct: correct
          });
          break;
        case 'category':
          questionObj.categories = content.split(',');
          break;
        default:
          break;
      }
    }
    
    // push one last time
    quiz.push(questionObj);
    
    console.log('Inserting quiz:');
    console.log(quiz);

    let pool;
    let db;

    try {
        // connect to db
        pool = await getDbPool();
        db = await pool.connect();
        console.log('Connected to database');
        await db.query("BEGIN");

        // define parameterized queries
        const insertQuestion = `
          INSERT INTO question(content, is_multiple_choice)
          VALUES($1, $2)
          RETURNING id;
        `;

        const insertCategory = `INSERT INTO category(name) VALUES($1) RETURNING id;`;

        const selectCategory = `SELECT id FROM category WHERE name = $1`;

        const insertQuestionCategory = `
          INSERT INTO question_category(question_id, category_id)
          VALUES($1, $2);
        `;

        const insertAnswer = `
          INSERT INTO answer(question_id, content, correct)
          VALUES($1, $2, $3);
        `;

        // loop through quiz array (each record is a question)
        for (const q of quiz) {
          // insert question
          const qRes = await db.query(insertQuestion, [q.question, q.answers.length > 1]);
          const questionId = qRes.rows[0].id;

          // loop through categories
          for (const c of q.categories) {
            // check if it exists
            const existingCat = await db.query(selectCategory, [c]);
            const categoryExists = existingCat.rows.length > 0;

            let categoryId;
            if (!categoryExists) {
              // add the category because it doesn't exist
              const cRes = await db.query(insertCategory, [c]);
              categoryId = cRes.rows[0].id;
            } else {
              // get the id of the existing one
              categoryId = existingCat.rows[0].id;
            }

            // insert question_category
            await db.query(insertQuestionCategory, [questionId, categoryId]);
          }

          // insert each answer
          for (const a of q.answers) {
            await db.query(insertAnswer, [questionId, a.answer, a.correct]);
          }

          console.log('Inserted question and answers');
        }

        await db.query("COMMIT");
    } catch (error) {
        console.log(`There was a problem querying the database: ${error} `);
        await db.query("ROLLBACK");
        throw error;
    } finally {
        if (pool) {
            try {
                await db.release(); // make sure it disconnects
            } catch (err) {
                console.error(`Error disconnecting from ${DB_NAME}`, err);
            }
        }
    }

    // return response
    const response = {
        statusCode: 200,
        body: 'Success!',
    };
    return response;
};

async function getDbPool() {
  try {
    return new Pool({
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
