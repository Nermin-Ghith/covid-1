import { getJson, getGeoidIndex } from '../utils';

const loadJson = async (url, gda_proxy) => {
    const data = await getJson(url)
    gda_proxy.ReadGeojsonMap(url.split('/').slice(-1,)[0], data.ab);
    const values = await data.response.json()
    return {
        data: values,
        geoidIndex: getGeoidIndex(values.features)
    }
}

export default loadJson;