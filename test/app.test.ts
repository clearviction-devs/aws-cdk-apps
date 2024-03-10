import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { test } from 'vitest'

import * as LinkScan from '../lib/link-scan/link-scan-stack'

test('Lambda Created', () => {
    const app = new cdk.App()
    const stack = new LinkScan.LinkScanStack(app, 'MyTestStack')

    const template = Template.fromStack(stack)

    template.hasResource('AWS::Lambda::Function', {
        Properties: {
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
        },
    })
})
