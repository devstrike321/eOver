import { Card, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const GET_ORDERS = gql`

    query getOrders ($ids:[ID!]!){
        nodes(ids:$ids) {
        ... on Orders {
          id
          name
          description
          legacyResourceId
          customer {
              name
          }
        }
      }
    }
`
export default function Orders ({ids})  {

    const app = useAppBridge();

    const redirectToOrder = (id) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/edit-orders/${id}`);
    };
    
        return (
            <Query query={GET_ORDERS}  variables={{ids:ids}}> 
                {({ data, loading, error }) => {
                  if (loading) { return <div>Loading…</div>; }
                  if (error) { return <div>{error.message}</div>; }
                   
               {
                    return(
                        <Card>
                            <ResourceList 
                                showHeader
                                resourceName={{ singular:'order', plural:'orders' }}
                                items={data.nodes}
                                renderItem={item => {
                                      
                                    return (
                                        <ResourceItem
                                            id={item.id}
                                            accessibilityLabel={`View details for ${item.name}`}
                                            onClick={() => {
                                                redirectToOrder();
                                            }}
                                        >
                                            <Stack>
                                                <Stack.Item fill>
                                                    <h3>
                                                        <TextStyle variation="strong">{item.name}</TextStyle>
                                                    </h3>     
                                                </Stack.Item>
                                                <Stack.Item>
                                                    <p>{description}</p>
                                                </Stack.Item>
                                            </Stack>
    
                                        </ResourceItem>
                                    )
                                }}
                            />
                        </Card>
                    )
                }
                      
                      
                }}
            </Query>
        )
    }
