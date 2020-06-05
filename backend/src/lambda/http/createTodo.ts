import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
import { getUserId } from '../utils' 


const todosTable = process.env.TODOS_TABLE
import uuid from 'uuid'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const id = getUserId(event)

  console.log("Incoming Todo",newTodo)

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()

  const theTodo = {
    userId: id,
    todoId,
    createdAt,
    done: false,
    attatchmentUrl: '',
    ...newTodo
  }

  console.log("The created TODO is ", theTodo)

  await docClient.put({
    TableName: todosTable,
    Item: theTodo
  }).promise()

  console.log("The result from DynamDB")
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({item: theTodo})
  }
  
}
