import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { getUserId } from '../utils' 

import * as AWS  from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  console.log(todoId)
  console.log(updatedTodo)

  try {
    const id = getUserId(event)
    // const todo = {

    // }

    let response = await docClient.update({
      TableName: todosTable,
      Key: {
        userId: id,
        todoId
      },

    }).promise()

    console.log("RESPONSE", response)

  } catch (e) {
    console.log("ERROR UPDATING", e)
  }

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({item: updatedTodo})
  }
  
}
