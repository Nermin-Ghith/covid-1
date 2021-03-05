import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Helper and Utility functions //
// first row: data loading
// second row: data parsing for specific outputs
// third row: data accessing
import { 
  getParseCSV, mergeData, getColumns, loadJson,
  getDataForBins, getDataForCharts, getDataForLisa, getDateLists,
  getLisaValues, getCartogramValues, getDateIndices } from '../../utils'; //getVarId

// Actions -- Redux state manipulation following Flux architecture //
// first row: data storage
// second row: data and metadata handling 
// third row: map and variable parameters
import { 
  dataLoad, dataLoadExisting, storeLisaValues, storeCartogramData, setDates, setNotification,
  setMapParams, setUrlParams, setPanelState } from '../../actions';

import { MapSection, NavBar, VariablePanel, Legend,  TopPanel, Preloader,
  DataPanel, MainLineChart, Scaleable, Draggable, InfoBox,
  NotificationBox, Popover } from '../../components';  

import { colorScales, fixedScales, dataPresets, variablePresets, colors } from '../../config';

// Main function, App. This function does 2 things:
// 1: App manages the majority of the side effects when the state changes.
//    This takes the form of React's UseEffect hook, which listens
//    for changes in the state and then performs the functions in the hook.
//    App listens for different state changes and then calculates the relevant
//    side effects (such as binning calculations and GeoDa functions, column parsing)
//    and then dispatches new data to the store.
// 2: App assembles all of the components together and sends Props down
//    (as of 12/1 only Preloader uses props and is a higher order component)

const getDefaultDimensions = () => ({
  defaultX: window.innerWidth <= 1024 ? window.innerWidth*.1 : window.innerWidth-400, 
  defaultXLong: window.innerWidth <= 1024 ? window.innerWidth*.1 :window.innerWidth-575,
  defaultY: window.innerWidth <= 1024 ? window.innerHeight*.25 : 75,
  defaultWidth: window.innerWidth <= 1024 ? window.innerWidth*.8 : 300,
  defaultWidthLong: window.innerWidth <= 1024 ? window.innerWidth*.8 : 450,
  defaultHeight: window.innerWidth <= 1024 ? window.innerHeight*.4 : 300,
  defaultHeightManual: window.innerWidth <= 1024 ? window.innerHeight*.7 : window.innerHeight*.5,
  defaultWidthManual: window.innerWidth <= 1024 ? window.innerWidth*.5 : window.innerWidth*.35,
  defaultXManual: window.innerWidth <= 1024 ? window.innerWidth*.25 : window.innerWidth*.25,
  defaultYManual: window.innerWidth <= 1024 ? window.innerHeight*.15 : window.innerHeight*.325,
  minHeight: window.innerWidth <= 1024 ? window.innerHeight*.5 : 200,
  minWidth: window.innerWidth <= 1024 ? window.innerWidth*.5 : 200,
})

