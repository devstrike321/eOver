import React, {useState} from 'react';
import { SettingToggle, Page,TextContainer, TextStyle,Layout,FormLayout,Toast,Frame,Spinner} from "@shopify/polaris";
import { Query,useMutation } from 'react-apollo';
import { QueryRootShopify,MutationShopify } from '../../graphql';
const Index = (props) => {
    let handleRefresh = null;
    const [appEnable, setAppEnable] = useState(false);
    const [queryToast, setQueryToast] = useState([]);
    const [pageTitle, setPageTitle] = useState('');
    const contentStatus = appEnable ? 'Disable' : 'Enable';
    const textStatus = appEnable ? 'Enabled' : 'Disabled';
    const [changeAppStatus, changeAppStatusRes] = useMutation(MutationShopify.CHANGE_APP_STATUS(),{client:props.restClient});
    const handleToggle = async (value) => {
        setAppEnable((value) => !value);
        const changeAppStatusData = {
            'is_enable':appEnable ? 'Inactive' : 'Active'
        };
        const { data, errors} = await changeAppStatus({variables:{changeAppStatusData}});
        if(!errors && data.changeAppStatus){            
            setQueryToast([<Toast onDismiss={() => {
                setQueryToast([]);
            }} duration="1500" key='toast-msg' content={data.changeAppStatus.message} error={Number(data.changeAppStatus.code) !== 200 ? true : false} />]);
            handleRefresh();
        }
    };
    return (
    <Frame>
        <Page title={pageTitle}>
            {queryToast}
            <Query query={QueryRootShopify.GET_SETTINGS()} client={props.restClient}>
            {({ data, loading, error, refetch}) => {
                handleRefresh = () => {
                    refetch();
                }
                let setting_data = [];
                if(!loading){
                    if(typeof data!='undefined' && data.settings?.data!=undefined){
                        setting_data = data.settings.data;
                        setAppEnable(setting_data.is_enable == 'Active' ? true : false);
                        setPageTitle('Settings');
                    }
                }
                if(loading){
                    return <div style={{top:'50%', position: 'absolute',transform: 'translate(-50%,-50%)',left: '50%'}}><Spinner accessibilityLabel="Spinner" size="large" /></div>
                }
                if(error) return <div>{error.message}</div>;
                return (
                    <Layout>
                        <Layout.AnnotatedSection title="App state" description="The entire app can be turned on or off by changing this setting.">
                            <FormLayout>
                                <SettingToggle
                                    action={{
                                        content: contentStatus,
                                        onAction: handleToggle,
                                        loading:changeAppStatusRes.loading
                                    }}
                                    enabled={appEnable ? true : false}
                                >
                                    <TextContainer 
                                        spacing="tight">App is <TextStyle variation="strong">{textStatus}</TextStyle>.</TextContainer>
                                </SettingToggle>
                            </FormLayout>
                        </Layout.AnnotatedSection>
                    </Layout>
                );
            }}
            </Query>
        </Page>
    </Frame>
)};
export default Index;
