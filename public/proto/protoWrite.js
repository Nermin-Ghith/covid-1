const fs = require("fs");
const Schema = require("./dotDensity_pb");
const axios = require('axios');

const dots = new Schema.Dots();

async function getData(){
    const dotData = await axios.get('http://localhost:8080/points_merged.geojson')
    const features = dotData.data.features
    
    for (let i = 0; i < features.length; i++){
        const currentDot = new Schema.Dot()
        currentDot.setRacecode(features[i].properties.race_code)
        currentDot.setLatitude(features[i].properties.latitude)
        currentDot.setLongitude(features[i].properties.longitude)
        dots.addDots(currentDot)
    }

    const bytes =  dots.serializeBinary()
    fs.writeFileSync("dotsBinary3", bytes)
}

getData()