function App() {

  const dateLists = getDateLists()

  // These selectors access different pieces of the store. While App mainly
  // dispatches to the store, we need checks to make sure side effects
  // are OK to trigger. Issues arise with missing data, columns, etc.
  const {storedTabularData, storedGeojson, currentNumerator, currentDenominator, currentData, mapParams, dataParams, dateIndices, mapLoaded } = useSelector(state => state);
  const fullState = useSelector(state => state)

  // gda_proxy is the WebGeoda proxy class. Generally, having a non-serializable
  // data in the state is poor for performance, but the App component state only
  // contains gda_proxy.
  const [gda_proxy, set_gda_proxy] = useState(null);
  const [defaultDimensions, setDefaultDimensions] = useState({...getDefaultDimensions()})
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();  
  // // Dispatch helper functions for side effects and data handling
  // Get centroid data for cartogram
  // const getCentroids = (geojson, gda_proxy) =>  dispatch(setCentroids(gda_proxy.GetCentroids(geojson), geojson))

  // Main data loader
  // This functions asynchronously accesses the Geojson data and CSVs
  //   then performs a join and loads the data into the store
  const loadData = async (params, gda_proxy) => {
    setIsLoading(true)
    // destructure parameters
    const { geojson, tables } = params;
    const currentNumerator = tables[dataParams.numerator]['csv'];
    const currentDenominator = dataParams.denominator === 'properties' ? geojson : tables[dataParams.denominator]['csv'];
    // check for already loaded data
    for (const property in tables) { if (storedTabularData.hasOwnProperty(property.csv)) delete tables.property }
    
    // promise all data fetching - CSV and Json
    const csvPromises = Object.values(tables).map(entry => 
      getParseCSV({
        url:`${process.env.PUBLIC_URL}/csv/${entry.csv}.csv`, 
        joinColumn: entry.joinColumn, 
        accumulate: entry.accumulate,
        dateList: dateLists[entry.dateList]
      }));
    
    // fetch geodata and CSV data
    const geoData = await loadJson(`${process.env.PUBLIC_URL}/geojson/${geojson}`, gda_proxy);
    const csvData = await (await Promise.all([...csvPromises])).reduce((map, obj, index) => { 
      map[Object.values(tables)[index]['csv']] = {...obj, ...Object.values(tables)[index]};
      return map;
    }, {});
    const tabularData = {
      ...csvData,
      [geojson]: {
        'type':'property',
        'data': geoData.data.features.map(f => f.properties).reduce((map, obj) => { map[obj.GEOID] = obj; return map; }, {})
      }
    } 
    
    // extract metadata and chart data
    const lastIndex = csvData[currentNumerator] ? csvData[currentNumerator].dateIndices.slice(-1)[0] : null;
    const chartData = getDataForCharts({data: tabularData[currentNumerator], dataParams, dateLists});
    const binData = getDataForBins({
      numeratorData: tabularData[currentNumerator], 
      denominatorData: tabularData[currentDenominator], 
      dataParams:{...dataParams, nIndex: lastIndex || dataParams.nIndex, binIndex: lastIndex || dataParams.binIndex}, 
      dateLists
    });

    let bins;

    if (dataParams.fixedScale === null || dataParams.fixedScale === undefined){
      // calculate breaks
      let nb = gda_proxy.custom_breaks(
        geojson, 
        mapParams.mapType,
        mapParams.nBins,
        null,
        binData
      );        

      bins = {
        bins: mapParams.mapType === "natural_breaks" ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
        breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
      }
    } else {
      bins = fixedScales[dataParams.fixedScale]
    }
    // store data, data name, and column names
    dispatch(
      dataLoad({
        tabularData,
        geoData,
        currentData: geojson,
        currentNumerator,
        currentDenominator,
        chartData,
        mapParams: {
          bins,
          colorScale: colorScales[dataParams.colorScale || mapParams.mapType]
        },
        variableParams: {
          nIndex: lastIndex || dataParams.nIndex,
          binIndex: lastIndex || dataParams.binIndex
        },
      })
    )
    setIsLoading(false)
  }

  const updateBins = useCallback((params) => {
    const { numeratorData, denominatorData, currentData, dataParams, mapParams, gda_proxy, colorScales } = params;

    // If tabular data not loaded, return nothing
    if ( currentNumerator === undefined ) { return };

    if (gda_proxy !== null && numeratorData && mapParams.mapType !== "lisa"){
      if (dataParams.fixedScale === null || mapParams.mapType !== 'natural_breaks') {
        let binData = getDataForBins({
          numeratorData, 
          denominatorData, 
          dataParams, 
          dateLists
        });
        
        let nb = gda_proxy.custom_breaks(
          currentData, 
          mapParams.mapType, 
          mapParams.nBins, 
          null, 
          binData
        )

        dispatch(
          setMapParams({
            bins: {
              bins: mapParams.mapType === 'natural_breaks' ? nb.bins : ['Lower Outlier','< 25%','25-50%','50-75%','>75%','Upper Outlier'],
              breaks: [-Math.pow(10, 12), ...nb.breaks.slice(1,-1), Math.pow(10, 12)]
            },
            colorScale: mapParams.mapType === 'natural_breaks' ? colorScales[dataParams.colorScale || mapParams.mapType] : colorScales[mapParams.mapType || dataParams.colorScale]
          })
        )
      } else {
        dispatch(
          setMapParams({
            bins: fixedScales[dataParams.fixedScale],
            colorScale: colorScales[dataParams.fixedScale]
          })
        )
      }
    }
  },[]);

  // After runtime is initialized, this loads in gda_proxy to the state
  // TODO: Recompile WebGeoda and load it into a worker
  useEffect(() => {
    let paramsDict = {}; 
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams ) { paramsDict[key] = value; }

    if (!paramsDict.hasOwnProperty('v')) {
      // do nothing, most of the time
    } else if (paramsDict['v'] === '2') {
      dispatch(
        setUrlParams(paramsDict, variablePresets)
      );
    } else if (paramsDict['v'] === '1') {
      dispatch(setNotification(`
          <h2>Welcome to the Atlas v2!</h2>
          <p>
          The share link you have entered is for an earlier release of the US Covid Atlas. 
          Explore the new version here, or continue using your current share link by click below.
          <a href="./vintage/map.html${window.location.search}" target="_blank" rel="noopener noreferrer" style="color:${colors.yellow}; text-align:center;">
            <h3 style="text-align:center">
              US Covid Atlas v1
            </h3>  
          </a>
          </p>
        `))
    }

    if (window.innerWidth <= 1024) {
      dispatch(setPanelState({
        variables:false,
        info:false,
        tutorial:false,
        lineChart: false
      }))
    }

    import('jsgeoda').then(jsgeoda => {
      const newGeoda = async () => {
        let geoda = await jsgeoda.New();
        set_gda_proxy(geoda);
        window.gda_proxy = geoda
      }

      if (window.gda_proxy === undefined) {
        newGeoda()
      } else {
        set_gda_proxy(window.gda_proxy)
      }
    
    })
    dispatch(setDates(dateLists.isoDateList))
  },[])


  // On initial load and after gda_proxy has been initialized, this loads in the default data sets (USA Facts)
  // Otherwise, this side-effect loads the selected data.
  // Each conditions checks to make sure gda_proxy is working.
  useEffect(() => {
    if (gda_proxy === null) {
      return;
    } else if (storedTabularData === {}) {
      loadData(
        dataPresets[currentData],
        gda_proxy
      )
    } else if (storedTabularData[currentNumerator] === undefined) {
      loadData(
        dataPresets[currentData],
        gda_proxy
      )
    } else if (storedTabularData[currentNumerator] !== undefined) {
      const lastIndex = storedTabularData[currentNumerator]['dateIndices'].slice(-1)[0]
      dispatch(
        dataLoadExisting({
          variableParams: {
            nIndex: lastIndex || dataParams.nIndex,
            dIndex: dataParams.dType === 'time-series' ? lastIndex : dataParams.dType,
            dRange: dataParams.dType === 'time-series' ? dataParams.nRange : dataParams.dRange,
            binIndex: lastIndex || dataParams.nIndex,
          },
          chartData: getDataForCharts({data: storedTabularData[currentNumerator], dataParams, dateLists})
        })
      )
      updateBins({
        numeratorData: storedTabularData[currentNumerator], 
        denominatorData: storedTabularData[currentDenominator], 
        currentData, 
        dataParams: { 
          ...dataParams,  
          nIndex: lastIndex || dataParams.nIndex,
          binIndex: lastIndex || dataParams.nIndex,
        },  
        mapParams, 
        gda_proxy, 
        colorScales 
      });
    }
  },[gda_proxy, currentData])

  // This listens for gda_proxy events for LISA and Cartogram calculations
  // Both of these are computationally heavy.
  useEffect(() => {
    if (gda_proxy !== null && mapParams.mapType === "lisa" && storedGeojson[currentData] !== undefined){
      dispatch(
        storeLisaValues(
          getLisaValues(
            gda_proxy, 
            currentData, 
            getDataForLisa({
              numeratorData: storedTabularData[currentNumerator], 
              denominatorData: storedTabularData[currentDenominator], 
              dataParams, 
              order: storedGeojson[currentData].indexOrder, 
              dateLists
            })
          )
        )
      )
    }
    if (gda_proxy !== null && mapParams.vizType === 'cartogram' && storedGeojson[currentData] !== undefined){
      // let tempId = getVarId(currentData, dataParams)
      if (storedGeojson[currentData] !== undefined) {
        dispatch(
          storeCartogramData(
            getCartogramValues(
              gda_proxy, 
              currentData, 
              getDataForLisa({
                numeratorData: storedTabularData[currentNumerator], 
                denominatorData: storedTabularData[currentDenominator], 
                dataParams, 
                order: storedGeojson[currentData].indexOrder, 
                dateLists
              })
            )
          )
        )
      }
    }
  }, [currentData, storedGeojson[currentData], dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, mapParams.mapType, mapParams.vizType])
  
  // Trigger on parameter change for metric values
  // Gets bins and sets map parameters
  useEffect(() => {
    if (storedTabularData.hasOwnProperty(currentNumerator) && gda_proxy !== null && mapParams.binMode !== 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins({
        numeratorData: storedTabularData[currentNumerator], 
        denominatorData: storedTabularData[currentDenominator], 
        currentData, 
        dataParams, 
        mapParams, 
        gda_proxy, 
        colorScales 
      });
    }
  }, [dataParams.numerator, dataParams.nProperty, dataParams.nRange, dataParams.denominator, dataParams.dProperty, dataParams.dRange, mapParams.mapType, mapParams.vizType] );

  // Trigger on index change while dynamic bin mode
  useEffect(() => {
    if (storedTabularData.hasOwnProperty(currentNumerator) && gda_proxy !== null && mapParams.binMode === 'dynamic' && mapParams.mapType !== 'lisa') {
      updateBins({
        numeratorData: storedTabularData[currentNumerator], 
        denominatorData: storedTabularData[currentDenominator], 
        currentData, 
        dataParams: { ...dataParams, binIndex: dataParams.nIndex },
        mapParams, 
        gda_proxy, 
        colorScales 
      });
    }
  }, [dataParams.nIndex, dataParams.dIndex, mapParams.binMode, dataParams.variableName, dataParams.nRange, mapParams.mapType, mapParams.vizType] ); 

  // default width handlers on resize
  useEffect(() => {
    setDefaultDimensions({...getDefaultDimensions()})
  }, [window.innerHeight, window.innerWidth])
  // const dragHandlers = {onStart: this.onStart, onStop: this.onStop};


  return (
    <div className="Map-App">
      {/* <Preloader loaded={mapLoaded} /> */}
      <NavBar />
      {isLoading && <div id="loadingIcon" style={{backgroundImage: `url('${process.env.PUBLIC_URL}assets/img/bw_preloader.gif')`}}></div>}
      <header className="App-header" style={{position:'fixed', left: '20vw', top:'100px', zIndex:10}}>
        <button onClick={() => console.log(fullState)}>Log state</button>
      </header>
      <div id="mainContainer" className={isLoading ? 'loading' : ''}>
        {/* <MapSection /> */}
        <TopPanel />
        <Legend 
          variableName={dataParams.variableName} 
          colorScale={mapParams.colorScale}
          bins={mapParams.bins.bins}
          fixedScale={dataParams.fixedScale}
          />
        <VariablePanel />
        {/* <DataPanel /> */}
        <Popover /> 
        <NotificationBox />  
        <Draggable 
          z={9}
          defaultX={defaultDimensions.defaultXLong}
          defaultY={defaultDimensions.defaultY}
          title="lineChart"
          content={
          <Scaleable 
            content={
              <MainLineChart />
            } 
            title="lineChart"
            defaultWidth={defaultDimensions.defaultWidthLong}
            defaultHeight={defaultDimensions.defaultHeight}
            minHeight={defaultDimensions.minHeight}
            minWidth={defaultDimensions.minWidth} />
        }/>      
        <Draggable 
          z={10}
          defaultX={defaultDimensions.defaultXManual}
          defaultY={defaultDimensions.defaultYManual}
          title="tutorial"
          content={
          <Scaleable 
            content={
              <InfoBox />
            } 
            title="tutorial"
            defaultWidth={defaultDimensions.defaultWidthManual}
            defaultHeight={defaultDimensions.defaultHeightManual}
            minHeight={defaultDimensions.minHeight}
            minWidth={defaultDimensions.minWidth} />
        }/>

      </div>
    </div>
  );
}

export default App;