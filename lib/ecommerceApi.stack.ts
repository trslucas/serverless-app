import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as cwlogs from 'aws-cdk-lib/aws-logs'

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction
  productsAdminHandler: lambdaNodeJs.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props)

    const logGroup = new cwlogs.LogGroup(this, 'ECommerceApiLogs')
    const api = new apiGateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    })

    const productsFetchIntegration = new apiGateway.LambdaIntegration(
      props.productsFetchHandler,
    )
    // GET "/products"
    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET', productsFetchIntegration)

    // GET "/products/id"
    const productIdResource = productsResource.addResource('{id}')
    productIdResource.addMethod('GET', productsFetchIntegration)

    const productsAdminIntegration = new apiGateway.LambdaIntegration(
      props.productsAdminHandler,
    )
    // POST "/products"
    productsResource.addMethod('POST', productsAdminIntegration)

    // PUT "/products/id"

    productIdResource.addMethod('PUT', productsAdminIntegration)

    // DELETE "/products/id"

    productIdResource.addMethod('DELETE', productsAdminIntegration)
  }
}
