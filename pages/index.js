import ProductsIndex from "./products";

const Index = (props) => {
    console.log(111111);
    return (
    <ProductsIndex {...props}/>
)};

export async function getServerSideProps(ctx){
    const { shop } = ctx.query;
    if (!shop) {
        return {
            notFound: true,
        }
    }
    return {
        props: {
            shop:shop
        }, // will be passed to the page component as props
    }
};

export default Index;
