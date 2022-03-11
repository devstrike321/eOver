import { useState, useCallback } from "react";
import {
  TextField,
  FormLayout,
  Select,
  OptionList,
  ButtonGroup,
  Button,
  Toast,
} from "@shopify/polaris";
import React from "react";
import { useMutation } from "react-apollo";
import { MutationShopify } from "../../graphql";
import _ from "lodash";
import { SketchPicker } from "react-color";

const TextOverlaySettings = (props) => {
  //#region :- State Declaration
  const [queryToast, setQueryToast] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region :- Props Declaration
  const productId = props.productId;
  const {
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
    overlayEditId,
    displayFontColorPicker,
    displayBgColorPicker,
  } = props.stateKeys;
  const {
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
    setTopPadding,
    setRightPadding,
    setBottomPadding,
    setLeftPadding,
    setTextScaleCollection,
    setTextScaleProduct,
    setTextScaleSearch,
    setOverlayEditId,
    setDisplayFontColorPicker,
    setDisplayBgColorPicker,
  } = props.stateFunc;
  //#endregion

  //#region :- Options List
  const textAlignOptions = [
    { label: "Select option", value: "" },
    { label: "Left", value: "LEFT" },
    { label: "Center", value: "CENTER" },
    { label: "Right", value: "RIGHT" },
  ];
  const textPosition = [
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
  const textFontFamilyOptions = [
    { label: "Select option", value: "" },
    { label: "Arial", value: "Arial" },
    { label: "Arial Black", value: "Arial Black" },
    { label: "Verdana", value: "Verdana" },
    { label: "Tahoma", value: "Tahoma" },
    { label: "Trebuchet MS", value: "Trebuchet MS" },
    { label: "Impact", value: "Impact" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Didot", value: "Didot" },
    { label: "Georgia", value: "Georgia" },
    { label: "American Typewriter", value: "American Typewriter" },
    { label: "Andalé Mono", value: "Andalé Mono" },
    { label: "Courier", value: "Courier" },
    { label: "Lucida Console", value: "Lucida Console" },
    { label: "Monaco", value: "Monaco" },
    { label: "Bradley Hand", value: "Bradley Hand" },
    { label: "Brush Script MT", value: "Brush Script MT" },
    { label: "Luminari", value: "Luminari" },
    { label: "Comic Sans MS", value: "Comic Sans MS" },
  ];
  const displayInOptions = [
    { label: "Display in product", value: "PRODUCT" },
    { label: "Display in collection", value: "COLLECTION" },
    { label: "Display in search", value: "IN_SEARCH" },
  ];
  //#endregion

  //#region :- Cancel/Clear Overlay Data In Form
  const cancelTextOvelayData = useCallback(() => {
    setText("");
    setFontSize("12");
    setFontFamily("Arial");
    setFontcolor("#000000");
    setBgcolor("");
    setOpacity("1");
    setRotation("0");
    setTopPadding("2");
    setRightPadding("2");
    setBottomPadding("2");
    setLeftPadding("2");
    setSelectedTextAlign("LEFT");
    setselectedTextPosition("MIDDLE_CENTER");
    setTextDisplayInOptions(["COLLECTION", "PRODUCT", "IN_SEARCH"]);
    setTextScaleCollection("50");
    setTextScaleProduct("100");
    setTextScaleSearch("50");
    setOverlayEditId(null);
  }, []);
  //#endregion

  //#region :- Text Overlay Insert/Update
  const [addEditOverlay, addEditOverlayRes] = useMutation(
    MutationShopify.SAVE_OVERLAY_SETTINGS(),
    {
      client: props.restClient,
    }
  );
  const handleTextOverlay = async () => {
    const overlayData = {
      product_id: productId,
      type: "TEXT",
      text: text,
      font_family: fontFamily,
      font_size: fontSize,
      font_color: fontcolor,
      bg_color: bgcolor,
      opacity: opacity,
      rotation: rotation,
      text_align: selectedTextAlign,
      position: selectedTextPosition,
      padding_top: topPadding,
      padding_right: rightPadding,
      padding_bottom: bottomPadding,
      padding_left: leftPadding,
      status: "Active",
      display_in_collection: _.includes(
        selectedTextDisplayInOptions,
        "COLLECTION"
      )
        ? "Yes"
        : "No",
      display_in_product: _.includes(selectedTextDisplayInOptions, "PRODUCT")
        ? "Yes"
        : "No",
      display_in_search: _.includes(selectedTextDisplayInOptions, "IN_SEARCH")
        ? "Yes"
        : "No",
      scale_in_collection: textScaleCollection,
      scale_in_product: textScaleProduct,
      scale_in_search: textScaleSearch,
      overlay_id:
        overlayEditId != null && overlayEditId > 0 ? overlayEditId : "",
    };

    const { data, errors } = await addEditOverlay({
      variables: { overlayData },
    });
    if (!errors && data.addEditOverlay) {
      setQueryToast([
        <Toast
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

  const handleChangeFontColorComplete = (color) => {
    const colornew = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
    let hexColorCode = rgba2hex(colornew);
    setFontcolor("#" + hexColorCode);
  };

  const handleChangeBgColorComplete = (color) => {
    const colornew = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
    let hexColorCode = rgba2hex(colornew);
    setBgcolor("#" + hexColorCode);
  };

  const rgba2hex = (orig) => {
    var a,
      isPercent,
      rgb = orig
        .replace(/\s/g, "")
        .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = ((rgb && rgb[4]) || "").trim(),
      hex = rgb
        ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
          (rgb[2] | (1 << 8)).toString(16).slice(1) +
          (rgb[3] | (1 << 8)).toString(16).slice(1)
        : orig;

    if (alpha !== "") {
      a = alpha;
    } else {
      a = "01";
    }
    // multiply before convert to HEX
    a = ((a * 255) | (1 << 8)).toString(16).slice(1);
    hex = hex + a;

    return hex;
  };

  return (
    <React.Fragment>
      {queryToast}
      <div className="text_overlay_settings_container">
        <FormLayout>
          <FormLayout.Group>
            <TextField
              type="text"
              label="Text"
              value={text}
              onChange={(value) => {
                setText(value);
              }}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="number"
              label="Font size"
              value={fontSize}
              onChange={(value) => {
                setFontSize(value);
              }}
            />
            <Select
              label="Font family"
              options={textFontFamilyOptions}
              value={fontFamily}
              onChange={(value) => {
                setFontFamily(value);
              }}
            />
          </FormLayout.Group>
          <FormLayout.Group>
            <div className="text_overlay_font_color">
              <TextField
                type="text"
                label="Font color"
                value={fontcolor}
                onChange={(value) => {
                  setFontcolor(value);
                }}
                connectedRight={
                  <button
                    style={{ background: fontcolor }}
                    onClick={() => {
                      setDisplayBgColorPicker(false);
                      displayFontColorPicker
                        ? setDisplayFontColorPicker(false)
                        : setDisplayFontColorPicker(true);
                    }}
                    className="Polaris-Button font_color_connector"
                  ></button>
                }
              />
              {displayFontColorPicker ? (
                <div className="display_font_color font_color_connector">
                  <SketchPicker
                    color={fontcolor}
                    onChangeComplete={(value) =>
                      handleChangeFontColorComplete(value)
                    }
                  />
                </div>
              ) : null}
            </div>
            <div className="text_overlay_bg_color">
              <TextField
                type="text"
                label="Background color"
                value={bgcolor}
                onChange={(value) => {
                  setBgcolor(value);
                }}
                connectedRight={
                  <button
                    style={{ background: bgcolor }}
                    onClick={() => {
                      setDisplayFontColorPicker(false);
                      displayBgColorPicker
                        ? setDisplayBgColorPicker(false)
                        : setDisplayBgColorPicker(true);
                    }}
                    className="Polaris-Button bg_color_connector"
                  ></button>
                }
              />
              {displayBgColorPicker ? (
                <div className="display_background_color bg_color_connector">
                  <SketchPicker
                    color={bgcolor}
                    onChangeComplete={(value) =>
                      handleChangeBgColorComplete(value)
                    }
                  />
                </div>
              ) : null}
            </div>
          </FormLayout.Group>
          <FormLayout.Group>
            {/* <TextField 
                            type="number" 
                            label="Opacity"
                            value={opacity}
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            onChange={(value) => {setOpacity(value)}}                        
                        /> */}
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
            <Select
              label="Text align"
              options={textAlignOptions}
              value={selectedTextAlign}
              onChange={(value) => {
                setSelectedTextAlign(value);
              }}
            />
            <Select
              label="Text position"
              options={textPosition}
              value={selectedTextPosition}
              onChange={(value) => {
                setselectedTextPosition(value);
              }}
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
                onChange={setTextDisplayInOptions}
                options={displayInOptions}
                selected={selectedTextDisplayInOptions}
                allowMultiple
              />
            </div>
          </FormLayout.Group>
          <FormLayout.Group>
            <TextField
              type="number"
              label="Scale in product"
              min="1.0"
              max="100.0"
              step="1"
              suffix="%"
              value={textScaleProduct}
              onChange={(value) => {
                if (value > 100) {
                  setTextScaleProduct("100");
                } else if (value < 1) {
                  setTextScaleProduct("1");
                } else {
                  setTextScaleProduct(value);
                }
              }}
            />
            <TextField
              type="number"
              label="Scale in collection"
              value={textScaleCollection}
              min="1.0"
              max="100.0"
              step="1"
              suffix="%"
              helpText="Preview not available"
              onChange={(value) => {
                if (value > 100) {
                  setTextScaleCollection("100");
                } else if (value < 1) {
                  setTextScaleCollection("1");
                } else {
                  setTextScaleCollection(value);
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
              value={textScaleSearch}
              onChange={(value) => {
                if (value > 100) {
                  setTextScaleSearch("100");
                } else if (value < 1) {
                  setTextScaleSearch("1");
                } else {
                  setTextScaleSearch(value);
                }
              }}
            />
          </FormLayout.Group>
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
                  onClick={() => handleTextOverlay()}
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
export default TextOverlaySettings;
