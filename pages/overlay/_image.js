import React, { useCallback, useState, useEffect } from "react";
import {
  Stack,
  DropZone,
  Thumbnail,
  FormLayout,
  Select,
  Banner,
  List,
  OptionList,
  ButtonGroup,
  Button,
  TextField,
  ChoiceList,
  Pagination,
  RangeSlider,
  Toast,
} from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";
import { Query, useMutation } from "react-apollo";
import { QueryRootShopify, MutationShopify } from "../../graphql";

const ImageOverlaySettings = (props) => {
  //#region :- State Declaration
  const [queryToast, setQueryToast] = useState([]);
  const [file, setFile] = useState("");
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [limit, setLimit] = useState(12);
  const [afterCursor, setAfterCursor] = useState(null);
  const [beforeCursor, setBeforeCursor] = useState(null);
  const [pageInfo, setPageInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region :- Props Declaration
  const productId = props.productId;
  const {
    selectedImagePosition,
    selectedImageDisplayInOptions,
    selectedImage,
    overlayEditId,
    opacity,
    rotation,
    selectedGalleryImageURL,
    topPadding,
    rightPadding,
    bottomPadding,
    leftPadding,
    chooseImageType,
    imageWidth,
    imageScaleCollection,
    imageScaleProduct,
    imageScaleSearch,
  } = props.stateKeys;
  const {
    setSelectedImagePosition,
    setSelectedImageDisplayInOptions,
    setSelectedImage,
    setOverlayEditId,
    setImageOverlaySrc,
    setOpacity,
    setRotation,
    setSelectedGalleryImageURL,
    setTopPadding,
    setRightPadding,
    setBottomPadding,
    setLeftPadding,
    setChooseImageType,
    setImageWidth,
    setImageScaleCollection,
    setImageScaleProduct,
    setImageScaleSearch,
  } = props.stateFunc;
  //#endregion

  //#region :- Options List
  const imagePositions = [
    { label: "Select option", value: "" },
    { label: "Top left", value: "TOP_LEFT" },
    { label: "Top center", value: "TOP_CENTER" },
    { label: "Top right", value: "TOP_RIGHT" },
    { label: "Middle left", value: "MIDDLE_LEFT" },
    { label: "Middle center", value: "MIDDLE_CENTER" },
    { label: "Middle right", value: "MIDDLE_RIGHT" },
    { label: "Bottom left", value: "BOTTOM_LEFT" },
    { label: "Bottom center", value: "BOTTOM_CENTER" },
    { label: "Bottom right", value: "BOTTOM_RIGHT" },
  ];
  const displayInOptions = [
    { label: "Display in product", value: "PRODUCT" },
    { label: "Display in collection", value: "COLLECTION" },
    { label: "Display in search", value: "IN_SEARCH" },
  ];
  const chooseImageTypeOptions = [
    { label: "Choose image", value: "NEW_IMAGE" },
    { label: "Choose image from gallery", value: "GALLERY" },
  ];
  //#endregion

  //#region :- Dropzone And Image Upload Regading Functions
  const hasError = rejectedFiles.length > 0;
  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const fileUpload = !file && (
    <DropZone.FileUpload
      actionTitle="Add image"
      actionHint="or drop image to upload"
    />
  );
  const uploadedFile = file && (
    <Stack>
      <Thumbnail
        size="large"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteMinor
        }
      />
      {/* <div>{file.name}</div> */}
    </Stack>
  );
  const editFilePreview =
    overlayEditId > 0 && !file ? (
      <Stack>
        <Thumbnail size="large" alt={selectedImage} source={selectedImage} />
      </Stack>
    ) : null;
  const errorMessage = hasError && (
    <Banner
      title="The following images couldn’t be uploaded:"
      status="critical"
    >
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );
  const handleDropZoneDrop = useCallback(
    (_droppedFiles, acceptedFiles, rejectedFiles) => {
      setFile((file) => acceptedFiles[0]);
      setRejectedFiles(rejectedFiles);
      if (rejectedFiles.length == 0 && acceptedFiles.length > 0) {
        setImageOverlaySrc(window.URL.createObjectURL(acceptedFiles[0]));
      } else if (rejectedFiles.length > 0) {
        setImageOverlaySrc("");
      }
    },
    []
  );
  const cancelImageOvelayData = useCallback(() => {
    setSelectedImagePosition("");
    setSelectedImageDisplayInOptions([]);
    setSelectedImage("");
    setFile("");
    setRejectedFiles("");
    setOpacity("1");
    setRotation("0");
    setImageScaleCollection("50");
    setImageScaleProduct("100");
    setImageScaleSearch("50");
    setOverlayEditId(0);
    setSelectedGalleryImageURL("");
  }, []);
  //#endregion

  useEffect(() => {
    let didComplete = false;
    if (!didComplete) {
      if (overlayEditId > 0 && file) {
        setOverlayEditId(0);
      }
    }
    return () => {
      didComplete = true;
    };
  }, [overlayEditId]);

  //#region :- Choose Predefined Badges From Gallary
  const chooseBadgeUrl = (badge_id, badge_url) => {
    var badgeImgElements = document.getElementsByClassName("badge_img_section");
    for (var i = 0; i < badgeImgElements.length; i++) {
      if (!badgeImgElements[i].classList.contains("badge_img_" + badge_id)) {
        badgeImgElements[i].classList.remove("select_badge");
      }
    }
    var selectImgElem = document.getElementsByClassName(
      "badge_img_" + badge_id
    )[0];
    if (selectImgElem) {
      if (selectImgElem.classList.contains("select_badge")) {
        selectImgElem.classList.remove("select_badge");
        setSelectedGalleryImageURL();
        setImageOverlaySrc();
      } else {
        selectImgElem.classList.add("select_badge");
        setSelectedGalleryImageURL(badge_url);
        setImageOverlaySrc(badge_url);
        setSelectedImage(badge_url);
      }
    }
  };
  //#endregion

  //#region :- Image Overlay Insert/Update
  const [addEditOverlay, addEditOverlayRes] = useMutation(
    MutationShopify.SAVE_OVERLAY_SETTINGS(),
    {
      client: props.restClient,
    }
  );
  const handleImageOverlay = async () => {
    const overlayData = {
      product_id: productId,
      type: "IMAGE",
      opacity: opacity,
      rotation: rotation,
      position: selectedImagePosition,
      padding_top: topPadding,
      padding_right: rightPadding,
      padding_bottom: bottomPadding,
      padding_left: leftPadding,
      status: "Active",
      display_in_collection: _.includes(
        selectedImageDisplayInOptions,
        "COLLECTION"
      )
        ? "Yes"
        : "No",
      display_in_product: _.includes(selectedImageDisplayInOptions, "PRODUCT")
        ? "Yes"
        : "No",
      display_in_search: _.includes(selectedImageDisplayInOptions, "IN_SEARCH")
        ? "Yes"
        : "No",
      scale_in_collection: imageScaleCollection,
      scale_in_product: imageScaleProduct,
      scale_in_search: imageScaleSearch,
      overlay_id:
        overlayEditId != null && overlayEditId > 0 ? overlayEditId : "",
    };
    if (file) {
      overlayData.image_file = file;
    }
    if (selectedGalleryImageURL) {
      overlayData.image_url = selectedGalleryImageURL;
    }

    const { data, errors } = await addEditOverlay({
      variables: { overlayData },
    });
    if (!errors && data.addEditOverlay) {
      setQueryToast([
        <Toast
          key="toast-msg"
          onDismiss={() => {
            setQueryToast([]);
          }}
          duration="1500"
          content={data.addEditOverlay?.message}
          error={Number(data.addEditOverlay.code) !== 200 ? true : false}
        />,
      ]);
    }
    props.refreshData();
    setTimeout(function () {
      location.reload();
    }, 2000);
  };
  //#endregion

  return (
    <React.Fragment>
      {queryToast}
      <div className="image_overlay_settings_container">
        <FormLayout>
          {/* <FormLayout.Group>
                        <div className="choose_image_type">
                            <ChoiceList
                                title=""
                                choices={chooseImageTypeOptions}
                                selected={chooseImageType}
                                onChange={(value) => {setChooseImageType(value)}}
                            />
                        </div>
                    </FormLayout.Group> */}
          {chooseImageType[0] == "NEW_IMAGE" ? (
            <FormLayout.Group>
              <Stack>
                {errorMessage}
                <div style={{ width: 114, height: 114 }}>
                  <DropZone
                    accept="image/*"
                    type="image"
                    allowMultiple={false}
                    onDrop={handleDropZoneDrop}
                  >
                    {uploadedFile}
                    {fileUpload}
                  </DropZone>
                </div>
                <div style={{ margin: "0 25px" }}>{editFilePreview}</div>
              </Stack>
            </FormLayout.Group>
          ) : (
            <Query
              query={QueryRootShopify.GET_BADGES()}
              client={props.restClient}
              variables={{
                limit: limit,
                after: afterCursor,
                before: beforeCursor,
              }}
            >
              {({ data, loading, error, refetch }) => {
                if (error) return <div>{error.message}</div>;
                let imgThumbnail = [];
                if (!loading) {
                  setPageInfo(data.badges.data.pageInfo);
                  for (let i = 0; i < data.badges.data.edges.length; i++) {
                    let bdg = data.badges.data.edges[i].node;
                    imgThumbnail.push(
                      <div
                        onClick={() => chooseBadgeUrl(bdg.id, bdg.badge_url)}
                        className={"badge_img_section badge_img_" + bdg.id}
                        key={`gallery-img--container${i}`}
                      >
                        <Thumbnail
                          key={`gallery-img-${i}`}
                          source={bdg.badge_url}
                          size="large"
                          alt={bdg.badge_title}
                        />
                      </div>
                    );
                  }
                }
                return (
                  <React.Fragment>
                    <React.Fragment>
                      <div className="gallery_container">
                        <Stack>{imgThumbnail}</Stack>
                      </div>
                      <br />
                    </React.Fragment>
                    <div className="galleryimg_list_pagination">
                      <Pagination
                        hasPrevious={pageInfo.hasPreviousPage}
                        onPrevious={() => {
                          setBeforeCursor(pageInfo.startCursor);
                          setAfterCursor(null);
                        }}
                        hasNext={pageInfo.hasNextPage}
                        onNext={() => {
                          setAfterCursor(pageInfo.endCursor);
                          setBeforeCursor(null);
                        }}
                      />
                    </div>
                  </React.Fragment>
                );
              }}
            </Query>
          )}
          <FormLayout.Group>
            <TextField
              type="number"
              label="Opacity"
              value={opacity}
              min="0.0"
              max="1.0"
              step="0.1"
              onChange={(value) => {
                setOpacity(value);
              }}
            />
            <TextField
              type="number"
              label="Rotation"
              min={-360}
              max={360}
              value={rotation}
              onChange={(value) => {
                setRotation(value);
              }}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <Select
              label="Image position"
              options={imagePositions}
              onChange={(value) => {
                setSelectedImagePosition(value);
                setTopPadding(0);
                setRightPadding(0);
                setBottomPadding(0);
                setLeftPadding(0);
              }}
              value={selectedImagePosition}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="number"
              label="Top padding"
              placeholder=""
              value={topPadding}
              step="1"
              suffix="px"
              onChange={(value) => {
                setTopPadding(value);
              }}
            />
            <TextField
              type="number"
              label="Right padding"
              placeholder=""
              value={rightPadding}
              step="1"
              suffix="px"
              onChange={(value) => {
                setRightPadding(value);
              }}
            />
            <TextField
              type="number"
              label="Bottom padding"
              placeholder=""
              value={bottomPadding}
              step="1"
              suffix="px"
              onChange={(value) => {
                setBottomPadding(value);
              }}
            />
            <TextField
              type="number"
              label="Left padding"
              placeholder=""
              value={leftPadding}
              step="1"
              suffix="px"
              onChange={(value) => {
                setLeftPadding(value);
              }}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <div className="overlay_main_settings">
              <OptionList
                title=""
                onChange={setSelectedImageDisplayInOptions}
                options={displayInOptions}
                selected={selectedImageDisplayInOptions}
                allowMultiple
              />
            </div>
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="number"
              label="Scale in product"
              min="0.0"
              max="100.0"
              step="1"
              suffix="%"
              value={imageScaleProduct}
              onChange={(value) => {
                if (value > 100) {
                  setImageScaleProduct("100");
                } else if (value < 1) {
                  setImageScaleProduct("1");
                } else {
                  setImageScaleProduct(value);
                }
              }}
            />
            <TextField
              type="number"
              label="Scale in collection"
              value={imageScaleCollection}
              min="0.0"
              max="100.0"
              step="1"
              suffix="%"
              helpText="Preview not available"
              onChange={(value) => {
                if (value > 100) {
                  setImageScaleCollection("100");
                } else if (value < 1) {
                  setImageScaleCollection("1");
                } else {
                  setImageScaleCollection(value);
                }
              }}
            />
            <TextField
              type="number"
              label="Scale in search"
              min="1.0"
              max="100.0"
              step="1"
              suffix="%"
              helpText="Preview not available"
              value={imageScaleSearch}
              onChange={(value) => {
                if (value > 100) {
                  setImageScaleSearch("100");
                } else if (value < 1) {
                  setImageScaleSearch("1");
                } else {
                  setImageScaleSearch(value);
                }
              }}
            />
          </FormLayout.Group>
          {/* <FormLayout.Group>
                        <RangeSlider
                            output
                            label="Image size"
                            helpText="Number indicating in percentage (%)"
                            value={imageWidth}
                            min={20}
                            max={100}
                            step={1}
                            onChange={(value) => {setImageWidth(value)}}                     
                        />
                    </FormLayout.Group> */}
          <div className="overlay_action_btn">
            <FormLayout.Group>
              <ButtonGroup spacing="loose">
                <Button
                  loading={isLoading}
                  disabled={addEditOverlayRes.loading ? true : false}
                  onClick={() => {
                    setIsLoading(true);
                    location.reload();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  primary
                  loading={addEditOverlayRes.loading}
                  onClick={() => handleImageOverlay()}
                >
                  Save
                </Button>
              </ButtonGroup>
            </FormLayout.Group>
          </div>
        </FormLayout>
      </div>
    </React.Fragment>
  );
};
export default ImageOverlaySettings;
