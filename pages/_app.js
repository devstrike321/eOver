import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App from "next/app";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch  } from "@shopify/app-bridge-utils";
import { Redirect, NavigationMenu, AppLink } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import { ApolloClient as RestApolloClient , InMemoryCache } from '@apollo/client';
import { RestLink } from "apollo-link-rest";
import '../assets/css/app.css';
import { useRouter } from "next/router";


function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app);
    return async (uri, options) => {
        const response = await fetchFunction(uri, options);
        if (response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
            const authUrlHeader = response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize-Url"
            );
            const redirect = Redirect.create(app);
            redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
            return null;
        }
        return response;
    };
}

function MyProvider(props) {
    const app = useAppBridge();
    const client = new ApolloClient({
        fetch: userLoggedInFetch(app),
        fetchOptions: {
            credentials: "include",
        },
    });
    const restLink = new RestLink({
        uri:`${process.env.NEXT_PUBLIC_API_URL}/`,
        customFetch:authenticatedFetch(app),
        credentials:"include",
        headers: {
            "Content-Type": "application/json"
        },
        defaultSerializer: (data, headers) => {
            const formData = new FormData();
            for (let key in data) {
              formData.append(key, data[key]);
            }
            return {body: formData, headers};
        }
    });
    const restClient = new RestApolloClient({
        cache: new InMemoryCache(),
        link: restLink
    });
    const Component = props.Component;
    const router = useRouter();
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
    return (
        <ApolloProvider client={client}>
            <Component {...props} restClient={restClient}/>
        </ApolloProvider>
    );
}

class MyApp extends App {
    render() {
        const { Component, pageProps, host } = this.props;

        return (
        <Provider
            config={{
                apiKey: API_KEY,
                host: host,
                forceRedirect: true,
            }}
        >
            <AppProvider i18n={translations}>                
                <MyProvider Component={Component} {...pageProps} />
            </AppProvider>
        </Provider>
        );
    }
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
    shop: ctx.query.shop
  };
};
export default MyApp;