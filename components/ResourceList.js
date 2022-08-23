import { Card, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const GET_PRODUCTS_BY_ID = gql`
    query getProducts($ids:[ID!]!) {
        nodes(ids:$ids) {
            ... on Product {
                title
                handle
                descriptionHtml
                id
                legacyResourceId
                images(first:1) {
                    edges {
                        node {
                            originalSrc
                            altText
                        }
                    }
                }
                variants(first:1) {
                    edges {
                        node {
                            price
                            id
                        }
                    }
                }
            }
        }
    }
`;


export default function ResourceListWithProducts ({ids}) {

    const app = useAppBridge();

    const redirectToProduct = (id) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/edit-products/${id}`);
    };

    return (
        <Query query={GET_PRODUCTS_BY_ID} variables={{ids:ids}}>
            {({ data, loading, error}) => {
                if(loading) return <div>Loading...</div>;
                if(error) return <div>{error.message}</div>;

                return(
                    <Card>
                        <ResourceList 
                            showHeader
                            resourceName={{ singular:'product', plural:'products' }}
                            items={data.nodes}
                            renderItem={item => {
                                const media = (
                                    <Thumbnail source={item.images.edges[0] ? item.images.edges[0].node.originalSrc : ''} alt={item.images.edges[0] ? item.images.edges[0].node.altText : ''} />
                                );
                                const price = item.variants.edges[0].node.price;

                                return (
                                    <ResourceItem
                                        id={item.id}
                                        media={media}
                                        accessibilityLabel={`View details for ${item.title}`}
                                        onClick={() => {
                                            redirectToProduct(item.legacyResourceId);
                                        }}
                                    >
                                        <Stack>
                                            <Stack.Item fill>
                                                <h3>
                                                    <TextStyle variation="strong">{item.title}</TextStyle>
                                                </h3>     
                                            </Stack.Item>
                                            <Stack.Item>
                                                <p>${price}</p>
                                            </Stack.Item>
                                        </Stack>

                                    </ResourceItem>
                                )
                            }}
                        />
                    </Card>
                )
            }}
        </Query>
    );
}