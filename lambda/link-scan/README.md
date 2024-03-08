# Link-scan architecture

## Overview
This is an AWS CDK application that invokes a Lambda function which runs a [linkinator](https://github.com/JustinBeckwith/linkinator) scan on the Clearviction website on a monthly schedule, and reports any broken links via SES.

## Components

### AWS Lambda

### Amazon Simple Email Service (SES)

### AWS Lambda

### AWS Identity and Access Management (IAM)

### AWS EventBridge Scheduler

## Overall Workflow

## Making Changes

1. Make changes
1. Empty `dist` folder
1. Run `npm run build`
1. Run `cdk deploy`
1. Test changes
1. Push changes to github