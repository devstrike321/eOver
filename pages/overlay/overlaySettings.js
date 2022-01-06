import { useState, useEffect, useCallback, useRef} from "react";
import { Layout, Card ,Tabs, Button, Stack, Heading} from "@shopify/polaris";
import TextOverlaySettings from './_text';
import ImageOverlaySettings from './_image';
import OverlayList from "./_list";
import { QueryRootShopify} from '../../graphql';
import { NetworkStatus, useQuery } from '@apollo/client';

const OverlaySettings = (props) => {
    //#region :- State Declaration
    const [selectedTab, setSelectedTab] = useState(1);
    const [overlayEditId, setOverlayEditId] = useState(null);
    const [addOverlay, setAddOverlay] = useState(false);
    
	//Text Overlay State
	const [text, setText] = useState('');
	const [fontSize, setFontSize] = useState('12');
	const [fontFamily, setFontFamily] = useState('Arial');
    const [fontcolor, setFontcolor] = useState('#000000');
    const [bgcolor, setBgcolor] = useState('');
    const [opacity, setOpacity] = useState('1');
    const [rotation, setRotation] = useState('0');
    const [selectedTextAlign, setSelectedTextAlign] = useState('LEFT');
    const [selectedTextPosition, setselectedTextPosition] = useState('MIDDLE_CENTER');
    const [topPadding, setTopPadding] = useState('2');
    const [rightPadding, setRightPadding] = useState('2');
    const [bottomPadding, setBottomPadding] = useState('2');
    const [leftPadding, setLeftPadding] = useState('2');
    const [selectedTextDisplayInOptions, setTextDisplayInOptions] = useState(['COLLECTION','PRODUCT','IN_SEARCH']);
    const [textScaleCollection, setTextScaleCollection] = useState('50');
    const [textScaleProduct, setTextScaleProduct] = useState('100');
    const [textScaleSearch, setTextScaleSearch] = useState('50');

    const [displayFontColorPicker, setDisplayFontColorPicker] = useState(false);
    const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);

    //Image Overlay State
    const [imageOverlaySrc, setImageOverlaySrc] = useState('');
    const [selectedImagePosition, setSelectedImagePosition] = useState('MIDDLE_CENTER');
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedGalleryImageURL, setSelectedGalleryImageURL] = useState('');
    const [selectedImageDisplayInOptions, setSelectedImageDisplayInOptions] = useState(['COLLECTION','PRODUCT','IN_SEARCH']);
    const [imageWidth, setImageWidth] = useState('100');
    const [chooseImageType, setChooseImageType] = useState(['NEW_IMAGE']);
    const [imageScaleCollection, setImageScaleCollection] = useState('50');
    const [imageScaleProduct, setImageScaleProduct] = useState('100');
    const [imageScaleSearch, setImageScaleSearch] = useState('50');
    
    //#endregion

	const stateKeys = {
        selectedTab,
        overlayEditId,
        text,
        fontSize,
        fontFamily,
        fontcolor,
        bgcolor,
        opacity,
        rotation,
        selectedTextAlign,
        selectedTextPosition,
        selectedTextDisplayInOptions,
        topPadding,
        rightPadding,
        bottomPadding,
        leftPadding,
        textScaleCollection,
        textScaleProduct,
        textScaleSearch,
        displayFontColorPicker,
        displayBgColorPicker,
        selectedImagePosition,
        selectedImageDisplayInOptions,
        selectedImage,
        imageOverlaySrc,
        selectedGalleryImageURL,
        chooseImageType,
        imageWidth,
        imageScaleCollection,
        imageScaleProduct,
        imageScaleSearch,
        addOverlay
    };
	const stateFunc = {
        setSelectedTab,
        setText,
        setFontSize,
        setFontFamily,
        setFontcolor,
        setBgcolor,
        setOpacity,
        setRotation,
        setSelectedTextAlign,
        setselectedTextPosition,
        setTextDisplayInOptions,
        setOverlayEditId,
        setDisplayFontColorPicker,
        setDisplayBgColorPicker,
        setSelectedImagePosition,
        setSelectedImageDisplayInOptions,
        setSelectedImage,
        setImageOverlaySrc,
        setSelectedGalleryImageURL,
        setChooseImageType,
        setImageWidth,
        setTopPadding,
        setRightPadding,
        setBottomPadding,
        setLeftPadding,
        setTextScaleCollection,
        setTextScaleProduct,
        setTextScaleSearch,
        setImageScaleCollection,
        setImageScaleProduct,
        setImageScaleSearch,
        setAddOverlay
    };
    
    const prodImage = props?.prodData?.product?.featuredMedia?.preview?.image?.originalSrc ? props?.prodData?.product?.featuredMedia?.preview?.image?.originalSrc : '';
    
    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelectedTab(selectedTabIndex);
        setDefaultOverlayData();
    }, []);
	
    const {productId} =  props;
    const { data, loading, error,refetch, networkStatus} = useQuery(QueryRootShopify.GET_OVERLAY_INFO_BY_PRODUCT_ID(),{client:props.restClient,variables: {productId:productId,notifyOnNetworkStatusChange:true}});

    const setDefaultOverlayData = (fromSave = false) => {
        if(fromSave){
            setAddOverlay(false);
        }else{
            setAddOverlay(true);
        }
        setText('');
        setFontSize('12');
        setFontFamily('Arial');
        setFontcolor('#000000');
        setBgcolor('');
        setOpacity('1');
        setRotation('0');
        setSelectedTextAlign('LEFT');
        setselectedTextPosition('MIDDLE_CENTER');
        setTopPadding('2');
        setRightPadding('2');
        setBottomPadding('2');
        setLeftPadding('2');
        setTextDisplayInOptions(['COLLECTION','PRODUCT','IN_SEARCH']);
        setTextScaleCollection('50'),
        setTextScaleProduct('100'),
        setTextScaleSearch('50'),

        setSelectedImagePosition('MIDDLE_CENTER');
        setSelectedImage('');
        setImageOverlaySrc('');
        setSelectedImageDisplayInOptions(['COLLECTION','PRODUCT','IN_SEARCH']);
        setImageWidth('100');
        setChooseImageType(['NEW_IMAGE']);
        setImageScaleCollection('50'),
        setImageScaleProduct('100'),
        setImageScaleSearch('50'),

        setOverlayEditId(null);        
    };

    //#region :- Change Preview As Per Overlay Settings
	useEffect(() => {
        let didComplete = false;
        if(!didComplete){
            if(document.getElementById('overlayImageBase') != undefined){
				let imgElem = document.getElementById('overlayImageBase');
                let product_id = props.productId;
				
                let textSelectionLength = document.getElementsByClassName('overlay-text-section').length;
                let imageSelectionLength = document.getElementsByClassName('overlay-image-section').length;
				if(document.getElementsByClassName('overlay-text-section').length>0){
                    for(let i = 0; i < textSelectionLength;i++){
                        document.getElementsByClassName('overlay-text-section')[0].remove();
                    }					
				}
				if(document.getElementsByClassName('overlay-image-section').length>0){
                    for(let i = 0; i < imageSelectionLength;i++){
                        document.getElementsByClassName('overlay-image-section')[0].remove();
                    }
				}
				
				if(selectedTab=='0'){
					//text overlay
					var overlayDiv = document.createElement('div');
					overlayDiv.className = 'overlay-text-section';

                    let isProdScaleAdded = false;
                    if(textScaleProduct > 0){ isProdScaleAdded = true;}

					//default css
					overlayDiv.style.zIndex = '1';
					overlayDiv.style.width = 'auto';
					overlayDiv.style.height = 'auto';
					overlayDiv.style.position = 'absolute';
                    overlayDiv.style.lineHeight = 'normal';
                    overlayDiv.style.wordBreak = 'word-break';
					//default css

					overlayDiv.innerHTML = text;

					if(fontFamily!=''){ 
                        overlayDiv.style.fontFamily = fontFamily; 

                        //add google font link in <head>
                        var overlayFontLink = document.createElement('link');
                        overlayFontLink.setAttribute("rel", "stylesheet");
                        overlayFontLink.setAttribute("href", "https://fonts.googleapis.com/css?family="+fontFamily);
                        document.getElementsByTagName('head')[0].insertAdjacentElement("beforeend", overlayFontLink);
                    }
					if(fontSize!=''){ overlayDiv.style.fontSize = isProdScaleAdded ? (fontSize*textScaleProduct/100)+'px' : fontSize+'px'; }
					if(opacity!=''){ overlayDiv.style.opacity = opacity; }
					if(selectedTextAlign!=''){ overlayDiv.style.textAlign = selectedTextAlign; }
					if(fontcolor!=''){ overlayDiv.style.color = fontcolor; }
					if(bgcolor!=''){ 
                        overlayDiv.style.backgroundColor = bgcolor; 
                    }else{
                        overlayDiv.style.backgroundColor = 'transparent'; 
                    }

                    if(topPadding!=''){ 
                        overlayDiv.style.paddingTop = isProdScaleAdded ? (topPadding*textScaleProduct/100)+'px': topPadding+'px'; 
                    }
                    if(rightPadding!=''){ 
                        overlayDiv.style.paddingRight = isProdScaleAdded ? (rightPadding*textScaleProduct/100)+'px': rightPadding+'px'; 
                    }
                    if(bottomPadding!=''){ 
                        overlayDiv.style.paddingBottom = isProdScaleAdded ? (bottomPadding*textScaleProduct/100)+'px': bottomPadding+'px';
                    }
                    if(leftPadding!=''){ 
                        overlayDiv.style.paddingLeft = isProdScaleAdded ? (leftPadding*textScaleProduct/100)+'px': leftPadding+'px'; 
                    }
                    
					let rotate_css = '';
					if(rotation!=''){
						overlayDiv.style.transform = 'rotate('+rotation+'deg)';
						rotate_css = ' rotate('+rotation+'deg)';
					}

					if(selectedTextPosition=='TOP_LEFT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 0; }
					else if(selectedTextPosition=='TOP_CENTER'){ overlayDiv.style.top = 0;overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
					else if(selectedTextPosition=='TOP_RIGHT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 'auto';overlayDiv.style.right = 0; }
					else if(selectedTextPosition=='MIDDLE_LEFT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
					else if(selectedTextPosition=='MIDDLE_CENTER'){ overlayDiv.style.top = '50%';overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translate(-50%,-50%)'+rotate_css; }
					else if(selectedTextPosition=='MIDDLE_RIGHT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 'auto';overlayDiv.style.right = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
					else if(selectedTextPosition=='BOTTOM_LEFT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 0;overlayDiv.style.bottom = 0; }
					else if(selectedTextPosition=='BOTTOM_CENTER'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = '50%';overlayDiv.style.bottom = 0;overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
					else if(selectedTextPosition=='BOTTOM_RIGHT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 'auto';overlayDiv.style.bottom = 0;overlayDiv.style.right = 0; }

					//set overlay html before img element
					imgElem.insertAdjacentElement("beforebegin", overlayDiv);

					//set relative css in parent element
					imgElem.parentElement.style.position = 'relative';
				}
				else if(selectedTab=='1' && imageOverlaySrc){
                    //image overlay
                    var overlayDiv = document.createElement('div');
                    overlayDiv.className = 'overlay-image-section';

                    let isProdScaleAdded = false;
                    if(imageScaleProduct > 0){ isProdScaleAdded = true;}

                    //default css
                    overlayDiv.style.zIndex = '1';
                    overlayDiv.style.width = 'auto';
                    overlayDiv.style.maxWidth = isProdScaleAdded ? imageScaleProduct+'%' : '50%';
                    overlayDiv.style.height = 'auto';
                    overlayDiv.style.position = 'absolute';
                    overlayDiv.style.lineHeight = 'normal';
                    overlayDiv.style.wordBreak = 'word-break';
                    //default css

                    let rotate_css = '';
                    if(rotation!=''){
                        overlayDiv.style.transform = 'rotate('+rotation+'deg)';
                        rotate_css = ' rotate('+rotation+'deg)';
                    }

                    if(opacity!=''){ overlayDiv.style.opacity = opacity; }

                    if(selectedImagePosition=='TOP_LEFT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 0; }
					else if(selectedImagePosition=='TOP_CENTER'){ overlayDiv.style.top = 0;overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
					else if(selectedImagePosition=='TOP_RIGHT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 'auto';overlayDiv.style.right = 0; }
					else if(selectedImagePosition=='MIDDLE_LEFT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
					else if(selectedImagePosition=='MIDDLE_CENTER'){ overlayDiv.style.top = '50%';overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translate(-50%,-50%)'+rotate_css; }
					else if(selectedImagePosition=='MIDDLE_RIGHT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 'auto';overlayDiv.style.right = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
					else if(selectedImagePosition=='BOTTOM_LEFT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 0;overlayDiv.style.bottom = 0; }
					else if(selectedImagePosition=='BOTTOM_CENTER'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = '50%';overlayDiv.style.bottom = 0;overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
					else if(selectedImagePosition=='BOTTOM_RIGHT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 'auto';overlayDiv.style.bottom = 0;overlayDiv.style.right = 0; }

                    var overlayImg = document.createElement('img');
                    overlayImg.style.width = imageWidth+'%';
                    overlayImg.style.height = '100%';
                    overlayImg.style.position = 'unset';
                    overlayImg.style.top = 'auto';
                    overlayImg.style.left = 'auto';
                    overlayImg.style.right = 'auto';
                    overlayImg.style.bottom = 'auto';
                    overlayImg.src = imageOverlaySrc;

                    //set overlay html before img element
                    overlayDiv.insertAdjacentElement("afterbegin", overlayImg);
                    imgElem.insertAdjacentElement("beforebegin", overlayDiv);

                    //set relative css in parent element
                    imgElem.parentElement.style.position = 'relative';
				}
            }
        }
        return () => {
            didComplete = true;
        };
    }, [selectedTab,text,fontSize,fontFamily,fontcolor,bgcolor,opacity,rotation,selectedTextAlign,selectedTextPosition,topPadding,rightPadding,bottomPadding,leftPadding,textScaleCollection,textScaleProduct,textScaleSearch,imageScaleCollection,imageScaleProduct,imageScaleSearch,selectedImagePosition,selectedImage,imageOverlaySrc,imageWidth, addOverlay]);
    //#endregion
    
    const childListRef = useRef();

    useEffect(() => {
        let didComplete = false;
        if(!didComplete && !addOverlay){
            if(typeof data!='undefined' && data.overlays?.data!=undefined){
                let item_list = data.overlays.data;
                item_list = item_list.filter(function(v){
                    return v.status==='Active';
                });
                if(document.getElementById('overlayImageBase') != undefined){
                    let imgElem = document.getElementById('overlayImageBase');

                    let textSelectionLength = document.getElementsByClassName('overlay-text-section').length;
                    let imageSelectionLength = document.getElementsByClassName('overlay-image-section').length;
                    if(document.getElementsByClassName('overlay-text-section').length>0){
                        for(let i = 0; i < textSelectionLength;i++){
                            document.getElementsByClassName('overlay-text-section')[0].remove();
                        }					
                    }
                    if(document.getElementsByClassName('overlay-image-section').length>0){
                        for(let i = 0; i < imageSelectionLength;i++){
                            document.getElementsByClassName('overlay-image-section')[0].remove();
                        }
                    }
                    item_list.forEach((overlayRow) => {
                        let selectedTab = overlayRow.type == 'TEXT' ? 0 : 1;
                        let text = overlayRow.text;
                        let fontSize = overlayRow.font_size;
                        let fontFamily = overlayRow.font_family;
                        let fontcolor = overlayRow.font_color;
                        let bgcolor = overlayRow.bg_color;
                        let opacity = overlayRow.opacity;
                        let rotation = overlayRow.rotation;
                        let selectedTextAlign = overlayRow.text_align;
                        let selectedTextPosition = overlayRow.position;
                        let topPadding = overlayRow.padding_top;
                        let rightPadding = overlayRow.padding_right;
                        let bottomPadding = overlayRow.padding_bottom;
                        let leftPadding = overlayRow.padding_left;
                        let selectedImagePosition = overlayRow.position;
                        let imageOverlaySrc = overlayRow.image_url;

                        if(selectedTab=='0'){
                            //text overlay
                            var overlayDiv = document.createElement('div');
                            overlayDiv.className = 'overlay-text-section';
        
                            //default css
                            overlayDiv.style.zIndex = '1';
                            overlayDiv.style.width = 'auto';
                            overlayDiv.style.height = 'auto';
                            overlayDiv.style.position = 'absolute';
                            overlayDiv.style.lineHeight = 'normal';
                            overlayDiv.style.wordBreak = 'word-break';
                            //default css
        
                            overlayDiv.innerHTML = text;
        
                            if(fontFamily!=''){ 
                                overlayDiv.style.fontFamily = fontFamily; 
        
                                //add google font link in <head>
                                var overlayFontLink = document.createElement('link');
                                overlayFontLink.setAttribute("rel", "stylesheet");
                                overlayFontLink.setAttribute("href", "https://fonts.googleapis.com/css?family="+fontFamily);
                                document.getElementsByTagName('head')[0].insertAdjacentElement("beforeend", overlayFontLink);
                            }
                            if(fontSize!=''){ overlayDiv.style.fontSize = fontSize+'px'; }
                            if(opacity!=''){ overlayDiv.style.opacity = opacity; }
                            if(selectedTextAlign!=''){ overlayDiv.style.textAlign = selectedTextAlign; }
                            if(fontcolor!=''){ overlayDiv.style.color = fontcolor; }
                            if(bgcolor!=''){ 
                                overlayDiv.style.backgroundColor = bgcolor; 
                            }else{
                                overlayDiv.style.backgroundColor = 'transparent'; 
                            }
        
                            if(topPadding!=''){ overlayDiv.style.paddingTop = topPadding+'px'; }
                            if(rightPadding!=''){ overlayDiv.style.paddingRight = rightPadding+'px'; }
                            if(bottomPadding!=''){ overlayDiv.style.paddingBottom = bottomPadding+'px'; }
                            if(leftPadding!=''){ overlayDiv.style.paddingLeft = leftPadding+'px'; }
                            
                            let rotate_css = '';
                            if(rotation!=''){
                                overlayDiv.style.transform = 'rotate('+rotation+'deg)';
                                rotate_css = ' rotate('+rotation+'deg)';
                            }
        
                            if(selectedTextPosition=='TOP_LEFT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 0; }
                            else if(selectedTextPosition=='TOP_CENTER'){ overlayDiv.style.top = 0;overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
                            else if(selectedTextPosition=='TOP_RIGHT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 'auto';overlayDiv.style.right = 0; }
                            else if(selectedTextPosition=='MIDDLE_LEFT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
                            else if(selectedTextPosition=='MIDDLE_CENTER'){ overlayDiv.style.top = '50%';overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translate(-50%,-50%)'+rotate_css; }
                            else if(selectedTextPosition=='MIDDLE_RIGHT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 'auto';overlayDiv.style.right = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
                            else if(selectedTextPosition=='BOTTOM_LEFT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 0;overlayDiv.style.bottom = 0; }
                            else if(selectedTextPosition=='BOTTOM_CENTER'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = '50%';overlayDiv.style.bottom = 0;overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
                            else if(selectedTextPosition=='BOTTOM_RIGHT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 'auto';overlayDiv.style.bottom = 0;overlayDiv.style.right = 0; }
        
                            //set overlay html before img element
                            imgElem.insertAdjacentElement("beforebegin", overlayDiv);
        
                            //set relative css in parent element
                            imgElem.parentElement.style.position = 'relative';
                        }
                        else if(selectedTab=='1' && imageOverlaySrc){
                            //image overlay
                            var overlayDiv = document.createElement('div');
                            overlayDiv.className = 'overlay-image-section';
        
                            //default css
                            overlayDiv.style.zIndex = '1';
                            overlayDiv.style.width = 'auto';
                            overlayDiv.style.maxWidth = '50%';
                            overlayDiv.style.height = 'auto';
                            overlayDiv.style.position = 'absolute';
                            overlayDiv.style.lineHeight = 'normal';
                            overlayDiv.style.wordBreak = 'word-break';
                            //default css
        
                            let rotate_css = '';
                            if(rotation!=''){
                                overlayDiv.style.transform = 'rotate('+rotation+'deg)';
                                rotate_css = ' rotate('+rotation+'deg)';
                            }
        
                            if(opacity!=''){ overlayDiv.style.opacity = opacity; }
        
                            if(selectedImagePosition=='TOP_LEFT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 0; }
                            else if(selectedImagePosition=='TOP_CENTER'){ overlayDiv.style.top = 0;overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
                            else if(selectedImagePosition=='TOP_RIGHT'){ overlayDiv.style.top = 0;overlayDiv.style.left = 'auto';overlayDiv.style.right = 0; }
                            else if(selectedImagePosition=='MIDDLE_LEFT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
                            else if(selectedImagePosition=='MIDDLE_CENTER'){ overlayDiv.style.top = '50%';overlayDiv.style.left = '50%';overlayDiv.style.transform = 'translate(-50%,-50%)'+rotate_css; }
                            else if(selectedImagePosition=='MIDDLE_RIGHT'){ overlayDiv.style.top = '50%';overlayDiv.style.left = 'auto';overlayDiv.style.right = 0;overlayDiv.style.transform = 'translateY(-50%)'+rotate_css; }
                            else if(selectedImagePosition=='BOTTOM_LEFT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 0;overlayDiv.style.bottom = 0; }
                            else if(selectedImagePosition=='BOTTOM_CENTER'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = '50%';overlayDiv.style.bottom = 0;overlayDiv.style.transform = 'translateX(-50%)'+rotate_css; }
                            else if(selectedImagePosition=='BOTTOM_RIGHT'){ overlayDiv.style.top = 'auto';overlayDiv.style.left = 'auto';overlayDiv.style.bottom = 0;overlayDiv.style.right = 0; }
        
                            var overlayImg = document.createElement('img');
                            overlayImg.style.width = imageWidth+'%';
                            overlayImg.style.height = '100%';
                            overlayImg.style.position = 'unset';
                            overlayImg.style.top = 'auto';
                            overlayImg.style.left = 'auto';
                            overlayImg.style.right = 'auto';
                            overlayImg.style.bottom = 'auto';
                            overlayImg.src = imageOverlaySrc;
        
                            //set overlay html before img element
                            overlayDiv.insertAdjacentElement("afterbegin", overlayImg);
                            imgElem.insertAdjacentElement("beforebegin", overlayDiv);
        
                            //set relative css in parent element
                            imgElem.parentElement.style.position = 'relative';
                        }
                    });
                }
            }
        }
        return () => {
            didComplete = true;
        }
    }, [data?.overlays?.data]);
    
    function getParentByChild(child, className){
        if(child.className.split(' ').indexOf(className) >= 0) return child;
  
        try{
          //Throws TypeError if child doesn't have parent any more
          return child.parentNode && getParentByChild(child.parentNode, className);
        }catch(TypeError){
          return false;
        }
    }
    
    document.onclick = function(e){
        if(e?.target){
            let fontColorParentNode = getParentByChild(e?.target,'font_color_connector');
            if(!fontColorParentNode){
                setDisplayFontColorPicker(false);
            }

            let bgColorParentNode = getParentByChild(e?.target,'bg_color_connector');
            if(!bgColorParentNode){
                setDisplayBgColorPicker(false);
            }
        }
    };
    
    return(
        <React.Fragment>
            <Layout>
                <Layout.Section secondary>
                    <div className="preview_card">
                        <Card title=""sectioned>
                            <img src={prodImage} id="overlayImageBase" style={{width:"100%"}}></img>
                        </Card>
                    </div>
                </Layout.Section>

                <Layout.Section>
                    <Stack vertical={true}>
                        {!addOverlay ?
                            <Card 
                                title="Add New Overlay" 
                                sectioned
                                actions={[
                                    {content:<Button primary onClick={()=>{setSelectedTab(0);setDefaultOverlayData();}}>Add Text Overlay</Button>},
                                    {content:<Button primary onClick={()=>{setSelectedTab(1);setDefaultOverlayData();}}>Add Image Overlay</Button>},
                                ]}
                            >
                            </Card>
                        :
                            <Card sectioned>
                                {selectedTab == 0 ?
                                    <TextOverlaySettings {...props} stateFunc={stateFunc} stateKeys={stateKeys} refreshData={childListRef?.current?.refreshData} setDefaultState={setDefaultOverlayData} /> 
                                :
                                    <ImageOverlaySettings {...props} stateFunc={stateFunc} stateKeys={stateKeys} refreshData={childListRef?.current?.refreshData}/>
                                }
                            </Card>
                        } 
                        <OverlayList  {...props} stateFunc={stateFunc} stateKeys={stateKeys} ref={childListRef} />
                    </Stack>
                </Layout.Section>
            </Layout>
        </React.Fragment>    
    );
};
export default OverlaySettings;