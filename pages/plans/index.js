import React, {useCallback,useEffect,useState} from 'react';
import { Card, Layout, Page ,Stack,DisplayText,Button,SkeletonPage,SkeletonBodyText,Toast, Frame,Banner,Modal,TextContainer} from "@shopify/polaris";
import { useQuery ,useMutation} from 'react-apollo';
import { QueryRootShopify,MutationShopify} from '../../graphql';
import EmptyStateGlobal from '../../components/EmptyState';
import _ from 'lodash';
import moment from 'moment';
import {Redirect} from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const PlanIndex = (props) => {
    const { shop } = props;

    const { data, loading, error} = useQuery(QueryRootShopify.GET_PLANS(),{client:props.restClient});

    const respReasult = useQuery(QueryRootShopify.GET_OVERLAY_AND_PLAN_INFO_PROD_COUNT(),{client:props.restClient,variables: {shopName:shop}});

    const [queryToast, setQueryToast] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [disableOverlay,setDisableOverlay] = useState(false);
    const [chargeBanner,setChargeBanner] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [isPlanModalLoading, setIsPlanModalLoading] = useState(false);
    const [chooseNewPlanInfo, setChooseNewPlanInfo] = useState({});
    const [isPlanExpired, setIsPlanExpired] = useState(false);
    const [respReasultInfo, setRespReasultInfo] = useState(false);
    const [shopProductOverlayCount, setShopProductOverlayCount] = useState(0);
    
    const app = useAppBridge();
    const redirect = Redirect.create(app);
    
    useEffect(() => {
        let didCompleted = false;
        let respData = [];
        if(typeof respReasult?.data !='undefined' && respReasult?.data?.planProdInfo?.data!=undefined){
            respData = respReasult?.data?.planProdInfo?.data;
            let todayDate = new Date();
            var endDate = new Date(respData?.shop_plan_end_date);
            if((endDate!='' && respData?.shop_plan_access_products !='UNLIMITED' && endDate.getTime() <= todayDate.getTime()) || (respData.shop_plan_access_products <= respData.shop_product_overlay_count)){
                setChargeBanner([
                    <div kye="0">
                        <Banner
                            title="Plan expiration"
                            status="critical"
                        >
                            <p>Your current plan is expired now. Please upgrade your plan to continue with app.</p>
                        </Banner><br/>
                    </div>
                ]);
                setIsPlanExpired(true);
                setDisableOverlay(true);
            }
            setShopProductOverlayCount(respData?.shop_product_overlay_count)
            setRespReasultInfo(respReasult?.data?.planProdInfo?.data);
        }
        return () => {
            didCompleted = true;
        }
    }, [respReasult?.data]);
    
    useEffect(() => {
        let didCompleted = false;
        const activatedPlan = data?.plans?.data?.filter((plan) => {
            return plan?.plan_activated === 1 && (plan?.last_charge_status == 'cancelled' || plan?.last_charge_status == 'declined' || plan?.last_charge_status == 'expired' || plan?.last_charge_status == 'frozen');
        });
        if(!didCompleted && !_.isEmpty(activatedPlan)){
            let planWarninMsg = `Your billing is ${activatedPlan[0].last_charge_status}`;
            setChargeBanner([
                <div kye="0">
                    <Banner onDismiss={() => {setChargeBanner([])}} status="warning">
                        <p>{planWarninMsg}</p>
                    </Banner><br/>
                </div>
            ]);
            setDisableOverlay(true);
        }
        return () => {
            didCompleted = true;
        }
    }, [data])

    //#region Plan Section 
    const upgradePlan = (id,plan_title,plan_monthly_price,access_products) => {        
        setModalActive(true);
        setChooseNewPlanInfo({
            id:id,
            plan_title:plan_title,
            plan_monthly_price:plan_monthly_price,
            access_products:access_products,
        });
    }

    const planInfo = (planData) => {
        let menuItems = [];        
        if(!_.isEmpty(planData) && !_.isEmpty(planData?.plans)){
            let activatedPlan = planData?.plans?.data?.filter((plan) => {
                return plan?.plan_activated == 1;
            });
            let isFreePlan = false;
            if(Number(activatedPlan[0]?.plan_monthly_price) == 0){
                isFreePlan = true;
            }

            for (let i = 0; i < planData?.plans?.data?.length; i++) {
                var button = 
                            <React.Fragment>
                                <div className="plan_btn"></div>
                            </React.Fragment>;
                if(planData.plans.data[i].plan_monthly_price != 0){
                    if (planData.plans.data[i].plan_activated) {
                        button = 
                                <React.Fragment>
                                    <Button disabled>Current</Button>
                                </React.Fragment>;
                    } else {
                        button = 
                            <React.Fragment>
                                <Button 
                                    primary
                                    loading={isLoading}
                                    disabled={(planData.plans.data[i].access_products != "UNLIMITED" && shopProductOverlayCount >= Number(planData.plans.data[i].access_products) ? false : true)} 
                                    onClick={() => upgradePlan(planData.plans.data[i].id,planData.plans.data[i].plan_title,planData.plans.data[i].plan_monthly_price,planData.plans.data[i].access_products)}
                                >{(planData.plans.data[i].id <= 2 && !isFreePlan) ? 'Downgrade' : 'Upgrade'}
                                </Button>
                            </React.Fragment>;
                    }
                }
                menuItems.push(
                    <React.Fragment key={i}>
                        <Layout.Section oneThird>
                            <Card sectioned>
                                <Stack alignment="center" vertical={true} distribution="fill">
                                    <DisplayText size="large">{planData.plans.data[i].plan_title}</DisplayText>
                                    <DisplayText>{planData.plans.data[i].plan_monthly_price == 0 ? `${planData.plans.data[i].pm_trial_days} days free trial` : planData.plans.data[i].access_products+' Products'}</DisplayText>
                                    <DisplayText>{'$'+planData.plans.data[i].plan_monthly_price}</DisplayText>
                                    {button}
                                </Stack>
                            </Card>    
                        </Layout.Section>       
                    </React.Fragment>
                );
            }
            
            return(
                <React.Fragment>
                    {menuItems} 
                </React.Fragment>
            );
        }else{
            return(
                <React.Fragment>
                    <Layout.Section>
                        <EmptyStateGlobal/>
                    </Layout.Section>
                </React.Fragment>
            );
        }
    }

    const skeletonState = ()=>{
        return(
            <React.Fragment>
                <Layout.Section>
                    <Card sectioned>
                        <SkeletonPage>
                            <SkeletonBodyText lines={5} />
                        </SkeletonPage>
                    </Card>
                </Layout.Section>
            </React.Fragment>
        )
    }

    // select plan and insert plan record in db with pending status
    const [selectPlan, selectPlanRes] = useMutation(MutationShopify.SELECT_PLAN(),{client:props.restClient});
    const selectNewPlan = async (plan_id,plan_title,plan_monthly_price) => {
        setIsPlanModalLoading(true); 
        const selectPlanInfo = {
            'plan_id':plan_id,
            'start_date':moment().format('YYYY-MM-DD hh:mm:ss'),
            'charge_status':'pending',
            'status': parseInt(plan_monthly_price) == 0 ? 'Active' : 'Inactive',
            'plan_type':'MONTHLY',
            'plan_name':plan_title,
            'is_test':process.env.NEXT_PUBLIC_CHARGE_TEST ? true : false,
        };
        const { data, errors} = await selectPlan({variables:{selectPlanInfo}});

        if(parseInt(plan_monthly_price) == 0){
            let freePlanRedirectURl = process.env.NEXT_PUBLIC_HOST+process.env.NEXT_PUBLIC_FOLDER_PATH+`get-shopify-plan?shop_name=${shop}&sel_plan=${plan_id}&charge_id=`;
            redirect.dispatch(Redirect.Action.REMOTE, freePlanRedirectURl);    
            return true;            
        }

        if(!errors && data.selectPlan){
            let confirmation_url = await createNewSubscription(plan_id,plan_title,plan_monthly_price);

            redirect.dispatch(Redirect.Action.REMOTE, confirmation_url);            
        }
    };

    // create subscription in shopify    
    const [createSubscription, createSubscriptionRes] = useMutation(MutationShopify.CREATE_SUBSCRIPTION_IN_SHOPIFY());
    const createNewSubscription = async (plan_id,plan_title,plan_monthly_price) => {
        const returnUrl = process.env.NEXT_PUBLIC_HOST+process.env.NEXT_PUBLIC_FOLDER_PATH+`get-shopify-plan?shop_name=${shop}&sel_plan=${plan_id}`;
        const { data, errors} = await createSubscription({variables:{
            'name':plan_title,
            'returnUrl':returnUrl,
            'test': process.env.NEXT_PUBLIC_CHARGE_TEST ? true : false,
            "lineItems": [
                {
                    "plan": {
                        "appRecurringPricingDetails":{
                            "price": {
                                "amount": Number(plan_monthly_price).toFixed(2),
                                "currencyCode": "USD"
                            },
                            "interval": "EVERY_30_DAYS"
                        }
                    }
                }
            ]
        }});
        
        if(!errors && data.appSubscriptionCreate){
            let charge_id = data?.appSubscriptionCreate?.appSubscription?.id.replace('gid://shopify/AppSubscription/', '');
            let confirmation_url = data?.appSubscriptionCreate?.confirmationUrl;

            let isSubscriptionUpdated = await updateSubscriptionInfo(plan_id,charge_id,confirmation_url,returnUrl);

            if(isSubscriptionUpdated){
                return confirmation_url;
            }            
        }
    };

    // update plan info in db after create subscrption
    const [updateSubscription, updateSubscriptionRes] = useMutation(MutationShopify.UPDATE_SUBSCRIPTION_INFO_IN_DB(),{client:props.restClient});
    const updateSubscriptionInfo = async (plan_id,charge_id,confirmation_url,return_url) => {
        const subscriptionInfo = {
            'charge_id':charge_id,
            'return_url':return_url,
            'confirmation_url':confirmation_url
        };
        const { data, errors} = await updateSubscription({variables:{subscriptionInfo,id:plan_id}});

        if(!errors && data.updateSubscription){
           return true;
        }
    };
    //#endregion

    const handleModalChange = useCallback(() => {
        if(modalActive){
            setChooseNewPlanInfo({});
        }
        setModalActive(!modalActive);
        setIsLoading(false);
        setIsPlanModalLoading(false);        
    },[modalActive]);
    
    return(
        <Frame>
            <Page title={'Plans'} fullWidth={true}>
                {queryToast}
                {chargeBanner}
                {<Modal
                    open={modalActive}
                    onClose={handleModalChange}
                    title="Are you sure to change your plan?"
                    primaryAction={{
                        content: 'Yes,proceed',
                        onAction:()=>selectNewPlan(chooseNewPlanInfo.id,chooseNewPlanInfo.plan_title,chooseNewPlanInfo.plan_monthly_price),
                        loading:isPlanModalLoading
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: handleModalChange,
                            destructive:true,
                            disabled:isPlanModalLoading
                        },
                    ]}
                >
                    <Modal.Section>
                        <TextContainer>
                            {chooseNewPlanInfo.access_products == 'UNLIMITED' ? 
                                <p>You are going to choose {chooseNewPlanInfo.plan_title}. Here you can set overlay in {chooseNewPlanInfo.access_products} products.</p>
                                :
                                <p>You are going to choose {chooseNewPlanInfo.plan_title}. Here you can set overlay in max {chooseNewPlanInfo.access_products} products. If you have overlay in more than {chooseNewPlanInfo.access_products} products, then it will be removed.This can’t be undone</p>
                            }
                        </TextContainer>
                    </Modal.Section>
                </Modal>
                }
                <Layout>
                    {error ? <div>{error.message}</div> : null}
                    {loading ? skeletonState() : planInfo(data)}
                </Layout>
            </Page>
        </Frame>
    );
};

export async function getServerSideProps(ctx){
    const { shop } = ctx.query;
    if (!shop) {
        return {
            notFound: true,
        }
    }
    return {
        props: {
            shop:shop
        }, // will be passed to the page component as props
    }
};
export default PlanIndex;
