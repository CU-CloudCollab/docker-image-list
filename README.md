# docker-image-list

This repo contains a Node.js script to list images in a Docker repository. The output of the script is stored on S3. Supplemental scripts create and upload an AWS Lambda function for the script and schedule the function to run daily.

This can be used as an example of:
* [Node.js](https://nodejs.org/en/) function in Lambda
* creating a Lambda function from the command line
* creating an AWS scheduled event from the command line
* linking an AWS scheduled event to a Lambda function (from the command line)

## JavaScripts

**lambda.js** contains a Node.js script for querying a Docker Trusted Repository and converting the resulting JSON to HTML.

**test.js** will run that script on a local machine, instead of in AWS Lambda. Command line:

  ```
  $ node test.js
  ```

## bash Scripts

**constants.sh** constants required for the bash scripts. Note that this script does NOT supply constants for lambda.js.

**go-upload.sh** zips the local lambda.js script and supporting Javascript modules into a Lambda-compatible package of code and uploads it to S3. This script is called by other scripts here.

**go-create.sh** creates the Lambda function, pointing it to the uploaded code package in S3.

**go-schedule.sh**  create an CloudWatch rule to be evaulated on a schedule. It connects the Lambda function to the rule and adds the necessary permission to the Lambda function that allows the event to trigger the funciton.

**go-update.sh** Updates the Lambda function with the current version of the local lambda.js file.

**go-invoke.sh** allows you to manually invoke the lambda.js functionality on Lambda

## Dependencies for Development

These scripts expect the following on your development workstation:
* [Node.js](https://nodejs.org/en/)
* [NOM](https://www.npmjs.com/)
* NPM modules:
  * [aws-sdk](https://www.npmjs.com/package/aws-sdk)
  * [node-json2html](https://www.npmjs.com/package/node-json2html)
  * [node-rest-client](https://www.npmjs.com/package/node-rest-client)
* [jq](https://stedolan.github.io/jq/)

## AWS Resource Dependencies

**S3.** These scripts expect an S3 bucket has already been created to use as the target for the Lambda code package, and for holding Lambda function outputs. In running these scripts you need enough privileges on S3 to create/update objects in this bucket.

In addition, the credentials for the DTR must be stored in the same S3 bucket. Use the template file `dtr-credentials.json` for the required format.

**IAM Role.** The IAM role referenced in these scripts is a role that combines AWSLambdaBasicExecutionRole (a standard built-in AWS role) and a custom role that gives the Lambda function access to the specified S3 bucket. That custom role is:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1460742559007",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:PutObjectVersionAcl"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:s3:::cu-cs-docker-registry-html/*"
        },
        {
            "Sid": "Stmt1460742559008",
            "Action": [
                "s3:GetObject"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:s3:::cu-cs-docker-registry-html/dtr-credentials.json"
        }
    ]
}
```





