#!/bin/bash

CONF_FILE="./cf.conf"
source $CONF_FILE

if [[ $1 == 'create' ]]; then
  cmd='create-stack'
else
  cmd='update-stack'
fi

aws cloudformation $cmd \
    --stack-name $STACK_NAME \
    --template-body "file://$TEMPLATE_FILE" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION \
    --parameters file://$PARAMS_FILE \
