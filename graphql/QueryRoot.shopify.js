import gql from 'graphql-tag';

module.exports = {
    GET_PLANS: () => {
        return gql`
        query getPlans {
            plans @rest(method:"GET" type:"[Plan]", path:"plans") {
                code
                data
                message
                success
            }
        }`;
    },
    GET_OVERLAY_INFO_BY_PRODUCT_ID: () => {
        return gql`
        query getOverlays($productId: String!){
            overlays(productId:$productId) 
                @rest(method:"GET", type:"[Overlay]", path:"shop_product_overlays/{args.productId}") {
                code
                data
                message
                success
            }
        }`;
    },
    GET_SHOPIFY_PRODUCTS:() => {
        return gql`
        query getProducts ($first:Int, $after:String, $last:Int, $before:String, $query:String, $includeImage:Boolean!){
            products(first:$first,after:$after,last:$last,before:$before,query:$query){
            edges {
                cursor
                node {
                    id
                    legacyResourceId
                    title
                    tags
                featuredMedia @include(if:$includeImage){
                    preview{
                    image {
                        originalSrc
                        width
                        height
                    }
                    }
                }
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
            }
            }
        }`;
    },
    GET_SHOPIFY_PRODUCT_INFO:() => {
        return gql`
        query getProducts($id: ID!) {
            product(id: $id) {
                id
                legacyResourceId
                title
                featuredMedia {
                    preview {
                    image {
                        originalSrc
                        width
                        height
                    }
                    }
                }
            }
        }`;
    },
    GET_SETTINGS: () => {
        return gql`
        query getSettings {
            settings @rest(method:"GET" type:"[Setting]", path:"shop_settings") {
                code
                data
                message
                success
            }
        }`;
    },
    GET_BADGES: () => {
        return gql`
        query getBadges ($limit:Int, $after:String, $before:String){
            badges (limit:$limit,after:$after,before:$before)
            @rest(method:"GET", type:"[Badge]", path:"badges?{args}") {
                code
                data
                message
                success
            }
        }`;
    },
    GET_ACTIVE_PLAN: () => {
        return gql`
        query checkPlanStatus ($plan_id:ID!, $charge_id:ID!){
            plan (plan_id:$plan_id,charge_id:$charge_id)
            @rest(method:"GET", type:"plan", path:"plan?{args}") {
                code
                data
                message
                success
            }
        }`;
    },
    GET_OVERLAY_AND_PLAN_INFO_PROD_COUNT: () => {
        return gql`
        query getOverlays($shopName: String!){
            planProdInfo(shopName:$shopName) 
                @rest(method:"GET", type:"[PlanProdInfo]", path:"shop_overview/{args.shopName}") {
                code
                data
                message
                success
            }
        }`;
    }
};
