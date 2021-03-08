const getDataForCharts = (params) => {
    const { data, dataParams, dateLists } = params;
    if (data === undefined) return [{}]
    // get list of all features (GEOIDs/FIPS)
    const features = Object.keys(data.data);
    const dateIndices = data.dateIndices;
    const dateList = dateLists[data.dateList]
    const name = params.name ? params.name : null;
    const interval = params.interval ? params.interval : 1;
    
    // counter for days 
    let n = 0;
    // return array
    let rtn = new Array((Math.ceil(dateList.length/interval))).fill(null)
    // 7 day average delay -- early data
    let j = interval === 1 ? 7 : 1;

    let countCol;
    let sumCol;

    // based on whether specific to geography, or all cases
    if (name === null) {
        countCol = 'count'
        sumCol = 'sum'
    } else {
        countCol = name + ' Daily Count'
        sumCol = name + ' Total Cases'
    }
    
    while (n<dateList.length) {
        let tempObj = {};
        // if we are missing data for that date, skip it
        if (dateIndices.indexOf(n)===-1){
            tempObj[sumCol] = null;
            tempObj[countCol] = null;
            rtn[n/interval] = tempObj;
            n+=interval;
        } else {
            // loop through features and sum values for index
            let sum = 0;
            for (let i=0; i<features.length; i++) {
                if (data.data[features[i]] !== undefined) sum += data.data[features[i]][n]||0
            }
            
            tempObj[sumCol] = sum
            tempObj.date = dateList[n]
            tempObj[countCol] = (n < 7 && j === 7)||(n < 1 && j === 1) ? 
                sum : 
                tempObj[countCol] = (sum - rtn[n/interval-j][sumCol])/(j)

            rtn[n/interval] = tempObj;
            n+=interval;
        }
    }
    return rtn;
}

export default getDataForCharts