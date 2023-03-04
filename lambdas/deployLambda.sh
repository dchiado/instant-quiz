#!/bin/bash

if [[ $# -ne 2 ]]; then
  echo 'Please pass two arguments: the operation [uplaod | update] and the function name' && exit 1
elif [[ ! -d $2  ]]; then
  echo "Cannot find function directory named $2" && exit 1
else
  operation=$1
  function=$2
fi

bucket=instant-quiz-lambdas
key=$function.zip

cd $function && zip -q -r ../$function.zip * && cd -
[[ $? -ne 0 ]] && echo 'Failed to zip directory, please try manually' && exit 1

aws s3 cp $function.zip s3://$bucket/$key
[[ $? -ne 0 ]] && echo 'Failed to upload zip to s3, please try manually' && exit 1

if [[ $operation == 'update' ]]; then
  aws lambda update-function-code --function-name $function --zip-file fileb://$function.zip
  [[ $? -ne 0 ]] && echo 'Failed to deploy function code, please try manually' && exit 1
fi
