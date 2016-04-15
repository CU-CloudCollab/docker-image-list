#!/usr/bin/env bash

export CODE_ZIPFILE="lambda-code.zip"
export S3BUCKET="cu-cs-docker-registry-html"
export LAMBDA_NAME="dtr-image-list"
export LAMBDA_ROLE="arn:aws:iam::225162606092:role/dtr-image-list-lambda"
export STATEMENT_ID="MyStatementID"
export SCHEDULE_RULE="dtr-image-list-lambda-rule"
