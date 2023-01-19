const AWS = require('aws-sdk');
const pg = require('pg');
const { v4: uuidv4 } = require('uuid');
const { jsPDF } = require("jspdf");
const fs = require('fs');

// db info pulled from environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

exports.handler = async (event) => {
    const queryParams = event["queryStringParameters"];

    // get the already-generated quiz from DB or s3
    let quiz = [];
    // --------------------------------------------
    // creating a pdf file before uploading to s3
    // using this: https://github.com/parallax/jsPDF
    // --------------------------------------------
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const quizFile = '/tmp/quiz.pdf';
    const pdf = new jsPDF();
    let y = 20;

    // set title of file
    pdf.setFontSize(22);
    pdf.text('Trivia time!', 10, y);
    y += 10;

    // loop through each category
    quiz.forEach((cat) => {
        // go to next page if getting close to bottom
        if (y > 270) {
          y = 20;
          pdf.addPage();
        }

        pdf.setFontSize(14);
        y += 4; // space between header and first category
        pdf.text(cat.category.charAt(0).toUpperCase() + cat.category.slice(1), 10, y);
        y += 10; // space between category name and first question
        pdf.setFontSize(11);

        // loop through each question
        cat.questions.forEach((q, qIdx) => {
            // go to next page if getting close to bottom
            if (y > 270) {
              y = 20;
              pdf.addPage();
            }
  
            // turn question into array and loop over to achieve wrapping
            const questionContent = `${qIdx + 1}. ${q.question}`;
            const splitContent = pdf.splitTextToSize(questionContent, 170);
            for (let i = 0; i < splitContent.length; i++) {                
              pdf.text(splitContent[i], 20, y);
              y += 6; // space between question and first answer
            }

            // loop through each answer
            q.answers.forEach((a, aIdx) => {
                // include letter (e.g. A. ) if multiple choice question
                const prefix = q.multipleChoice ? letters[aIdx] + '. ' : '';
                // include (CORRECT) if that's the correct answer and it's multiple choid
                const suffix = q.multipleChoice && a.correct ? ' (CORRECT)' : '';
                const answerText = `${prefix}${a.content}${suffix}`
                pdf.text(answerText, 30, y);
                y += 6; // space between each answer
            })
            y += 4; // little extra space after last answer in question
        })
        y += 4; // little extra space after last question in category
    });


    // ---------------------------------------
    // TODO: the above questions have the correct answers labeled
    // we should probably do one with that as answer sheet and one without
    // ---------------------------------------


    // save file and file stream for s3 upload
    pdf.save(quizFile);
    const fileStream = fs.createReadStream(quizFile);

    // set up s3 client and params
    const s3 = new AWS.S3({
        region: 'us-east-2'
    });

    // generate unique key for this particular quiz file
    const uniqueDir = uuidv4();
    const key = `quizzes/${uniqueDir}/quiz.pdf`;

    // create params for the s3 client
    const params = {
        Bucket: 'quiz-download',
        Key: key,
    };
    
    // need the Body param when uploading
    const putParams = {
        ...params,
        Body: fileStream
    };

    // call putObject to upload file to s3
    await s3.putObject(putParams).promise()
    .then((data) => {
        console.info('successfully uploaded to s3: ' + data);
    })
    .catch((err) => {
        console.info('failed adding file to s3: ', err);
    });

    // need the Expires param when creating download link
    const getParams = {
        ...params,
        Expires: 300 // 5 minutes
    };

    // generate presignedUrl for the user to download file
    let url = await s3.getSignedUrlPromise('getObject', getParams)
    .then((data) => data)
    .catch((err) => {
        console.log('failed to get presigned url: ', err);
        return null;
    });

    // send back response
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            url: url,
        }),
    };
    return response;
};
