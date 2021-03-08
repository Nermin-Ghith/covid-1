const averageRange = (data, index, range) => {
  if (range === null) return data[index]
  let tempData = 0;
  let lastGoodData = 0;
  for (let i=index-range; i <= index; i++) {
    tempData += data[i]||lastGoodData
    lastGoodData = data[i]||lastGoodData
  }
  return tempData/range
}

export default function dataFn(numeratorData, denominatorData, dataParams){
  // destructure parameters
  const { 
    nProperty, nIndex,
    dProperty, dIndex, 
    scale
  } = dataParams;
  
  // if the range for numerator or denominator is less than the length of data
  // instead use the length of data
  const nRange = nIndex <= dataParams.nRange ? nIndex : dataParams.nRange;
  const dRange = dIndex <= dataParams.dRange ? dIndex : dataParams.dRange;
  
  const numeratorValue = 
    // time series data, with a range
    numeratorData.type === 'time-series-cumulative' && nRange !== null ? (numeratorData.data[nIndex] - numeratorData.data[nIndex-nRange]||0)/(nRange||1) :
    // time series data, cumulative
    numeratorData.type === 'time-series-cumulative' ? numeratorData.data[nIndex] :
    // property data, like uninsured or population stats
    numeratorData.type === 'property' ? numeratorData.data[nProperty] : 
    // time series, non-cumulative data
    numeratorData.type === 'time-series' ? averageRange(numeratorData.data, nIndex, nRange) :
    0
  
  const denominatorValue = 
    dProperty === null && dIndex === null ? 1 :
    denominatorData.type === 'time-series-cumulative' && dRange !== null  ? (denominatorData.data[dIndex] - denominatorData.data[dIndex-dRange]||0)/(dRange||1) :
    denominatorData.type === 'time-series-cumulative' ? denominatorData.data[dIndex] :
    denominatorData.type === 'property' ? denominatorData.data[dProperty] : 
    denominatorData.type === 'time-series' ? averageRange(denominatorData.data, dIndex, dRange) :
    0

  return ( numeratorValue / denominatorValue ) * (scale||1);
}