import { Frame, Page, Spinner,Heading} from "@shopify/polaris";
import OverlaySettings from './overlaySettings';
import { Query } from 'react-apollo';
import { QueryRootShopify } from '../../graphql';
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
const Index = (props) => {
    const prodGid = `gid://shopify/Product/${props.productId}`;

    const app = useAppBridge();
    const redirect = Redirect.create(app);
    
    return (
    <Query query={QueryRootShopify.GET_SHOPIFY_PRODUCT_INFO()} variables={{id:prodGid}}>
        {({ data, loading, error}) => {
            if(error) return <div>{error.message}</div>;
            if(loading){
                return <div style={{top:'50%', position: 'absolute',transform: 'translate(-50%,-50%)',left: '50%'}}><Spinner accessibilityLabel="Spinner" size="large" /></div>
            }
            return (
                <Frame>
                    <Page
                        breadcrumbs={[{content: 'Products', onAction:()=>{
                            redirect.dispatch(Redirect.Action.APP, {path: '/'});
                        }}]}
                        title={data?.product?.title}
                        fullWidth={true}
                    >            
                        <OverlaySettings {...props} prodData={data} />
                    </Page>
                </Frame>
            );
        }}
    </Query>
)};


export async function getServerSideProps(ctx){
    const { id } = ctx.params;
    if (!id) {
        return {
            notFound: true,
        }
    }
    return {
        props: {
            productId:id
        }, // will be passed to the page component as props
    }
};

export default Index;
