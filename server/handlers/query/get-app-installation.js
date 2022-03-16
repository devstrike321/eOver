import "isomorphic-fetch";

export function GET_APP_INSTALLATION() {
  return `
    query {
      appByKey(apiKey:"${process.env.SHOPIFY_API_KEY}") {
        installation {
          launchUrl
          activeSubscriptions {
            id
            name
            status
            test
            trialDays
            returnUrl
            createdAt
            currentPeriodEnd
          }
        }
      }
    }`;
}

export const getAppInstallation = async (ctx) => {
  const { client } = ctx;
  const appInstallation = await client
    .query({
      data: GET_APP_INSTALLATION(),
    })
    .then((response) => {
      let activeSubscriptions =
        response?.body?.data?.appByKey?.installation?.activeSubscriptions;
      let currentActiveSubscription = activeSubscriptions?.filter(
        (activeSubscription) => {
          return activeSubscription?.status === "ACTIVE";
        }
      );
      return currentActiveSubscription[0] || [];
    });

  return appInstallation;
};
