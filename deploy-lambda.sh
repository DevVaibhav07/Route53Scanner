#!/bin/bash

# Target Account Credentials
export TARGET_ACCESS_KEY_ID=""
#your target access key id
export TARGET_SECRET_ACCESS_KEY=""
#your target secret access key
export TARGET_REGION=""
#your target region

# Configuration
STACK_NAME=""
#your stack name
REGION=""
#your region
SLACK_WEBHOOK_URL=""
#your slack webhook urls
S3_BUCKET=""
#your s3 bucket name
sam build
sam deploy --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        SlackWebhookUrl=$SLACK_WEBHOOK_URL \
        TargetAccessKeyId=$TARGET_ACCESS_KEY_ID \
        TargetSecretAccessKey=$TARGET_SECRET_ACCESS_KEY \
        TargetRegion=$TARGET_REGION \
    --s3-bucket $S3_BUCKET \
    --no-confirm-changeset 