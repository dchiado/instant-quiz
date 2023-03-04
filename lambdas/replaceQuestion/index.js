const AWS = require('aws-sdk');
const pg = require('pg');

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD_PARAM = process.env.DB_PASSWORD_PARAM;
const QUIZ_DOWNLOAD_BUCKET = process.env.QUIZ_DOWNLOAD_BUCKET;

exports.handler = async (event) => {
  // get body and request info
  const body = JSON.parse(event.body);
  const quizPath = body.s3Path;
  const category = body.category;
  const questionId = body.questionId;
  const bucket = QUIZ_DOWNLOAD_BUCKET;

  // set up s3 client and params    
  const s3 = new AWS.S3({
    region: 'us-east-2'
  });

  const params = {
      Bucket: bucket,
      Key: quizPath
  };

  // download original quiz from s3
  const file = await s3.getObject(params).promise()
  .then((data) => data)
  .catch((err) => {
      console.log(`Error getting ${quizPath} from bucket ${bucket}`);
      console.error(err, err.stack);
  });

  // remove question specified in the request and create new quiz object
  const origQuiz = JSON.parse(file.Body);
  const catObj = origQuiz.find((q) => q.category === category);
  const questionIdx = catObj.questions.findIndex((q) => q.id.toString() === questionId);
  const newCatObjQuestions = catObj.questions.filter((q) => q.id.toString() !== questionId);
  const newCatObj = {
    category: category,
    questions: newCatObjQuestions
  }
  const quizWithoutCat = origQuiz.filter((q) => q.category !== category);

  // get all question ids in quiz to use in query
  const allQuestionIds = [];
  origQuiz.forEach((cat) => {
    console.log('cat' + cat);
    cat.questions.forEach((q) => {
      allQuestionIds.push(q.id);
    })
  })
  
  let conn;
  try {
      // connect to database
      conn = await getDbClient();
      await conn.connect();

      // query to get new question in this category
      const query = `
        SELECT
            q.id AS question_id,
            q.content AS question,
            q.is_multiple_choice,
            c.name AS category_name
        FROM question q
        LEFT JOIN question_category qc
        ON q.id = qc.question_id
        LEFT JOIN category c
        ON qc.category_id = c.id
        WHERE c.name = '${category}'
        AND q.id NOT IN (${allQuestionIds.join(',')})
        LIMIT 1
      `;

      // run query
      const questionResp = await conn.query(query);
      if (questionResp.rows.length > 0) {
        const newQuestion = questionResp.rows[0];
        
        // get all answer records associated with this question
        const answerResp = await conn.query(`SELECT question_id, content, correct FROM answer WHERE question_id = ${newQuestion.question_id};`);
        const answers = answerResp.rows;
        
        // inject this question-answer into the newCatObj
        const newQuestionObj = {
          question: newQuestion.question,
          id: newQuestion.question_id,
          multipleChoice: newQuestion.is_multiple_choice,
          answers: answers
        }
        newCatObj.questions.splice(questionIdx, 0, newQuestionObj);
      }
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

  // add newCatObj to quz
  const newQuiz = [
    ...quizWithoutCat,
    newCatObj
  ]

  // create upload params for the s3 client
  const putParams = {
    ...params,
    Body: JSON.stringify(newQuiz),
      ContentType: 'application/json',
  };

  // call putObject to upload new quiz file to s3
  await s3.putObject(putParams).promise()
  .then((data) => {
      console.info('successfully uploaded json to s3: ' + data);
  })
  .catch((err) => {
      console.info('failed adding file to s3: ', err);
  });

  // return new quiz object
  const response = {
      statusCode: 200,
      body: JSON.stringify(newQuiz),
  };
  return response;
};

async function getDbClient() {
  try {
    const pwd = await getSSMParam(DB_PASSWORD_PARAM);
    return new pg.Client({
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USERNAME,
      password: pwd,
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