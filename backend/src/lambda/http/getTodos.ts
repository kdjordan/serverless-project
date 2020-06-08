import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAllTodos, checkUserExists, addUser } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try {
    // check to see if user exists in users table
    let theUser = await checkUserExists(event)
   
    // if so, get any todos they have
    if (theUser.count !== 0) {
      let todos = await getAllTodos(theUser.id)
    
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({items: todos})
      }
     

    } else {
      //add User to Users Table
      await addUser(theUser.id)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        // body: JSON.stringify({items: todos.Items})
        body: JSON.stringify({items: []})
      }

    }
  } catch (e) {
      console.log("ERROR in getTodos", e);
      
  }
}
