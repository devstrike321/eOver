
import { Card, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const GET_CUSTOMERS = gql`
    query getCustomers($ids:[ID!]!) {
        nodes(ids:$ids) {
            ... on Customer {
                id
                email
                firstName
                lastName
                legacyResourceId
            }
        }
    }
`
export default function Customers ({ids})  {

    const app = useAppBridge();

    const redirectToCustomer = (id) => {
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.APP, `/edit-customers/${id}`);
    };
    
        return (
            <Query query={GET_CUSTOMERS}  variables={{ids:ids}}> 
                {({ data, loading, error }) => {
                  if (loading) { return <div>Loading…</div>; }
                  if (error) { return <div>{error.message}</div>; }
                  
                //    {
                //     return data.customers.edges.map((edge) => (
                //         <p key={edge.node.displayName}> {edge.node.displayName}</p>
                //       ))}

                {
                    return(
                        <Card>
                            <ResourceList 
                                showHeader
                                resourceName={{ singular:'customer', plural:'customers' }}
                                items={data.nodes}
                                renderItem={item => {
                                      
                                    return (
                                        <ResourceItem
                                            id={item.id}
                                            accessibilityLabel={`View details for ${item.firstName}`}
                                            onClick={() => {
                                                redirectToCustomer(item.legacyResourceId);
                                            }}
                                        >
                                            <Stack>
                                                <Stack.Item fill>
                                                    <h3>
                                                        <TextStyle variation="strong">{item.firstName}</TextStyle>
                                                    </h3>     
                                                </Stack.Item>
                                                <Stack.Item>
                                                    <p>{email}</p>
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








// import { Card, ResourceItem, ResourceList, Stack, TextStyle, Thumbnail } from '@shopify/polaris';
// import gql from 'graphql-tag';
// import { Query } from 'react-apollo';
// import { Redirect } from '@shopify/app-bridge/actions';
// import { useAppBridge } from '@shopify/app-bridge-react';

// const GET_CUSTOMERS_BY_ID = gql`
// query getCustomers($ids:[ID!]!) {
//     nodes(ids:$ids) {
//         ... on Customer {
//             firstName
//             lastName
//             email
//             phone
//         }
//     }
// }
// `;


// export default function ResourceListWithCustomers ({ids}) {

//     const app = useAppBridge();

//     const redirectToCustomer = (id) => {
//         const redirect = Redirect.create(app);
//         redirect.dispatch(Redirect.Action.APP, `/edit-customers/${id}`);
//     };

//     return (
//         <Query query={GET_CUSTOMERS_BY_ID} variables={{ids:ids}}>
//             {({ data, loading, error}) => {
//                 if(loading) return <div>Loading...</div>;
//                 if(error) return <div>{error.message}</div>;

//                 return(
//                     <Card>
//                         <ResourceList 
//                             showHeader
//                             resourceName={{ singular:'customer', plural:'customers' }}
//                             items={data.nodes}
//                             renderItem={customer => {
//                                 return (
//                                     <ResourceItem
//                                         id={customer.id}
//                                         accessibilityLabel={`View details for ${customer.firstName}`}
//                                         onClick={() => {
//                                             redirectToCustomer(customer.legacyResourceId);
//                                         }}
//                                     >
//                                         <Stack>
//                                             <Stack.Item fill>
//                                                 <h3>
//                                                     <TextStyle variation="strong">{customer.firstName}{customer.lastName}</TextStyle>
//                                                 </h3>     
//                                             </Stack.Item>
//                                             <Stack.Item>
//                                                 <p>{customer.phone}</p>
//                                             </Stack.Item>
//                                         </Stack>

//                                     </ResourceItem>
//                                 )
//                             }}
//                         />
//                     </Card>
//                 )
//             }}
//         </Query>
//     );
// }