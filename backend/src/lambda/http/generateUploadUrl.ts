import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'

const imagesBucket = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log(todoId)
  // const imageId = new uuid.v4()
  try {
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: imagesBucket,
      Key: todoId,
      Expires: Number(urlExpiration)
    })    

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({uploadUrl})
    }

  } catch (e) {
    console.log("ERROR IN URL", e)
  }
  
}
