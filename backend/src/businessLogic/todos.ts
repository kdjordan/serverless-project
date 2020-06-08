import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { User } from '../models/User'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'

// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { APIGatewayProxyEvent } from 'aws-lambda'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function checkUserExists(event: APIGatewayProxyEvent): Promise<User> {
    const theUser = await todoAccess.checkUserExists(event)
    return theUser
}

export async function addUser(userId: string): Promise<boolean> {
  return todoAccess.addUser(userId)
}



export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}
