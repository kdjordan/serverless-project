// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'v1a0pp27j8'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'kj-udagram.auth0.com',            // Auth0 domain
  clientId: 'xpGYMPm6aRXQE2mCqGyl0A2UHkM8sViG',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
