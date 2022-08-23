import {TextStyle,Filters, ResourceItem, ResourceList, Pagination, Thumbnail,Toast, Stack,Button} from '@shopify/polaris';
import React, {useCallback, useEffect, useState} from 'react';
import { Query } from 'react-apollo';
import { QueryRootShopify } from '../../graphql';
import _ from 'lodash';
import {Redirect} from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';

const ProductList = (props) => {  
    const { shop ,isDisableOverlay,isPlanExpired,setQueryToast} = props;

    const upgradePlanText = 'Please upgrade your plan to continue with app';
    const [firstLimit, setFirstLimit] = useState(5); // this should configure under env file
    const [afterCursor, setAfterCursor] = useState(null);
    const [lastLimit, setLastLimit] = useState(null);
    const [beforeCursor, setBeforeCursor] = useState(null);
    const [filterQuery, setFilterQuery] = useState(null);
    const [pageInfo, setPageInfo] = useState({});    
    const [queryValue, setQueryValue] = useState(null);

    const app = useAppBridge();
    const redirect = Redirect.create(app);
    
    const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [handleQueryValueRemove]);

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const filterControl = (
        <Filters
            queryValue={queryValue}
            filters={[]}
            appliedFilters={[]}
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleClearAll}
        >
        </Filters>
    );
    
    const handleManageOvelay = useCallback((legacyResourceId) => {
        redirect.dispatch(Redirect.Action.APP, '/overlay/'+legacyResourceId);
    });

    useEffect(() => {
        let didCompleted = false;
        const _queryValue = queryValue !== null ?  `title:${queryValue}*` : null;
        const timeoutId = setTimeout(() => {
            if(!didCompleted){
                setFilterQuery(_queryValue);
            }
        }, 1000);
        return () => {
            clearTimeout(timeoutId);
            didCompleted = true;
        }
    }, [queryValue])

    return(
        <React.Fragment>
           <Query query={QueryRootShopify.GET_SHOPIFY_PRODUCTS()} variables={{
               "first":firstLimit, 
               "after": afterCursor, 
               "last": lastLimit, 
               "before": beforeCursor, 
               "query": filterQuery, 
               "includeImage":true
            }}>
            {({ data, loading, error}) => {
                if(error) return <div>{error.message}</div>;
                if(!loading){
                    setPageInfo(data.products.pageInfo);
                }
                return (
                    <React.Fragment>
                        <div className='product_list'>
                            <ResourceList
                                loading={loading}
                                filterControl={filterControl}
                                resourceName={resourceName}
                                items={!loading ? data.products.edges : []}
                                renderItem={(item,id,index)=> {
                                    const { title, featuredMedia, legacyResourceId } = item.node;
                                    let featuredImage = featuredMedia?.preview?.image?.originalSrc || '';
                                    const media = featuredImage !== '' ? <Thumbnail source={featuredImage} size="medium" /> : null;
                                    
                                    return (
                                        <ResourceItem 
                                            id={id}  
                                            media={media}
                                            onClick={() => {
                                                isPlanExpired ? 
                                                    setQueryToast([<Toast onDismiss={() => {
                                                        setQueryToast([]);
                                                    }} duration="1500" key="ugrade-plan-toast" content={upgradePlanText} error={true} />]) 
                                                : 
                                                    handleManageOvelay(legacyResourceId)
                                            }}
                                            accessibilityLabel={`View details for ${title}`}
                                            // shortcutActions={[{
                                            //     content: 'Manage overlay',
                                            //     accessibilityLabel: `Manage overlay`,
                                            //     disabled:isDisableOverlay,
                                            //     onClick: () => {
                                            //         isPlanExpired ?
                                            //         setQueryToast([<Toast onDismiss={() => {
                                            //             setQueryToast([]);
                                            //         }} duration="1500" key="ugrade-plan-toast" content={upgradePlanText} error={true} />])
                                            //         :
                                            //         handleManageOvelay(legacyResourceId)
                                            //     }
                                            // }]}
                                            persistActions
                                        > 
                                            <Stack>
                                                <h3>
                                                    <TextStyle variation="strong">{title}</TextStyle>
                                                </h3>
                                                <Button 
                                                    plain
                                                    disabled={isDisableOverlay}
                                                    onClick = {()=> {
                                                        isPlanExpired ?
                                                        setQueryToast([<Toast onDismiss={() => {
                                                            setQueryToast([]);
                                                        }} duration="1500" key="ugrade-plan-toast" content={upgradePlanText} error={true} />])
                                                        :
                                                        handleManageOvelay(legacyResourceId)
                                                    }}
                                                >Manage overlay</Button>
                                            </Stack>
                                        </ResourceItem>
                                    );
                                }}
                            />
                            <div className="prodlist_pagination">
                                <Pagination 
                                    hasPrevious={pageInfo.hasPreviousPage}
                                    onPrevious={() => {
                                        setLastLimit(5);
                                        setBeforeCursor(_.nth(data.products.edges,0).cursor);
                                        setFirstLimit(null);
                                        setAfterCursor(null);
                                    }}
                                    hasNext={pageInfo.hasNextPage}
                                    onNext={() => {
                                        setFirstLimit(5);
                                        setAfterCursor(_.nth(data.products.edges,(data.products.edges.length -1 )).cursor);
                                        setLastLimit(null);
                                        setBeforeCursor(null);
                                    }}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                );
            }}
           </Query>
        </React.Fragment>
    );
};

export default ProductList;