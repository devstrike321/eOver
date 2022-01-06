import EasyOverlayApi from '../components/EasyOverlayApi';
import _ from 'lodash';

module.exports = {
    async webhookManager(ACTIVE_SHOPIFY_SHOPS, ctx, topic, shop, body,accessToken){
        try{
            switch(topic) {
                case 'APP_UNINSTALLED':
                    appUninstallWebhook(ACTIVE_SHOPIFY_SHOPS, topic, shop, body,accessToken);
                    break;
                case 'APP_SUBSCRIPTIONS_UPDATE':
                    appSubscriptionUpdateWebhook(ACTIVE_SHOPIFY_SHOPS, topic, shop, body);
                    break;
            }
        }
        catch (err){
            ctx.throw(500, err);
        }
    }
};

async function appUninstallWebhook(ACTIVE_SHOPIFY_SHOPS, topic, shop, body,accessToken){
    delete ACTIVE_SHOPIFY_SHOPS[shop];

    try {
        const result = await EasyOverlayApi.post(`/shop-auth/uninstall`,{
            shop: shop,       
            token:accessToken
        });    
        return result;
    } catch (error) {
        return error;
    }
}

async function appSubscriptionUpdateWebhook(ACTIVE_SHOPIFY_SHOPS, topic, shop, body){
    let wbResp = JSON.parse(body);
    let charge_id = wbResp?.app_subscription?.admin_graphql_api_id.replace('gid://shopify/AppSubscription/', '');
    let charge_status = (wbResp?.app_subscription?.status).toLowerCase();
    let updated_at = wbResp?.app_subscription?.updated_at;

    try {
        const result = await EasyOverlayApi.put(`/shop_plan/${charge_id}`,{
            shop: shop,       
            env:'test',
            charge_status:charge_status,
            cancelled_on: (charge_status == 'declined' || charge_status == 'cancelled' || charge_status == 'expired') ? updated_at : ''
        });    
        return result;
    } catch (error) {
        return error;
    }
}