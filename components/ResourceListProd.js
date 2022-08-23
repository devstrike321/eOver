import React, {useCallback, useEffect, useState} from 'react';
import {Layout,Avatar, TextStyle, Button, Card, TextField, Filters, ResourceItem, ResourceList} from '@shopify/polaris';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
//import { gql, useQuery } from '@apollo/client';

export default function ResourceListProd(props) {

    const [taggedWith, setTaggedWith] = useState('VIP');
    const [queryValue, setQueryValue] = useState(null);

    const handleTaggedWithChange = useCallback(
        (value) => setTaggedWith(value),
        [],
    );

    const handleTaggedWithRemove = useCallback(() => setTaggedWith(null), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
    const handleClearAll = useCallback(() => {
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [handleQueryValueRemove, handleTaggedWithRemove]);
    
    const handleViewDetail = useCallback(() => {
        console.log('View detail...')
    }, []);

    const handleSaveFilter = useCallback(() => {
        console.log('Filter saved...')
    }, []);

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };
    
    const items = [
        {
            id: 108,
            url: 'customers/341',
            name: 'Mae Jemison',
            location: 'Decatur, USA',
            latestOrderUrl: 'orders/1457',
        },
        {
            id: 208,
            url: 'customers/256',
            name: 'Ellen Ochoa',
            location: 'Los Angeles, USA',
            latestOrderUrl: 'orders/1457',
        },
    ];
    
    const filters = [
        {
            key: 'taggedWith1',
            label: 'Tagged with',
            filter: (
            <TextField
                label="Tagged with"
                value={taggedWith}
                onChange={handleTaggedWithChange}
                labelHidden
            />
            ),
            shortcut: true,
        },
    ];
    
    const appliedFilters = !isEmpty(taggedWith)
    ? [
        {
            key: 'taggedWith1',
            label: disambiguateLabel('taggedWith1', taggedWith),
            onRemove: handleTaggedWithRemove,
        },
        ]
    : [];
    
    const filterControl = (
        <Filters
            queryValue={queryValue}
            filters={filters}
            appliedFilters={appliedFilters}
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleClearAll}
        >
            <div style={{paddingLeft: '8px'}}>
            <Button onClick={handleSaveFilter}>Save</Button>
            </div>
        </Filters>
    );

    // const fetchShopProducts = useCallback(() => {
    //     const GET_PRODUCTS = gql`
    //         query getProducts {
    //             products(first:10) {
    //                 edges{
    //                     node{
    //                         id title
    //                     }
    //                 }
    //             }
    //         }
    //     `;
    //     console.log('123');
    //     const { loading, error, data } = useQuery(GET_PRODUCTS);
    //     console.log(loading, error, data);
    //     return data;
    // });
    //fetchShopProducts();

    return (
        <Layout>
            <Layout.Section>
                <Card title="" sectioned>
                    <ResourceList
                        resourceName={resourceName}
                        items={items}
                        renderItem={renderItem}
                        filterControl={filterControl}
                    />
                </Card>
            </Layout.Section>
        </Layout>
    );

    function renderItem(item) {
        const {id, url, name, location,latestOrderUrl} = item;
        const media = <Avatar customer size="medium" name={name} />;

        const shortcutActions = latestOrderUrl
        ? [
            {
                content: 'View Detail',
                accessibilityLabel: `View ${name}’s detail`,
                onClick: handleViewDetail,
            },
          ]
        : null;

        return (
            <ResourceItem 
                id={id} 
                url={url} 
                media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={shortcutActions}
                persistActions
            >
            <h3>
                <TextStyle variation="strong">{name}</TextStyle>
            </h3>
            <div>{location}</div>
            </ResourceItem>
        );
    }
    
    function disambiguateLabel(key, value) {
        switch (key) {
            case 'taggedWith1':
            return `Tagged with ${value}`;
            default:
            return value;
        }
    }
    
    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
}