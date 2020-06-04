import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils' 
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const usersTable = process.env.USERS_TABLE

import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  // console.log("Caller event", event.requestContext.authorizer.principalId)
  
  try {
    // check to see if user exists in users table
    const id = getUserId(event)
    
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
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({items: todos.Items})
      }
    } else {
      //if not add user to users table
      const newId = {
        id
      }

      await docClient.put({
        TableName: usersTable,
        Item: newId
      }).promise()

      console.log("REURNING")
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({items: []})
      }
    }
  } catch (e) {
    console.log("ERROR", e)
  }
}


async function checkUserExists(userId: string) {
  try {
    
    const result = await docClient.query({
      TableName: usersTable,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': userId }
    }).promise()
    
    return result.Count

  } catch (e) {
    
    return 0
  }
  
}
