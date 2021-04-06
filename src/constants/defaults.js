export const INITIAL_STATE = {
  geodaProxy: null,
  storedData: {},
  storedGeojson: {},
  storedLisaData: {},
  storedCartogramData: {},
  storedCSV: {},
  storedMobilityData: {},
  cols: {},
  dateIndices: {},
  currentData: 'county_usfacts.geojson',
  chartData: [{}],
  selectionKeys: [],
  selectionIndex: [],
  centroids: {},
  dates: {},
  currDate: '',
  currDateIndex: '',
  startDateIndex: '',
  currentZVariable: null,
  currentMethod: 'natural_breaks',
  currentOverlay: '',
  currentResource: '',
  dataParams: {
    variableName: 'Confirmed Count per 100K Population',
    numerator: 'cases',
    nType: 'time-series',
    nProperty: null,
    nRange: 7,
    nIndex:null,
    denominator: 'properties',
    dType: 'characteristic',
    dProperty: 'population',
    dRange:null,
    dIndex:null,
    scale:100000,
    binIndex: '',
    scale3D: 1000,
    zAxisParams: null,
    fixedScale: null,
    colorScale: null,
    storedRange: null,
    dataNote: false
  },
  mapParams: {
    mapType: 'natural_breaks',
    bins: {
      bins: [],
      breaks: []
    },
    binMode: '',
    fixedScale: null,
    nBins: 8,
    vizType: '2D',
    activeGeoid: '',
    overlay: '',
    resource: '',
    colorScale: [
      [240,240,240],
      [255,255,204],
      [255,237,160],
      [254,217,118],
      [254,178,76],
      [253,141,60],
      [252,78,42],
      [227,26,28],
      [177,0,38],
    ],
  },
  panelState: {
    variables:true,
    info:false,
    tutorial:false,
    lineChart:true,
    context: false,
    contextPos: {x:null,y:null}
  },
  storedRange: null,
  currentGeoid: '',
  sidebarData: {},
  anchorEl: null,
  mapLoaded: false,
  notification: {
    info: null,
    location: ''
  },
  urlParams: {},
  tooltipContent: {
    x:0,
    y:0,
    data: null
  }
};