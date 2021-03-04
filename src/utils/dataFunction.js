// branchless variant
// const dataFn = (numeratorData, numeratorProperty, index, range, denominatorData, denominatorProperty, denominatorIndex, denominatorRange, scale)  => {

//     return (
//       (
//         (
//           (
//             (numeratorData[index]||numeratorData[numeratorProperty])
//             -
//             ((range!==null)&&(numeratorData[index-range]))
//           )
          
//           /
//           (range+(range===null))
//         )
//       /
//         (
//           (
//             (
//               (denominatorData[denominatorIndex]||denominatorData[denominatorProperty])
//               -
//               ((denominatorRange!==null)&&(denominatorData[denominatorIndex-denominatorRange]))
//             )
//             /
//             (denominatorRange+(denominatorRange===null))
//           )
//           ||
//             (denominatorData[denominatorProperty])
//           || 
//           1
//         )
//       )
//       *
//       scale
//     )
// }

// export default dataFn;
const averageNumerator = (data, index, range, dateList) => {
  let tempData = 0;
  let lastGoodData = 0;
  for (let i=index-range; i <= index; i++) {
    tempData += data[dateList[i]]||lastGoodData
    lastGoodData = data[dateList[i]]||lastGoodData
  }
  return tempData/range
}

const dataFn = (numeratorData, denominatorData, dataParams, dateList)  => {
  const { 
    nProperty, nIndex,
    dProperty, dIndex, 
    nType, dType,
    scale
  } = dataParams;

  const nRange = nIndex <= dataParams.nRange ? nIndex : dataParams.nRange;
  const dRange = dIndex <= dataParams.dRange ? dIndex : dataParams.dRange;

  const numeratorValue = 
    numeratorData.type === 'time-series-cumulative' ? (numeratorData.data[dateList[nIndex]] - numeratorData.data[dateList[nIndex-nRange]]||0)/nRange||1 :
    numeratorData.type === 'property' ? numeratorData.data[nProperty] : 
    numeratorData.type === 'time-series' ? averageNumerator(numeratorData.data, nIndex, nRange, dateList) :
    0
  
  const denominatorValue = 
    dProperty === null && dIndex === null ? 1 :
    denominatorData.type === 'time-series-cumulative' ? (denominatorData.data[dateList[dIndex]] - denominatorData.data[dateList[dIndex-dRange]]||0)/dRange||1 :
    denominatorData.type === 'property' ? denominatorData.data[dProperty] : 
    denominatorData.type === 'time-series' ? averageNumerator(denominatorData.data, dIndex, dRange, dateList) :
    0
    
  return ( numeratorValue / denominatorValue ) * (scale||1);

  // if (numeratorData === undefined) {
  //   return null;
  // } else if ((nProperty !== null && numeratorData[nProperty] === undefined) && (nIndex !== null && numeratorData[nIndex] === undefined)){
  //   return null;
  // } else if (nType ==='time-series' && dType === 'time-series') {
  //   if (nRange === null & dRange === null) {
  //     return (
  //       (numeratorData[nIndex])
  //       /
  //       (denominatorData[dIndex])
  //       *scale   
  //     )

  //   } else {
  //     return (
  //       ((numeratorData[nIndex]-numeratorData[nIndex-nRange])/nRange)
  //       /
  //       ((denominatorData[dIndex]-denominatorData[dIndex-dRange])/dRange)
  //       *scale   
  //     )
  //   }
  // } else if (dProperty===null&&nRange===null){ // whole count or number -- no range, no normalization
  //   return (numeratorData[nProperty]||numeratorData[nIndex])*scale
  // } else if (dProperty===null&&nRange!==null){ // range number, daily or weekly count -- no normalization
  //   return (numeratorData[nIndex]-numeratorData[nIndex-nRange])/nRange*scale
  // } else if (dProperty!==null&&nRange===null){ // whole count or number normalized -- no range
  //   return (numeratorData[nProperty]||numeratorData[nIndex])/(denominatorData[dProperty]||denominatorData[dIndex])*scale
  // } else if (dProperty!==null&&nRange!==null&&dRange===null){ // range number, daily or weekly count, normalized to a single value
  //   return (
  //     (numeratorData[nIndex]-numeratorData[nIndex-nRange])/nRange)/(denominatorData[dProperty]||denominatorData[dIndex]
  //       )*scale
  // // } else if (dProperty!==null&&nRange!==null&&dRange!==null){ // range number, daily or weekly count, normalized to a range number, daily or weekly count
  // //   console.log('getting the right col')
  // //   return (
  // //     (numeratorData[nIndex]-numeratorData[nIndex-nRange])/nRange)
  // //     /
  // //     ((denominatorData[dIndex]-denominatorData[dIndex-dIndex])/dIndex)
  // //     *scale
  // } else {      
  //   return 0;
  // }
}

export default dataFn;