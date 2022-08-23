import EasyOverlayApi from '../components/EasyOverlayApi';
import _ from 'lodash';

module.exports = {
    async planManager(ctx,shop_name,host,charge_id,sel_plan){
        await fetchChargeFromShopify(shop_name, charge_id,sel_plan);
        return;
    }
};

async function fetchChargeFromShopify(shop_name, charge_id,sel_plan){
    const resp = await EasyOverlayApi.post('/shop_charge',{
        shop: shop_name,
        charge_id: charge_id,
        plan_id: sel_plan,
        update_charge_to_db : 'Yes'
    });
    return resp;
}