import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const usersTable = process.env.USERS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  // console.log("Caller event", event.requestContext.authorizer.principalId)
  const id = getUserId(event)
  
  try {
    // check to see if user exists in users table
    const theCount = await checkUserExists(id)
    //if so, get any todos they have
    if (theCount !== 0) {
      let todos = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
      }).promise()

      return {
        statusCode: 201,
        headers: {
          'Access-Allow-Origin-Control': '*'
        },
        body: JSON.stringify({Items: todos})
      }
    }
  } catch (e) {
    console.log("ERROR", e)
  }
}

  //if not add user to users table


//   return {
//     statusCode: 201,
//     headers: {
//       'Access-Allow-Origin-Control': '*'
//     },
//     body: ''
//   }



async function checkUserExists(userId: string) {
  try {
    console.log("GOING IN")
    const result = await docClient.query({
      TableName: usersTable,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': userId }
    }).promise()
    return result.Count
  } catch (e) {
    console.log("ERROR", e)
    return false
  }
  
}

function getUserId(event: APIGatewayProxyEvent): string {
  const id = event.requestContext.authorizer.principalId
  return id.split("|")[1]
}