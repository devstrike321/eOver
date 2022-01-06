import { withRouter } from 'next/router';
import {ClientRouter as AppBridgeClientRouter} from '@shopify/app-bridge-react';


function ClientRouter(props) {
    const {router} = props;
    const app = useAppBridge();
    
    
    // create links
    const homeLink = AppLink.create(app,{
      label:"Home",
      destination:"/"
    });

    const settingsLink = AppLink.create(app,{
      label:"Settings",
      destination:`/settings`
    });

    // create navigation
    const navigationMenu = NavigationMenu.create(app,{
        items:[homeLink,settingsLink]
    });

    
    const AppNav = {
        "/":homeLink,
        "/products":homeLink,
        "/settings":settingsLink    
    };
    navigationMenu.set({active:AppNav[router.pathname]});
    return <AppBridgeClientRouter history={router} />;
}
export default withRouter(ClientRouter);