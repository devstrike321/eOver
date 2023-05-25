import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Card,
  Layout,
  Page,
  Stack,
  Button,
  Popover,
  ActionList,
  Toast,
  Frame,
  Banner,
} from "@shopify/polaris";
import { useQuery } from "@apollo/client";
import React, { useCallback, useRef, useState } from "react";
import { useMutation } from "react-apollo";
import { QueryRootShopify, MutationShopify } from "../../graphql";
import { csvToArray, convertToCSV } from "../../utils/CSV.util";

const CSV_HEADERS = {
  // product_id: 'ProductId',
  id: "ProductShopId",
  title: "ProductTitle",
  product_type: "ProductType",
  overlay_id: "OverlayId",
  type: "OverlayType",
  image_url: "OverlayImage",
  text: "OverlayText",
  font_family: "OverlayFontFamily",
  font_size: "OverlayFontSize",
  font_color: "OverlayFontColor",
  bg_color: "OverlayBackgroundColor",
  opacity: "OverlayOpacity",
  rotation: "OverlayRotation",
  text_align: "OverlayAlign",
  padding_top: "OverlayPaddingTop",
  padding_right: "OverlayPaddingRight",
  padding_bottom: "OverlayPaddingBottom",
  padding_left: "OverlayPaddingLeft",
  position: "OverlayPosition",
  display_in_collection: "DisplayInCollection",
  display_in_product: "DisplayInProduct",
  display_in_search: "DisplayInSearch",
  scale_in_collection: "ScaleInCollection",
  scale_in_product: "ScaleInProduct",
  scale_in_search: "ScaleInSearch",
  overlay_status: "OverlayStatus",
};

const ImportExport = ({ restClient }) => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const inputFile = useRef(null);
  const [popoverActive, setPopoverActive] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState();

  const {
    loading: syncing,
  } = useQuery(QueryRootShopify.SYNC_SHOPIFY_PRODUCTS(), {
    client: restClient,
  });

  const [exportOverlays] = useMutation(MutationShopify.EXPORT_OVERLAYS(), {
    client: restClient,
  });
  const [importOverlays] = useMutation(MutationShopify.IMPORT_OVERLAYS(), {
    client: restClient,
  });

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );

  const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    // to trigger a download
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const handleExport = async (filter = "all") => {
    const { data, errors } = await exportOverlays({
      variables: { filter },
    });

    if (!errors) {
      const overlays = data.overlays?.data
        ?.map((product) => {
          if (!product.overlays?.length) {
            return product;
          } else {
            return product.overlays.map((overlay) => ({
              ...overlay,
              ...product,
            }));
          }
        })
        .flat(1);

      const csv = convertToCSV(CSV_HEADERS, overlays);

      const d = new Date();
      const dformat = `${d.getFullYear()}-${
        d.getMonth() + 1
      }-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;

      downloadFile({
        data: csv,
        fileName: `Overlays_${filter}_${dformat}.csv`,
        fileType: "text/csv",
      });
    }
  };

  const handleImport = async (e) => {
    setImporting(true);

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      try {
        var rowData = fileReader.result.split("\n");
        const overlays = [];
        for (var row = 1; row < rowData.length; row++) {
          const cols = csvToArray(rowData[row]);
          const colData = {};
          for (var col = 0; col < cols.length; col++) {
            colData[Object.keys(CSV_HEADERS)[col]] = cols[col];
          }

          if (colData.id && colData.type) {
            overlays.push(colData);
          }
        }
        const { data, errors } = await importOverlays({
          variables: { data: { key: JSON.stringify(overlays) } },
        });
        setImportResult(data.importOverlays.data);
        setImporting(false);
      } catch (e) {
        console.log("**Not valid JSON file!**", e);
        setImporting(false);
      }
    };
    fileReader.readAsText(e.target.files[0]);
    e.target.value = null;
  };

  return (
    <Frame>
      <Page
        breadcrumbs={[
          {
            content: "Products",
            onAction: () => {
              redirect.dispatch(Redirect.Action.APP, { path: "/" });
            },
          },
        ]}
        title="Import/Export CSV"
        fullWidth
      >
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Card.Section>
                <Stack distribution="equalSpacing">
                  <h2 className="overlay_product_count_text">
                    Import / Export
                  </h2>
                </Stack>
              </Card.Section>

              <Card.Section>
                <Stack>
                  <Popover
                    active={popoverActive}
                    activator={
                      <Button
                        disabled={syncing}
                        onClick={togglePopoverActive}
                        disclosure
                      >
                        Export CSV
                      </Button>
                    }
                    preferredAlignment="left"
                    autofocusTarget="first-node"
                    onClose={togglePopoverActive}
                  >
                    <ActionList
                      actionRole="menuitem"
                      items={[
                        { content: "All Products", onAction: handleExport },
                        {
                          content: "Only products with overlays",
                          onAction: () => handleExport("withOverlay"),
                        },
                      ]}
                    />
                  </Popover>
                  <Button
                    loading={importing}
                    onClick={() => inputFile.current.click()}
                  >
                    Import CSV
                  </Button>
                  <input
                    style={{ display: "none" }}
                    type="file"
                    accept=".csv, .json"
                    onChange={handleImport}
                    ref={inputFile}
                  />
                </Stack>
              </Card.Section>
              {importResult && (
                <Banner
                  status="success"
                  title="Imported!"
                  onDismiss={() => setImportResult(null)}
                >
                  <b>Added:</b> {importResult.added.length || 0},{" "}
                  <b>Deleted:</b> {importResult.deleted.length || 0},{" "}
                  <b>Updated:</b> {importResult.updated.length || 0}
                </Banner>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
};

export default ImportExport;
