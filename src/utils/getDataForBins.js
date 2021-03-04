import dataFn from './dataFunction';
// this function loops through the current data set and provides data for GeodaJS to create custom breaks 
const getDataForBins = (params) => {
    // destructure 
    const { dataParams, numeratorData, denominatorData, dateLists } = params;
    const { numerator, nProperty, nIndex, denominator, dType, dIndex} = dataParams;
    if (numerator === undefined) return;
    const tableKeys = Object.keys(numeratorData.data);
    const denominatorKeys = Object.keys(denominatorData.data)
    const combinedKeys = [...tableKeys, ...denominatorKeys].filter((value, index, self) => tableKeys.indexOf(value)!==-1 && denominatorKeys.indexOf(value)!==-1 && self.indexOf(value) === index)
    const dateList = dateLists[numeratorData.dateList];

    // declare empty array for return variables
    let rtn = new Array(tableKeys.length).fill(0);

    // length of data table to loop through
    let n = combinedKeys.length;

    // this checks if the bins generated should be dynamic (generating for each date) or fixed (to the most recent date)
    if (nIndex === null && nProperty === null) {
        // if fixed, get the most recent date
        let tempIndex = numeratorData.dateIndices.slice(-1)[0];
        // if the denominator is time series data (eg. deaths / cases this week), make the indices the same (most recent)
        let tempDIndex = dType === 'time-series' ? numeratorData.dateIndices.slice(-1)[0] : dIndex;
        // loop through, do appropriate calculation. add returned value to rtn array
        while (n>0) {
            n--;
            rtn[n] = dataFn(
                {data: numeratorData.data[combinedKeys[n]], type: numeratorData.type},
                {data: denominatorData.data[combinedKeys[n]], type: denominatorData.type},
                {...dataParams, nIndex:tempIndex, dIndex: tempDIndex}, 
                dateList
            )||0
        }
    } else {
       while (n>0) {
            n--;
            rtn[n] = dataFn(
                {data: numeratorData.data[combinedKeys[n]], type: numeratorData.type},
                {data: denominatorData.data[combinedKeys[n]], type: denominatorData.type},
                dataParams, 
                dateList
            )||0
        }
    }
    return rtn;   
}
export default getDataForBins