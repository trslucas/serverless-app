import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJs.NodejsFunction
  readonly productsAdminHandler: lambdaNodeJs.NodejsFunction
  readonly productsDdb: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.productsDdb = new dynamodb.Table(this, 'ProductsDdb', {
      tableName: 'products',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })

    // Products Layer

    const productsLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      'ProductsLayerVersionArn',
    )

    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'ProductsLayerVersionArn',
      productsLayerArn,
    )

    this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(
      this,
      'ProductsFetchFunction',
      {
        functionName: 'ProductsFetchFunction',
        entry: 'lambda/products/productsFetchFunction.ts',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        memorySize: 512,
        timeout: cdk.Duration.seconds(10),
        bundling: {
          minify: false,
          sourceMap: true,
        },
        environment: {
          PROCUTS_DDB: this.productsDdb.tableName,
        },
        layers: [productsLayer],
      },
    )

    this.productsDdb.grantReadData(this.productsFetchHandler)

    this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(
      this,
      'ProductsAdminFunction',
      {
        functionName: 'ProductsAdminFunction',
        entry: 'lambda/products/productsAdminFunction.ts',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        memorySize: 512,
        timeout: cdk.Duration.seconds(10),
        bundling: {
          minify: false,
          sourceMap: true,
        },
        environment: {
          PROCUTS_DDB: this.productsDdb.tableName,
        },
        layers: [productsLayer],
      },
    )
    this.productsDdb.grantWriteData(this.productsAdminHandler)
  }
}
