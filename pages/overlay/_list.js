import React, {useCallback, useState,forwardRef, useImperativeHandle, useEffect} from 'react';
import {Avatar, TextStyle, Card, ResourceItem, ResourceList,List,Stack,Collapsible,Badge,Thumbnail,Modal,TextContainer,EmptyState, Toast} from '@shopify/polaris';
import {  useMutation } from 'react-apollo';
import { QueryRootShopify, MutationShopify } from '../../graphql';
import _ from 'lodash';
import { NetworkStatus, useQuery } from '@apollo/client';

const OverlayList = forwardRef((props, ref) => {
    const {productId} =  props;
    const { data, loading, error,refetch, networkStatus} = useQuery(QueryRootShopify.GET_OVERLAY_INFO_BY_PRODUCT_ID(),{client:props.restClient,variables: {productId:productId,notifyOnNetworkStatusChange:true}});
    const [overlayData, setOverlayData] = useState([]);
    let item_list = [];
    if(!loading){
        if(typeof data!='undefined' && data.overlays?.data!=undefined){
            item_list = data.overlays.data;
        }
    }

    //#region :- State Declaration
    const [overlayDetailCardTitle, setOverlayDetailCardTitle] = useState('Overlays');
    const [removeOverlayId, setRemoveOverlayId] = useState(0);
    const [overlayDetailOpen, setOverlayDetailOpen] = useState(false);
    const [removeModalActive, setRemoveModalActive] = useState(false);
    const [queryToast, setQueryToast] = useState([]);
    //#endregion
    
    //#region :- Props Declaration
    const {setSelectedTab,setText,setFontSize,setFontFamily,setFontcolor,setBgcolor,setOpacity,setRotation,setSelectedTextAlign,setselectedTextPosition,setTextDisplayInOptions,setTopPadding,setRightPadding,setBottomPadding,setLeftPadding,setOverlayEditId,setSelectedImagePosition,setSelectedImageDisplayInOptions,setSelectedImage,setImageOverlaySrc,setSelectedGalleryImageURL,setChooseImageType,setTextScaleCollection,setTextScaleProduct,setTextScaleSearch,setTextScaleHome,setImageScaleCollection,setImageScaleProduct,setImageScaleSearch,setImageScaleHome,setAddOverlay} = props.stateFunc;  
    //#endregion

    //#region :- View Overlay  (button toggle event for show/hide overlay details)
    const handleDetailToggle = (targetId) => {
        setOverlayDetailOpen({
            ...overlayDetailOpen,
            [targetId]:overlayDetailOpen[targetId] ? !overlayDetailOpen[targetId] : true
        });
    };
    //#endregion

    //#region :- Edit Overlay (Set all state as per overlay type and fill overlay form)
    const handleEditOvelay = useCallback((item) => {
        if(item.type=='TEXT'){
            setSelectedTab(0);
            setText(item.text);            
            setFontSize(item.font_size);
            setFontFamily(item.font_family);
            setFontcolor(item.font_color);
            setBgcolor(item.bg_color);
            setOpacity(item.opacity);
            setRotation(item.rotation);
            setSelectedTextAlign(item.text_align);
            setselectedTextPosition(item.position);
            setTopPadding(item.padding_top);
            setRightPadding(item.padding_right);
            setBottomPadding(item.padding_bottom);
            setLeftPadding(item.padding_left);
            
            setTextScaleCollection(item.scale_in_collection);
            setTextScaleProduct(item.scale_in_product);
            setTextScaleSearch(item.scale_in_search);
            setTextScaleHome(item.scale_in_home);
            
            setOverlayEditId(item.overlay_id);

            const textDisplayInArray = [];
            if(item.display_in_product == 'Yes'){
                textDisplayInArray.push("PRODUCT");
            }if(item.display_in_collection == 'Yes'){
                textDisplayInArray.push("COLLECTION");
            }if(item.display_in_search == 'Yes'){
                textDisplayInArray.push("IN_SEARCH");
            }
            if(item.display_in_home == 'Yes'){
                textDisplayInArray.push("IN_HOME");
            }
            setTextDisplayInOptions(textDisplayInArray);            
        }else{
            setSelectedTab(1);
            setOverlayEditId(item.overlay_id);
            setSelectedImagePosition(item.position);
            setSelectedImage(item.image_url);
            setImageOverlaySrc(item.image_url);
            setOpacity(item.opacity);
            setRotation(item.rotation);
            setChooseImageType(['NEW_IMAGE']);

            setImageScaleCollection(item.scale_in_collection);
            setImageScaleProduct(item.scale_in_product);
            setImageScaleSearch(item.scale_in_search);
            setImageScaleHome(item.scale_in_home);

            setTopPadding(item.padding_top);
            setRightPadding(item.padding_right);
            setBottomPadding(item.padding_bottom);
            setLeftPadding(item.padding_left);

            const imageDisplayInArray = [];
            if(item.display_in_product == 'Yes'){
                imageDisplayInArray.push("PRODUCT");
            }if(item.display_in_collection == 'Yes'){
                imageDisplayInArray.push("COLLECTION");
            }if(item.display_in_search == 'Yes'){
                imageDisplayInArray.push("IN_SEARCH");
            }if(item.display_in_home == 'Yes'){
                imageDisplayInArray.push("IN_HOME");
            }
            setSelectedImageDisplayInOptions(imageDisplayInArray);
        }
        setAddOverlay(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);     
    //#endregion 

    //#region :- Remove Overlay
    const handleRemoveOvelayModal = useCallback(() => setRemoveModalActive(!removeModalActive), [removeModalActive]);     
    const handleRemoveOvelay = (overlay_id) => {
        setRemoveModalActive(true);
        setRemoveOverlayId(overlay_id);
    };
    const [deleteOverlay, deleteOverlayRes] = useMutation(MutationShopify.DELETE_OVERLAY_SETTING(),{client:props.restClient});
    const deleteOvelayConf = async () => {
        const id = removeOverlayId;
        const { data, errors} = await deleteOverlay({variables:{id}});
        
        if(!errors && data.deleteOverlay){
            setRemoveModalActive(false);
            setQueryToast([<Toast onDismiss={() => {
                setQueryToast([]);
            }} duration="1500" content={data.deleteOverlay.message} error={Number(data.deleteOverlay.code) !== 200 ? true : false} />]);
            refetch();
        }
    };
    //#endregion

    //#region :- Change Overlay status
    const [changeOverlayStatus, changeOverlayStatusRes] = useMutation(MutationShopify.CHANGE_OVERLAY_STATUS(),{client:props.restClient});
    const handleChangeOverlayStatus = async (overlay_id,status) => {
        const changeOverlayStatusData = {
            'status':status == 'Active' ? 'Inactive' : 'Active'
        };
        const { data, errors} = await changeOverlayStatus({variables:{changeOverlayStatusData,id:overlay_id}});
        if(!errors && data.changeOverlayStatus){            
            setQueryToast([<Toast onDismiss={() => {
                setQueryToast([]);
            }} duration="1500" content={data.changeOverlayStatus.message} error={Number(data.changeOverlayStatus.code) !== 200 ? true : false} />]);
            refetch();
        }
    };
    //#endregion
       
    useImperativeHandle(ref, () => ({
        refreshData () {
            refetch();
        },
        getOverlayData () {
            return data?.overlays?.data;
        }
    }));

    return(
        <React.Fragment>
            {queryToast}
            <Modal                    
                open={removeModalActive}
                onClose={handleRemoveOvelayModal}
                title="Remove overlay"
                primaryAction={{
                    destructive:true,
                    content: 'Delete',
                    loading:deleteOverlayRes.loading,
                    onAction: deleteOvelayConf,
                }}
                secondaryActions={[{
                    content: 'Cancle',
                    disabled:deleteOverlayRes.loading,
                    onAction: handleRemoveOvelayModal,
                }]}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>Are you sure to delete this overlay. This can’t be undone.</p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
            <Card title={overlayDetailCardTitle}>
                {error ? <div>{error.message}</div> : null}
                <ResourceList
                    emptyState={
                        item_list.length == 0 ?  (
                            <EmptyState 
                                heading="Your overlay will show here" 
                                image="https://cdn.shopify.com/shopifycloud/web/assets/v1/a64ef20cde1af82ef69556c7ab33c727.svg">
                            </EmptyState>
                        ) :undefined
                    }
                    resourceName={{
                        singular: 'Overlay',
                        plural: 'Overlays',
                    }}
                    items={item_list}
                    loading={networkStatus === NetworkStatus.refetch ? true :loading}
                    renderItem={(item,id,index) => {
                        
                        const {overlay_id, type, image_url, text, font_family, font_size, font_color, bg_color, opacity, rotation, text_align, position, display_in_collection, display_in_product, display_in_search, display_in_home,status,padding_top,padding_right,padding_bottom,padding_left,scale_in_collection,scale_in_product,scale_in_search, scale_in_home} = item;

                        let overlayRowInfo = [];
                        overlayRowInfo.push(
                            <React.Fragment key={`info-container-${index}`}>
                                <Stack>
                                    <Stack.Item>
                                        <TextStyle>Display in:</TextStyle>
                                    </Stack.Item>
                                    {display_in_collection == 'Yes' ? <Stack.Item><Badge>Collection</Badge></Stack.Item> : null}
                                    {display_in_product == 'Yes' ? <Stack.Item><Badge>Product</Badge></Stack.Item> : null}
                                    {display_in_search == 'Yes' ? <Stack.Item><Badge>In search</Badge></Stack.Item> : null}
                                    {display_in_home == 'Yes' ? <Stack.Item><Badge>In home</Badge></Stack.Item> : null}
                                </Stack>
                                <br/>
                            </React.Fragment>
                        )
                        {type == 'TEXT' ?  
                            overlayRowInfo.push( 
                                <Stack distribution="fill" key={`info-container-text-${index}`}>
                                    <List type="bullet">
                                        <List.Item>Text: {text}</List.Item>
                                        <List.Item>Font size: {font_size}</List.Item>
                                        <List.Item>Font family: {font_family}</List.Item>
                                    </List>

                                    <List type="bullet">
                                        <List.Item>Font color: {font_color}</List.Item>
                                        <List.Item>Background color: {bg_color}</List.Item>
                                        <List.Item>Opacity: {opacity}</List.Item>
                                    </List>

                                    <List type="bullet">
                                        <List.Item>Rotation: {rotation}</List.Item>
                                        <List.Item>Text align: {(text_align.replace(/_/g, ' ')).charAt(0).toUpperCase() + (text_align.replace(/_/g, ' ').substr(1).toLowerCase())}</List.Item>
                                        <List.Item>Position: {(position.replace(/_/g, ' ')).charAt(0).toUpperCase() + (position.replace(/_/g, ' ').substr(1).toLowerCase())}</List.Item>
                                    </List>

                                    <List type="bullet">
                                        <List.Item>Top padding: {padding_top != '' ? padding_top+'px' : '0px'}</List.Item>
                                        <List.Item>Right padding: {padding_right != '' ? padding_right+'px' : '0px'}</List.Item>
                                        <List.Item>Bottom padding: {padding_bottom != '' ? padding_bottom+'px' : '0px'}</List.Item>
                                        <List.Item>Left padding: {padding_left != '' ? padding_left+'px' : '0px'}</List.Item>
                                    </List>

                                    <List type="bullet">
                                        <List.Item>Scale in collection: {(scale_in_collection != '' && scale_in_collection != null) ? scale_in_collection+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in product: {(scale_in_product != '' && scale_in_product != null)? scale_in_product+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in search: {(scale_in_search != '' && scale_in_search != null)? scale_in_search+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in home: {(scale_in_home != '' && scale_in_home != null)? scale_in_home+'%' : '0%'}</List.Item>
                                    </List>
                                </Stack>
                            )
                            :
                            overlayRowInfo.push( 
                                <Stack distribution="fill" key={`info-container-image-${index}`}>
                                    <List type="bullet">                                                
                                        <List.Item>Position: {(position.replace(/_/g, ' ')).charAt(0).toUpperCase() + (position.replace(/_/g, ' ').substr(1).toLowerCase())}</List.Item>
                                        <List.Item>Rotation: {rotation}</List.Item>
                                        <List.Item>Opacity: {opacity}</List.Item>
                                    </List>

                                    <List type="bullet">
                                        <List.Item>Top padding: {padding_top != '' ? padding_top+'px' : '0px'}</List.Item>
                                        <List.Item>Right padding: {padding_right != '' ? padding_right+'px' : '0px'}</List.Item>
                                        <List.Item>Bottom padding: {padding_bottom != '' ? padding_bottom+'px' : '0px'}</List.Item>
                                        <List.Item>Left padding: {padding_left != '' ? padding_left+'px' : '0px'}</List.Item>
                                    </List>
                                    
                                    <List type="bullet">
                                        <List.Item>Scale in collection: {(scale_in_collection != '' && scale_in_collection != null) ? scale_in_collection+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in product: {(scale_in_product != '' && scale_in_product != null)? scale_in_product+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in search: {(scale_in_search != '' && scale_in_search != null)? scale_in_search+'%' : '0%'}</List.Item>
                                        <List.Item>Scale in search: {(scale_in_home != '' && scale_in_home != null)? scale_in_home+'%' : '0%'}</List.Item>
                                    </List>
                                </Stack>
                            )
                        }

                        const shortcutActions = [
                            {
                                content: <Badge status={status == 'Active' ? "success" : "warning"}>{status == 'Active' ? "Active" : "Inactive"}</Badge>,
                                accessibilityLabel: `activeStatus`,
                                onClick: () => handleChangeOverlayStatus(overlay_id,status)
                            },{
                                content: 'View',
                                accessibilityLabel: `View`,
                                onClick: () => handleDetailToggle(`collapsible-${overlay_id}`)
                            },{
                                content: 'Edit',
                                accessibilityLabel: `Edit`,
                                onClick: () => handleEditOvelay(item)
                            },{
                                content: 'Remove',
                                accessibilityLabel: `Remove`,
                                onClick: () =>handleRemoveOvelay(overlay_id),
                                destructive:true
                            }
                        ];

                        return (
                            <ResourceItem
                                id={overlay_id}
                                url={''}                                            
                                media={type == 'TEXT' ? <Avatar size="medium" initials={text.charAt(0)} name="" customer={false} key={index} /> : <div className="overlay_list_img" key={index}><Thumbnail source={image_url} /></div>}
                                accessibilityLabel={`View details for ${overlay_id}`}
                                shortcutActions={shortcutActions}
                                persistActions
                            >
                                <h3><TextStyle variation="strong">{type+': '+text}</TextStyle></h3>
                                <br/>
                                <Collapsible
                                    id={`collapsible-${overlay_id}`}
                                    open={overlayDetailOpen[`collapsible-${overlay_id}`]}                                            
                                    transition={{duration: '500ms', timingFunction: 'ease-in-out'}}
                                    expandOnPrint
                                >
                                    {overlayRowInfo}
                                </Collapsible>
                            </ResourceItem>                                    
                        );
                    }}
                /> 
            </Card>
        </React.Fragment>
    );
});

export default OverlayList;