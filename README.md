# Trivia Generator

This app randomly generates a pub quiz based on categories selected by the user

## Frontend

The frontend of this project and built with [ReactJS](https://reactjs.org/) and was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Backend

The backend API lives in AWS. A few different services are used to store, retrieve, parse, and return data. All resources live in the us-east-2 (Ohio) region.

### API Gateway

The API endpoints are defined in [AWS API Gateway](https://aws.amazon.com/api-gateway/). They are HTTP APIs and both trigger Lambdas for processing requests. The two endpoints are:
- GET /categories
- GET /questions

### Lambda

Each API endpoint triggers a different [Lambda](https://aws.amazon.com/lambda/).
- Calling GET /categories triggers the `getCategories` lambda which retrieves and returns a list of all categories stored in the database
- Calling GET /questions triggers the `getQuestions` lambda. It expects query params to be passed in called `categories` and `questionsPer`. The endpoint should look something like this: `/questions&categories=literature,geography,science&questionsPer=10`. It will get 10 questions associated with each of these categories.

### RDS

The database is a [postgres database](https://www.postgresql.org/) built on [RDS](https://aws.amazon.com/rds/) in AWS. The data model and some basic seed files are stored in the `db/` directory in this repo.

## Setup

1. Install node v16. I recommend using [NVM](https://github.com/nvm-sh/nvm) to manage node. If you install nvm, you can run `nvm install 16`.
1. Create a `.env` file in the project root and add these variables
    ```
    REACT_APP_API_URL=<get url of api gateway>
    ```
1. Install npm packages
    ```
    npm install
    ```
1. Start the app
    ```
    npm start
    ```
## Deployment

### React app frontend
The react app is deployed to a public s3 bucket called `quiz-react-app`. Follow these steps to deploy it.

1. From the root dir of the repo, run `npm run build`
1. In the S3 bucket, click upload and upload all files found in the `build/` directory of the repo
1. The app should be available at the URL found in the bucket under Properties > Static Website Hosting > Bucket website endpoint

### Lambdas

Due to npm package dependencies, lambdas should be edited in this repo and deployes with the aws cli. Follow these steps to develop them.

1. Make sure you have the aws cli [installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
1. Export the AWS credentials for the IAM user that can deploy lambdas.
1. Inside the `lambda/` dir, there are subdirectories for each lambda. Inside each one is the `index.js` that is the source code of the lambda. Edit is as necessary.
1. If you need to include new npm packages, run `npm install <package>` from inside that directory.
1. To deploy, make sure you are the lambda directory that has the `index.js`. Run the bash script, passing in the function name, to deploy them and the node_modules to AWS.
    ```
    ./deployLambda.sh getQuestions
    ```
1. If it fails and you need to do it manually, you can zip up the lambda dir with `zip -r ../getCategories.zip *`, then find the function in AWS and do Upload From > .zip file and select the new zip file

## Data Flow

Here is the current flow of data through the system

- User loads the webpage
- GET request made to /categories which triggers the `getAllCategories` lambda and returns all categories in DB
- User selects the desired categories and clicks "Make me a quiz"
- POST request made to /quiz which triggers the `getQuestions` lambda which:
  - Queries the DB for questions and answers in the chosen categories
  - Generates a quiz object and loads it into s3
  - Returns the quiz object
- The quiz object is displayed on the screen
- User clicks X on a question to replace it in the quiz
- PATCH request made to /quiz which triggers the `replaceQuestion` lambda which:
  - Gets the quiz object from s3
  - Removes the question that was removed by the user
  - Queries the DB for a new question and adds it to the quiz
  - Reuploads the quiz to s3 and returns it back to the UI
- User clicks "Download Quiz"
- GET request made to /quiz which triggers the `createQuiz` lambda which:
  - Gets the quiz object from s3
  - Generates a pdf from that quiz json object
  - Uploads the pdf into s3
  - Creates a presigned URL for that object
  - Returns the presigned URL to the UI
- The UI redirects to the presigned URL which downloads the object
