import "@babel/polyfill";
import "isomorphic-fetch";
import dotenv from "dotenv";
dotenv.config();
import createShopifyAuth from "@shopify/koa-shopify-auth";
import { graphQLProxy } from "koa-shopify-graphql-proxy-cookieless";
import Shopify, { DataType } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import isVerified from "shopify-jwt-auth-verify";      
const jwt = require("jsonwebtoken");
import EasyOverlayApi from "../components/EasyOverlayApi";
import { RedisStorage } from "../utils";
const { WebhooksController, shopifyPlanController } = require("../controllers");
import { getSubscriptionUrl, getAppInstallation } from "./handlers";

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
let sessionStorage = new RedisStorage();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  //API_VERSION: ApiVersion.October20,
  API_VERSION: process.env.SHOPIFY_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionStorage.storeCallback.bind(sessionStorage),
    sessionStorage.loadCallback.bind(sessionStorage),
    sessionStorage.deleteCallback.bind(sessionStorage)
  ),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      accessMode: "offline",
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;

        console.log({ shop, accessToken, scope });

        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const client = new Shopify.Clients.Graphql(shop, accessToken);
        const objClient = new Shopify.Clients.Rest(shop, accessToken);
        ctx.client = client;

        //#region :- Register APP_UNINSTALLED Webhook
        /* const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            await WebhooksController.webhookManager(
              ACTIVE_SHOPIFY_SHOPS,
              ctx,
              topic,
              shop,
              body,
              accessToken
            ),
        });
        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        } */
        //#endregion

        //#region - Setup Webhooks New Code - Hookdeck
        const fetchWebhookRes = await objClient.get({ path: "webhooks" });
        const webhookTopicsRes =
          fetchWebhookRes?.body?.webhooks?.length > 0
            ? fetchWebhookRes?.body?.webhooks
            : [];

        let webhookPromise = Array();
        const webhook_topics = process.env.WEBHOOK_TOPICS.split(",");
        if (webhook_topics.length > 0) {
          for (let i = 0; i < webhook_topics.length; i++) {
            if (webhookTopicsRes?.length > 0) {
              const isWebhookExists = webhookTopicsRes.filter(
                (web) => web.topic === webhook_topics[i]
              );
              if (isWebhookExists[0]?.id) {
                const webhookId = isWebhookExists[0]?.id;
                await objClient.delete({
                  path: `webhooks/${webhookId}`,
                });
              }
            }

            webhookPromise.push(
              objClient.post({
                path: "/webhooks",
                data: {
                  webhook: {
                    topic: webhook_topics[i],
                    address: process.env.HOOKDECK_WEBHOOK_URL,
                    format: "json",
                  },
                },
                type: DataType.JSON,
              })
            );
          }

          if (webhookPromise.length > 0) {
            await Promise.all(webhookPromise);
          }
        }
        //#endregion

        await appSubscriptionWebhookReg(ctx);

        // await deleteSubscriptionWebhook(ctx);

        // await fetchAllWbResp(ctx);

        //#region :- Create and save token in DB
        await EasyOverlayApi.post("/shop-auth/create", {
          shop: shop,
          token: accessToken,
        });
        //#endregion

        const appInstall = await getAppInstallation(ctx);

        if (appInstall?.status === "ACTIVE") {
          ctx.redirect(`/?shop=${shop}&host=${host}`); // Redirect to dashboard
        } else {
          await getSubscriptionUrl(ctx); // redirect for subscription
        }
      },
    })
  );

  const appStatusCheck = async (ctx, shop) => {
    const { data } = await EasyOverlayApi.get(`/shop-auth/${shop}`);

    if (Number(data.code) == 200) {
      const accessToken = data.data.token;

      // GraphQLClient takes in the shop url and the accessToken for that shop.
      const client = new Shopify.Clients.Graphql(shop, accessToken);
      ctx.client = client;
      // get app install
      const appInstall = await getAppInstallation(ctx);

      if (appInstall?.status !== "ACTIVE") {
        delete ACTIVE_SHOPIFY_SHOPS[shop];
      }
      return true;
    } else {
      delete ACTIVE_SHOPIFY_SHOPS[shop];
      return true;
    }
  };

  const appSubscriptionWebhookReg = async (ctx) => {
    const { client } = ctx;
    const GqlQuery = `mutation {
      webhookSubscriptionCreate(
        topic: APP_SUBSCRIPTIONS_UPDATE
        webhookSubscription: {
          format: JSON,
          callbackUrl: "${process.env.HOOKDECK_WEBHOOK_URL}"
        }
      ) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
        }
      }
    }`;

    const appSubscriptionWebhookResp = await client
      .query({ data: GqlQuery })
      .then((response) => {
        console.log(JSON.stringify(response?.body?.data));
        return response;
      });

    return appSubscriptionWebhookResp;
  };

  const fetchAllWbResp = async (ctx) => {
    const { client } = ctx;
    const GqlQuery = `{
      webhookSubscriptions(first: 10) {
        edges {
          node {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
              ... on WebhookEventBridgeEndpoint {
                arn
              }
              ... on WebhookPubSubEndpoint {
                pubSubProject
                pubSubTopic
              }
            }
          }
        }
      }
    }`;

    const fetchAllWbRespInfo = await client
      .query({ data: GqlQuery })
      .then((response) => {
        console.log(JSON.stringify(response));
        return response;
      });

    return fetchAllWbRespInfo;
  };

  const deleteSubscriptionWebhook = async (ctx) => {
    const { client } = ctx;
    const GqlQuery = `mutation {
      webhookSubscriptionDelete(
        id: "gid://shopify/WebhookSubscription/1131891228892"
      ){
        userErrors {
          field
          message
        }
        deletedWebhookSubscriptionId
      }
    }`;

    const deleteSubscriptionWebhookResp = await client
      .query({ data: GqlQuery })
      .then((response) => {
        console.log(JSON.stringify(response));
        return response;
      });

    return deleteSubscriptionWebhookResp;
  };

  router.get("/charge_accepted", async (ctx, next) => {
    const charge_id = ctx.query.charge_id;
    const shop = ctx.query.shop;
    const host = ctx.query.host;
    const plan_slug = ctx.query.plan_slug;
    if (charge_id) {
      if (plan_slug) {
        await EasyOverlayApi.post("/shop_charge_by_plan_slug", {
          shop: shop,
          charge_id: charge_id,
          plan_slug: plan_slug,
        });
      }
      ctx.redirect(`${process.env.HOST}/?shop=${shop}&host=${host}`);
    } else {
      ctx.redirect(`/auth?shop=${shop}`);
    }
  });

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      ctx.response.status = 200;
      ctx.body = `Webhook processed, returned status code 200`;
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post("/cust-data-request", async (ctx) => {
    try {
      ctx.response.status = 200;
      ctx.body = `OK`;
    } catch (error) {
      console.log(`${error}`);
    }
  });

  router.post("/cust-data-erasure", async (ctx) => {
    try {
      ctx.response.status = 200;
      ctx.body = `OK`;
    } catch (error) {
      console.log(`${error}`);
    }
  });

  router.post("/shop-data-erasure", async (ctx) => {
    try {
      ctx.response.status = 200;
      ctx.body = `OK`;
    } catch (error) {
      console.log(`${error}`);
    }
  });

  router.post("/graphql", async (ctx, next) => {
    const bearer = ctx.request.header.authorization;
    const secret = process.env.SHOPIFY_API_SECRET;
    const apiKey = process.env.SHOPIFY_API_KEY;
    const valid = isVerified(bearer, secret, apiKey);

    if (valid) {
      const token = bearer.split(" ")[1];
      const decoded = jwt.decode(token);
      const shop = new URL(decoded.dest).host;
      const { data } = await EasyOverlayApi.get(`/shop-auth/${shop}`);
      if (data) {
        const accessToken = data.data.token;
        const proxy = graphQLProxy({
          shop: shop,
          password: accessToken,
          version: process.env.SHOPIFY_API_VERSION,
        });
        await proxy(ctx, next);
      } else {
        ctx.res.statusCode = 403;
      }
    }
  });

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    ctx.set(
      "Content-Security-Policy",
      `frame-ancestors https://${shop} https://admin.shopify.com;`
    );

    // check for app charge
    if (shop) {
      await appStatusCheck(ctx, shop);
    }

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      if (ctx.url.includes("/get-shopify-plan")) {
        const { shop_name, charge_id, sel_plan } = ctx.query;
        const host = Buffer.from(shop_name + "/admin").toString("base64");

        await shopifyPlanController.planManager(
          ctx,
          shop_name,
          host,
          charge_id,
          sel_plan
        );
        ctx.redirect(`/?shop=${shop_name}&host=${host}`);
      } else {
        ctx.redirect(`/auth?shop=${shop}`);
      }
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
