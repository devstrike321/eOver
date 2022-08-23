const Router = require('koa-router');
const customRouter = new Router;
import bodyParser from "koa-parser";

const {shopifyPlanController} = require('../controllers');

customRouter.use(bodyParser());

//recurring plan callback
customRouter.get('/get-shopify-plan', shopifyPlanController.getShopifyPlan);

module.exports = {customRouter};