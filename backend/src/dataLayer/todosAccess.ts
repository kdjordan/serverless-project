import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils' 

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { User } from '../models/User'

export class TodoAccess {
 
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly usersTable = process.env.USERS_TABLE ) {
  }

  async checkUserExists(event: APIGatewayProxyEvent): Promise<User> {
    try {
        // get ID from auth header
        const userId = getUserId(event)
    
        //see if user exists in USERS_TABLE
        const result = await this.docClient.query({
            TableName: this.usersTable,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': userId }
        }).promise()
        console.log("The result", result);
        
        const theUser = {
            count: result.Count,
            id: userId
        }
      return theUser
  
    } catch (e) {
      console.log("ERROR checking user in ACCESS", e);
    }
    
  }

  async addUser(userId: string): Promise<boolean> {
      try {
        const newId = { id: userId }

        await this.docClient.put({
            TableName: this.usersTable,
            Item: newId
        }).promise()

        return true

      } catch (e) {
          console.log("ERROR adding user in ACCESS", e)
      }

  }

   async getAllTodos(userId: string): Promise<TodoItem[]> {
     console.log('Getting all todos')

     let todos = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': userId
        }
    }).promise()

     const items = todos.Items
     return items as TodoItem[]
   }

   async createTodo(todoItem: TodoItem): Promise<TodoItem> {
     await this.docClient.put({
       TableName: this.todosTable,
       Item: todoItem
     }).promise()

     return todoItem
   }

//    async deleteTodo(todoItem: TodoItem): Promise<TodoItem> {
//     TableName: this.todosTable,
//       Key: { 
//         userId: id, 
//         todoId 
//       }
//     }).promise()

    //  return todoItem
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:3000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
