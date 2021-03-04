import * as d3 from 'd3-dsv';
import { findDateIndices } from '../utils';
// this asynchronous funciton fetches the CSV then parses it according to parameters passed to the function
// d3 is used for auto-typing the csv, and the findDateIndices utility is used to find all dates in the current csv
async function getParseCSV(params){
  // fetch CSV and return typed object
  const {url, joinColumn, accumulate, dateList} = params;
  const data = await fetch(url).then(response => { return response.ok ? response.text() : Promise.reject(response.status); }).then(text => d3.csvParse(text, d3.autoType));
  // declare return object
  let rtn = {};
  // get join column and date indices using Filter array method and date indices utility
  const dateIndices = dateList !== undefined ? findDateIndices(dateList, Object.keys(data[0])) : null; 

  // if the CSV should be cumulative but is currently daily new, tag accumulate and this adds up days as it goes
  if (accumulate) {
    for(let n=0; n<data.length; n++){
      for(let i=1; i<dateList.length; i++){
        data[n][dateList[i]] = data[n][dateList[i]]+(data[n][dateList[i-1]]||0)
      }
      rtn[data[n][joinColumn]] = data[n]
    }
    return {data: rtn, columns: Object.keys(data[0]), dateIndices}
  } else {
    for(let n=0; n<data.length; n++){
      rtn[data[n][joinColumn]] = data[n]
    }
    return {data: rtn, columns: Object.keys(data[0]), dateIndices}
  }
}

export default getParseCSV