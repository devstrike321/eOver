import gql from "graphql-tag";

module.exports = {
  SAVE_OVERLAY_SETTINGS: () => {
    return gql`
      mutation addEditOverlay($input: overlayData!) {
        addEditOverlay(input: $overlayData)
          @rest(type: "Overlay", path: "shop_product_overlay", method: "POST") {
          code
          data
          message
          success
        }
      }
    `;
  },
  DELETE_OVERLAY_SETTING: () => {
    return gql`
      mutation deleteOverlay($id: ID!) {
        deleteOverlay(id: $id)
          @rest(
            type: "Overlay"
            path: "shop_product_overlay/{args.id}"
            method: "DELETE"
          ) {
          code
          message
          success
        }
      }
    `;
  },
  CHANGE_OVERLAY_STATUS: () => {
    return gql`
      mutation changeOverlayStatus($input: changeOverlayStatusData!, $id: ID!) {
        changeOverlayStatus(input: $changeOverlayStatusData, id: $id)
          @rest(
            type: "Overlay"
            path: "shop_product_overlay_status/{args.id}"
            method: "PUT"
          ) {
          code
          data
          message
          success
        }
      }
    `;
  },
  CHANGE_APP_STATUS: () => {
    return gql`
      mutation changeAppStatus($input: changeAppStatusData!) {
        changeAppStatus(input: $changeAppStatusData)
          @rest(type: "AppStatus", path: "shop_settings", method: "POST") {
          code
          message
          success
        }
      }
    `;
  },
  SELECT_PLAN: () => {
    return gql`
      mutation selectPlan($input: selectPlanInfo!) {
        selectPlan(input: $selectPlanInfo)
          @rest(type: "SelectPlan", path: "shop_plan", method: "POST") {
          code
          data
          message
          success
        }
      }
    `;
  },
  CREATE_SUBSCRIPTION_IN_SHOPIFY: () => {
    return gql`
      mutation appSubscriptionCreate(
        $name: String!
        $returnUrl: URL!
        $test: Boolean!
        $lineItems: [AppSubscriptionLineItemInput!]!
      ) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: $test
          lineItems: $lineItems
        ) {
          userErrors {
            field
            message
          }
          confirmationUrl
          appSubscription {
            id
          }
        }
      }
    `;
  },
  UPDATE_SUBSCRIPTION_INFO_IN_DB: () => {
    return gql`
      mutation updateSubscription($input: subscriptionInfo!, $id: ID!) {
        updateSubscription(input: $subscriptionInfo, id: $id)
          @rest(
            type: "Subscription"
            path: "shop_plan/{args.id}"
            method: "PUT"
          ) {
          code
          data
          message
          success
        }
      }
    `;
  },
  SYNC_SHOPIFY_PRODUCTS: () => {
    return gql`
      mutation getOverlays($filter: Filter!) {
        overlays(filter: $filter)
          @rest(method: "GET", type: "Products", path: "shop_products/sync") {
          code
          data
          message
          success
        }
      }
    `;
  },
  EXPORT_OVERLAYS: () => {
    return gql`
      mutation getOverlays($filter: Filter!) {
        overlays(filter: $filter)
          @rest(
            method: "GET"
            type: "[Overlay]"
            path: "shop_product_overlays/export/{args.filter}"
          ) {
          code
          data
          message
          success
        }
      }
    `;
  },
  IMPORT_OVERLAYS: () => {
    return gql`
      mutation importOverlays($input: data!) {
        importOverlays(input: $data)
          @rest(
            type: "Overlay"
            path: "shop_product_overlays/import"
            method: "POST"
          ) {
          code
          data
          message
          success
        }
      }
    `;
  },
};
