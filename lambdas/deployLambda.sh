#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo 'Please pass one argument as the function name' && exit 1
elif [[ ! -d $1  ]]; then
  echo "Cannot find function directory named $1" && exit 1
else
  function=$1
fi

cd $function && zip -q -r ../$function.zip * && cd -
[[ $? -ne 0 ]] && echo 'Failed to zip directory, please try manually' && exit 1

aws lambda update-function-code --function-name $function --zip-file fileb://${function}.zip
[[ $? -ne 0 ]] && echo 'Failed to deploy function code, please try manually' && exit 1
