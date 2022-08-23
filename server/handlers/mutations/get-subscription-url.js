import "isomorphic-fetch";

export function RECURRING_CREATE(
  url,
  isChargeTest,
  trialDays,
  planAmount,
  planName
) {
  return `
    mutation {
      appSubscriptionCreate(
          name: "${planName}"
          returnUrl: "${url}"
          test: ${isChargeTest}
          trialDays:${Number(trialDays)}
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: ${planAmount}, currencyCode: USD }
                }
              }
            }
          ]
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
    }`;
}

export const getSubscriptionUrl = async (ctx) => {
  const { client } = ctx;
  const shop = ctx.query.shop;
  const host = ctx.query.host;

  const confirmationUrl = await client
    .query({
      data: RECURRING_CREATE(
        `${process.env.HOST}/charge_accepted?shop=${shop}&host=${host}&plan_slug=${process.env.DEFAULT_PLAN_SLUG}`,
        process.env.CHARGE_TEST,
        process.env.CHARGE_TRIAL_DAYS,
        process.env.CHARGE_AMOUNT,
        process.env.CHARGE_PLAN_NAME
      ),
    })
    .then(
      (response) => response.body.data.appSubscriptionCreate.confirmationUrl
    );

  return ctx.redirect(confirmationUrl);
};
