import React from 'react';
import {Card, EmptyState} from '@shopify/polaris';

const EmptyStateGlobal = (props) => {  
    return(
        <Card sectioned>
            <EmptyState
                heading="Something is going wrong"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>We are working on it. Thanks for your patience</p>
            </EmptyState>
        </Card>
    );
};

export default EmptyStateGlobal;
    