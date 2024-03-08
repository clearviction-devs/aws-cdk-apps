import { Handler } from "aws-cdk-lib/aws-lambda"
import { LinkChecker } from "linkinator"
import * as AWS from "aws-sdk"

const SES_EMAIL_FROM = 'info@clearviction.org'
const SES_EMAIL_TO = 'info@clearviction.org'

interface LinkData {
    passed: boolean
    linksScanned: number
    brokenLinksCount: number
    brokenLinks: {
        url: string
        parent?: string
    }[]
}

export const handler: Handler = async () => {
    try {
        const returnData: LinkData = await checkLinks()
    
        const response = {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(returnData)
        }
    
        if (!returnData.passed) {
            await sendEmail(returnData)
        }
    
        return response
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ message: 'An error occurred while scanning the links', error })
        }
    }
}

const checkLinks = async () => {
    const checker = new LinkChecker()
    const brokenLinks: LinkData["brokenLinks"] = []

    checker.on('link', result => {

        if (result.state === 'BROKEN') {
            const newBrokenLink = {
                url: result.url,
                parent: result.parent
            }
            brokenLinks.push(newBrokenLink)
        }
    })

    const result = await checker.check({
        path: 'http://clearviction.org',
        recurse: true,
    })

    const brokenLinksCount = result.links.filter(x => x.state === 'BROKEN')

    return {
        passed: result.passed,
        linksScanned: result.links.length,
        brokenLinksCount: brokenLinksCount.length,
        brokenLinks
    }
}

const sendEmail = async (data: LinkData) => {
    const ses = new AWS.SES({region: 'us-west-2'})
    const scanDate = new Date().toLocaleString()
    await ses.sendEmail(sendEmailParams(data, scanDate)).promise()

    return
}

const sendEmailParams = ({passed, linksScanned, brokenLinksCount, brokenLinks}: LinkData, scanDate: string) => {
    return {
        Destination: {
            ToAddresses: [SES_EMAIL_TO],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: getHtmlContent({passed, linksScanned, brokenLinksCount, brokenLinks}),
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: `Linkinator Report: ${scanDate}`,
            },
        },
        Source: SES_EMAIL_FROM,
    }
}

const getHtmlContent = ({passed, linksScanned, brokenLinksCount, brokenLinks}: LinkData) => {
    return `
        <html>
            <body>
                <h1>Linkinator scan results 👀</h1>
                <ul>
                    <li style="font-size:18px">Passed: <b>${passed}</b></li>
                    <li style="font-size:18px">Links scanned: <b>${linksScanned}</b></li>
                    <li style="font-size:18px">Broken links found: <b>${brokenLinksCount}</b></li>
                </ul>
                <h2>Broken links:</h2>
                ${mapBrokenLinks(brokenLinks)}
            </body>
        </html>
    `
}

const mapBrokenLinks = (brokenLinks: LinkData["brokenLinks"]) => {
    return brokenLinks.map(link => {
        return `<div>
                    <p style="font-size:14px"><b>Broken link url:</b> <a href="${link.url}">${link.url}</a></p>
                    <p style="font-size:14px">Found on CV website page: <a href="${link.parent}">${link.parent}</a></p>
                </div>`
    })
}