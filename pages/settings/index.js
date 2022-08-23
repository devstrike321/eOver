import React, { useState } from "react";
import {
  SettingToggle,
  Page,
  TextContainer,
  TextStyle,
  Layout,
  FormLayout,
  Toast,
  Frame,
  Spinner,
  Card,
  Link,
  Stack,
  Tooltip,
  Icon,
  Banner,
  Tabs,
  Button,
} from "@shopify/polaris";
import { Query, useMutation } from "react-apollo";
import { QueryRootShopify, MutationShopify } from "../../graphql";
import { ClipboardMinor } from "@shopify/polaris-icons";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

const Index = (props) => {
  const { shop } = props;

  let extentionUUID = process.env.NEXT_PUBLIC_EXTENSION_UUID;

  let appEmbedURL = `https://${shop}/admin/themes/current/editor?context=apps&appEmbed=${extentionUUID}%2Feasy-overlay-app`;

  const app = useAppBridge();
  const redirect = Redirect.create(app);

  let handleRefresh = null;
  const [appEnable, setAppEnable] = useState(true);
  const [queryToast, setQueryToast] = useState([]);
  const [pageTitle, setPageTitle] = useState("");
  const contentStatus = appEnable ? "Disable" : "Enable";
  const textStatus = appEnable ? "Enabled" : "Disabled";
  const [selectedTab, setSelectedTab] = useState(0);

  const [changeAppStatus, changeAppStatusRes] = useMutation(
    MutationShopify.CHANGE_APP_STATUS(),
    {
      client: props.restClient,
    }
  );
  const handleToggle = async (value) => {
    setAppEnable((value) => !value);
    const changeAppStatusData = {
      is_enable: appEnable ? "Inactive" : "Active",
    };
    const { data, errors } = await changeAppStatus({
      variables: { changeAppStatusData },
    });
    if (!errors && data.changeAppStatus) {
      setQueryToast([
        <Toast
          onDismiss={() => {
            setQueryToast([]);
          }}
          duration="1500"
          key="toast-msg"
          content={data.changeAppStatus.message}
          error={Number(data.changeAppStatus.code) !== 200 ? true : false}
        />,
      ]);
      handleRefresh();
    }
  };

  const copyToClipboard = (copyText) => {
    const textArea = document.createElement("textarea");
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    textArea.remove();

    setQueryToast([
      <Toast
        onDismiss={() => {
          setQueryToast([]);
        }}
        duration="1500"
        content={"Copied to clipboard"}
        error={false}
        key="toast_copy_clipboard"
      />,
    ]);
  };

  const tabs = [
    {
      id: "vintage-shopify-theme",
      content: "Shopify Theme 1.0",
      panelID: "vintage-shopify-theme",
    },
    {
      id: "latest-shopify-theme",
      content: "Shopify Theme 2.0",
      panelID: "latest-shopify-theme",
    },
  ];
  return (
    <Frame>
      <Page title={pageTitle}>
        {queryToast}
        <Query
          query={QueryRootShopify.GET_SETTINGS()}
          client={props.restClient}
        >
          {({ data, loading, error, refetch }) => {
            handleRefresh = () => {
              refetch();
            };
            let setting_data = [];
            if (!loading) {
              if (
                typeof data != "undefined" &&
                data.settings?.data != undefined
              ) {
                setting_data = data.settings.data;
                setAppEnable(setting_data.is_enable == "Active" ? true : false);
                setPageTitle("Installation guide");
              }
            }
            if (loading) {
              return (
                <div
                  style={{
                    top: "50%",
                    position: "absolute",
                    transform: "translate(-50%,-50%)",
                    left: "50%",
                  }}
                >
                  <Spinner accessibilityLabel="Spinner" size="large" />
                </div>
              );
            }
            if (error) return <div>{error.message}</div>;
            return (
              <Layout>
                <Layout.AnnotatedSection
                  title="Step - 1 Enable The App in your Theme"
                  description=""
                >
                  <Card title="" sectioned>
                    <Stack vertical={true}>
                      <p>
                        First, enable the app. In your store-admin, Click on{" "}
                        <b>Online Store</b> {">"} <b>Customize</b> {">"}{" "}
                        <b>Theme setting</b> {">"} <b>App embeds</b> {">"} Find
                        “Easy Overlay Settings” and click on Enable / Disable.
                      </p>

                      <Banner status="info">
                        <p>
                          <TextStyle variation="strong">
                            To enable App Embed Extension please{" "}
                            <Button
                              plain
                              onClick={() => {
                                redirect.dispatch(Redirect.Action.REMOTE, {
                                  url: appEmbedURL,
                                  newContext: true,
                                });
                              }}
                            >
                              Click Here
                            </Button>{" "}
                            {/* <Link url={appEmbedURL} external>Click Here</Link> */}
                            and save.
                          </TextStyle>
                        </p>
                      </Banner>

                      <Link
                        url={
                          "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/image_2022_02_08T13_28_09_088Z.png"
                        }
                        external
                      >
                        <img
                          alt="step-1"
                          width="100%"
                          height="100%"
                          src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/image_2022_02_08T13_28_09_088Z.png"
                          className="eo_sg_step_1"
                        />
                      </Link>
                    </Stack>
                  </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                  title="Step - 2 Add Code to <IMG> Tags"
                  description=""
                >
                  <Card title="" sectioned>
                    <Tabs
                      tabs={tabs}
                      selected={selectedTab}
                      onSelect={(value) => setSelectedTab(value)}
                      fitted
                    >
                      <Card.Section>
                        {selectedTab == 0 ? (
                          <Stack vertical={true}>
                            <p>
                              1. Click on <b>Theme</b> {">"} <b>Actions</b>
                              {">"} <b>Edit Code</b> then Open product.liquid
                              and find {"<img>"} tag.{" "}
                            </p>
                            <p>
                              2. If there is not a class= attribute in your{" "}
                              {"<img>"} tag, simply add the code snippet below
                              inside your {"<img>"} tag:
                              class="easyOverlayImage" data-product_id="
                              {"{{product.id}}"}"
                            </p>

                            {/* <p>
                              Now go to theme edit-code and find {"<"}img{">"}{" "}
                              elements in collection, product and search page and add
                              class “<b>easyOverlayImage</b>” and attribute{" "}
                              <b>data-product_id="{'{{product.id}}"'}</b> or{" "}
                              <b>data-product_id="{'{{item.id}}"'}</b> in that tag. It
                              depends on your theme.
                            </p> */}

                            <TextStyle variation="strong">
                              Example Before Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img src="{"{{"}featured_image {"|"}{" "}
                              product_img_url: '1024x1024' {"}}"}"{"/>"}
                            </TextStyle>
                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_1.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_1.png"
                                className="eo_sg_step_2_before_img"
                              />
                            </Link>

                            <TextStyle variation="strong">
                              Example After Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img{" "}
                              <b>
                                class="easyOverlayImage" data-product_id="
                                {"{{"}product.id{"}}"}"
                              </b>{" "}
                              src="{"{{"}featured_image {"|"} product_img_url:
                              '1024x1024' {"}}"}"{"/>"}
                            </TextStyle>
                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_2.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_2.png"
                                className="eo_sg_step_2_after_img"
                              />
                            </Link>

                            <p>
                              3. If your {"<img>"} already has a class defined,
                              simply add: easyOverlayImage inside the existing
                              class attribute and add: data-product_id="
                              {"{{product.id}}"}" before the close of the{" "}
                              {"<img>"} tag.
                            </p>

                            <TextStyle variation="strong">
                              Example Before Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img class="ExistingClass" src="{"{{"}
                              featured_image {"|"} product_img_url: '1024x1024'{" "}
                              {"}}"}" data-zoom-image="{"{{"} featured_image |
                              product_img_url: 'original' {"}}"}" alt="{"{{"}{" "}
                              product.title | escape {"}}"}"{"/>"}
                            </TextStyle>

                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_3.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_3.png"
                                className="eo_sg_step_3_before_img"
                              />
                            </Link>

                            <TextStyle variation="strong">
                              Example After Code:
                            </TextStyle>

                            <TextStyle variation="code">
                              {"<"}img class="ExistingClass{" "}
                              <b>easyOverlayImage</b>"
                              <b>
                                data-product_id="{"{{"}product.id{"}}"}"
                              </b>{" "}
                              src="{"{{"}
                              featured_image {"|"} product_img_url: '1024x1024'{" "}
                              {"}}"}" data-zoom-image="{"{{"} featured_image |
                              product_img_url: 'original' {"}}"}" alt="{"{{"}{" "}
                              product.title | escape {"}}"}"{"/>"}
                            </TextStyle>

                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_4.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_4.png"
                                className="eo_sg_step_4_after_img"
                              />
                            </Link>

                            <p>
                              4. Follow the same steps on the collection.liquid
                              and search.liquid pages
                            </p>

                            <p>
                              <TextStyle variation="strong">
                                Need Help?
                              </TextStyle>{" "}
                              If you have questions or would like help, please
                              email:{" "}
                              <a
                                href="mailto:dan@summitwebconsultants.com"
                                target="_blank"
                              >
                                dan@summitwebconsultants.com
                              </a>
                              . We are here to help you and will be happy to
                              install the code for you.
                            </p>
                          </Stack>
                        ) : (
                          <Stack vertical={true}>
                            <Banner title="" status="info">
                              <p>
                                The below instructions are based on Shopify Dawn
                                (version 5.0.0) Theme. Your theme files may
                                vary, please contact{" "}
                                <Link url="mailto:dan@summitwebconsultants.com">
                                  dan@summitwebconsultants.com
                                </Link>{" "}
                                for free installation assistance.
                              </p>
                            </Banner>

                            <p>
                              1. Click on <b>Theme</b> {">"} <b>Actions</b>
                              {">"} <b>Edit Code</b> then Open
                              product-thumbnail.liquid and find 3rd {"<img>"}{" "}
                              tag on this page.{" "}
                            </p>
                            <p>
                              2. If there is not a class= attribute in your{" "}
                              {"<img>"} tag, simply add the code snippet below
                              inside your {"<img>"} tag:
                              class="easyOverlayImage" data-product_id="
                              {"{{product.id}}"}"
                            </p>

                            {/* <p>
                              Now go to theme edit-code and find {"<"}img{">"}{" "}
                              elements in collection, product and search page and add
                              class “<b>easyOverlayImage</b>” and attribute{" "}
                              <b>data-product_id="{'{{product.id}}"'}</b> or{" "}
                              <b>data-product_id="{'{{item.id}}"'}</b> in that tag. It
                              depends on your theme.
                            </p> */}

                            <TextStyle variation="strong">
                              Example Before Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img src="{"{{"}media {"|"} img_url: '1946x'{" "}
                              {"}}"}"{"/>"}
                            </TextStyle>
                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_1.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_1.png"
                                className="eo_sg_step_2_before_img"
                              />
                            </Link>

                            <TextStyle variation="strong">
                              Example After Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img{" "}
                              <b>
                                class="easyOverlayImage" data-product_id="
                                {"{{"}product.id{"}}"}"
                              </b>{" "}
                              src="{"{{"}media {"|"} img_url: '1946x' {"}}"}"
                              {"/>"}
                            </TextStyle>
                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_2.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_2.png"
                                className="eo_sg_step_2_after_img"
                              />
                            </Link>

                            <p>
                              3. If your {"<img>"} already has a class defined,
                              simply add: easyOverlayImage inside the existing
                              class attribute and add: data-product_id="
                              {"{{product.id}}"}" before the close of the{" "}
                              {"<img>"} tag.
                            </p>

                            <TextStyle variation="strong">
                              Example Before Code:
                            </TextStyle>
                            <TextStyle variation="code">
                              {"<"}img class="ExistingClass" src="{"{{"}media{" "}
                              {"|"} img_url: '1946x' {"}}"}" data-zoom-image="
                              {"{{"} media | img_url: 'original' {"}}"}" alt="
                              {"{{"} product.title | escape {"}}"}"{"/>"}
                            </TextStyle>

                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_3.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_3.png"
                                className="eo_sg_step_3_before_img"
                              />
                            </Link>

                            <TextStyle variation="strong">
                              Example After Code:
                            </TextStyle>

                            <TextStyle variation="code">
                              {"<"}img class="ExistingClass{" "}
                              <b>easyOverlayImage</b>"
                              <b>
                                data-product_id="{"{{"}product.id{"}}"}"
                              </b>{" "}
                              src="{"{{"}
                              media {"|"} img_url: '1946x' {"}}"}"
                              data-zoom-image="{"{{"} media | img_url:
                              'original' {"}}"}" alt="{"{{"} product.title |
                              escape {"}}"}"{"/>"}
                            </TextStyle>

                            <Link
                              url={
                                "https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_4.png"
                              }
                              external
                            >
                              <img
                                alt="step-2"
                                width="100%"
                                height="100%"
                                src="https://wr-shopify-apps.s3.amazonaws.com/public-app/easy-overlay/gallery/help-images/product_dawn_4.png"
                                className="eo_sg_step_4_after_img"
                              />
                            </Link>

                            <p>
                              4. Follow the same steps and edit the {"<IMG>"}{" "}
                              tag on page: card-product.liquid. If you have
                              multiple {"<IMG>"} tags change the one that
                              references: card_product.featured_media
                            </p>

                            <p>
                              <TextStyle variation="strong">
                                Need Help?
                              </TextStyle>{" "}
                              If you have questions or would like help, please
                              email:{" "}
                              <a
                                href="mailto:dan@summitwebconsultants.com"
                                target="_blank"
                              >
                                dan@summitwebconsultants.com
                              </a>
                              . We are here to help you and will be happy to
                              install the code for you.
                            </p>
                          </Stack>
                        )}
                      </Card.Section>
                    </Tabs>
                  </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                  title="App status"
                  description="The entire app can be turned on or off by changing this setting at store level."
                >
                  <FormLayout>
                    <SettingToggle
                      action={{
                        content: contentStatus,
                        onAction: handleToggle,
                        loading: changeAppStatusRes.loading,
                      }}
                      enabled={appEnable ? true : false}
                    >
                      <TextContainer spacing="tight">
                        App is{" "}
                        <TextStyle variation="strong">{textStatus}</TextStyle>.
                      </TextContainer>
                    </SettingToggle>
                  </FormLayout>
                </Layout.AnnotatedSection>
              </Layout>
            );
          }}
        </Query>
      </Page>
    </Frame>
  );
};

export async function getServerSideProps(ctx) {
  const { shop } = ctx.query;
  if (!shop) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      shop: shop,
    }, // will be passed to the page component as props
  };
}
export default Index;
