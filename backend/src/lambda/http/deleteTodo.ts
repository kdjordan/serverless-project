import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils' 
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  console.log("TODO to be deleted", todoId)
  try {
    const id = getUserId(event)
    let response = await docClient.delete({
      TableName: todosTable,
      Key: { userId: id, todoId }
    }).promise()
  
    console.log("DB response", response);
  } catch (e) {
    console.log("Error", e)
  }

  // TODO: Remove a TODO item by id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }

}