import axios from 'axios';


const ApiUris = {
    'development':`${process.env.API_URL}`,
    'production':`${process.env.API_URL}`,
};
const EasyOverlayApi = axios.create({
    baseURL:ApiUris[process.env.NODE_ENV],
    headers:{
        'Content-Type': 'application/json'
    }
});

export default EasyOverlayApi;