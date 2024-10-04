import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function  handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {


const lambdaRequestId = context.awsRequestId
const apiRequestId = event.requestContext.requestId


console.log(`API Gateway RequestId: ${apiRequestId}`, `Lambda RequestId: ${lambdaRequestId}`)

const { httpMethod } = event
  if(event.resource === '/products') {
    if(httpMethod === 'GET') {
        console.log('GET')


        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Get products - OK'
          })
        }
    }
  }


  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad request"
    })
  }
}