import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAllTodos, checkUserExists, addUser } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try {
    // check to see if user exists in Users table
    let theUser = await checkUserExists(event)
    let todos = []

    // if so, get any todos they have
    if (theUser.count !== 0) {
      todos = await getAllTodos(theUser.id)
    } else {
      //add User to Users Table
      await addUser(theUser.id)
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({items: todos})
    }
   
  } catch (e) {
      console.log("ERROR in getTodos", e);
      
      return {
        statusCode: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({error: `${e}`})
      }
      
  }
}


