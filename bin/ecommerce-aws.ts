#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductsAppStack } from '../lib/productsApp-stack'
import { EcommerceApiStack } from '../lib/ecommerceApi.stack'

const app = new cdk.App()

const env: cdk.Environment = {
  account: '034362059843',
  region: 'us-east-1',
}

const tags = {
  cost: 'ECommerce',
  team: 'Trindade-Services',
}

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  tags,
  env,
})

const eCommerceApiStack = new EcommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags,
  env,
})

eCommerceApiStack.addDependency(productsAppStack)
