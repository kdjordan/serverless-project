import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { User } from '../models/User'

export class TodoAccess {
 
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly usersTable = process.env.USERS_TABLE ) {
  }

  async checkUserExists(userId: string): Promise<User> {
    try {
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

  async addUser(userId: string): Promise<User> {
      //add User to Users Table
      try {
        const newId = { id: userId }

        await this.docClient.put({
            TableName: this.usersTable,
            Item: newId
        }).promise()

        let user = {
            count: 0,
            id: newId.id
        }

        return user

      } catch (e) {
          console.log("ERROR adding user in ACCESS", e)
      }

  }

   async getAllTodos(userId: string): Promise<TodoItem[]> {
    try {
        let todos = await this.docClient.query({
           TableName: this.todosTable,
           KeyConditionExpression: 'userId = :id',
           ExpressionAttributeValues: {
               ':id': userId
           }
       }).promise()
   
        const items = todos.Items
        return items as TodoItem[]
    } catch (e) {
        console.log("ERROR getting todos in ACCESS", e)
    }
   }

   async createTodo(todoItem: TodoItem): Promise<TodoItem> {
       try {
           await this.docClient.put({
             TableName: this.todosTable,
             Item: todoItem
           }).promise()

           return todoItem

       } catch (e) {
           console.log("ERROR creating TODO in ACCESS")
       }

   }

   async updateTodo(todoId: string, userId: string, todoItem: TodoUpdate): Promise<Boolean> {
       console.log("THE INCOMING TODO ", todoItem)
       try {
           let todo = await this.docClient.update({
             TableName: this.todosTable,
             Key: {
                userId,
                todoId
              },
              UpdateExpression: "set theName = :n, isDone = :d, theDueDate = :due",
              ExpressionAttributeValues: {
                  ":n": todoItem.name,
                  ":d": todoItem.done,
                  ":due": todoItem.dueDate
              },
              ExpressionAttributeNames: {
                  "theName": 'name',
                  "isDone": 'done',
                  "theDueDate": 'dueDate'
              },
              ReturnValues:"UPDATED_NEW"
           }).promise()
           console.log("UPDATED TODO WITH ", todo)
           return true

       } catch (e) {
           console.log("ERROR updating TODO in ACCESS ", e)
       }

   }

   async deleteTodo(todoId: string, id: string): Promise<string> {
       try {
           await this.docClient.delete({
               TableName: this.todosTable,
               Key: { 
                   userId: id, 
                   todoId 
               }
               }).promise()
       
           return todoId
       } catch (e) {
        console.log("ERROR deleting TODO in ACCESS")
       }
    }
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
