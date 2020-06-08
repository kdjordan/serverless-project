import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { User } from '../models/User'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { getUserId } from '../lambda/utils'

// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { APIGatewayProxyEvent } from 'aws-lambda'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function checkUserExists(event: APIGatewayProxyEvent): Promise<User> {
    const userId = getUserId(event)
    const theUser = await todoAccess.checkUserExists(userId)
    return theUser
}

export async function addUser(userId: string): Promise<User> {
  return await todoAccess.addUser(userId)
}

export async function createTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const itemId = uuid.v4()
    const userId = getUserId(event)

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        createdAt: new Date().toISOString(),
        attachmentUrl: '',
        done: false
    })
}

export async function updateTodo(event: APIGatewayProxyEvent): Promise<UpdateTodoRequest> {
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    
    console.log("THE TODO ID", todoId)
    console.log("THE UPDATED TODO", updatedTodo)

    return await todoAccess.updateTodo(todoId, userId, updatedTodo)
}

export async function deleteTodo(event: APIGatewayProxyEvent){
    let todoId = event.pathParameters.todoId
    let userId = getUserId(event)
    
    return todoAccess.deleteTodo(todoId, userId)
}
