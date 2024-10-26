#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductsAppStack } from '../lib/productsApp-stack'
import { EcommerceApiStack } from '../lib/ecommerceApi.stack'
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack'

// API GATEWAY

const app = new cdk.App()

const env: cdk.Environment = {
  account: '034362059843',
  region: 'us-east-1',
}

const tags = {
  cost: 'ECommerce',
  team: 'Trindade-Services',
}

const productsAppLayersStack = new ProductsAppLayersStack(
  app,
  'ProductsAppLayers',
  {
    tags,
    env,
  },
)

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  tags,
  env,
})

productsAppStack.addDependency(productsAppLayersStack)

const eCommerceApiStack = new EcommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
})

eCommerceApiStack.addDependency(productsAppStack)
