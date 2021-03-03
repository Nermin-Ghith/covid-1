const fs = require("fs");
const Schema = require("./dotDensity_pb");

const dots = new Schema.Dots();

for (let i = 0; i < 1_000_000; i++){
    const currentDot = new Schema.Dot()
    currentDot.setRacecode(i%8)
    currentDot.setLatitude(Math.round(Math.random()*1e10)/1e6)
    currentDot.setLongitude(Math.round(Math.random()*1e10)/1e6)
    dots.addDots(currentDot)
}
const bytes =  dots.serializeBinary()
fs.writeFileSync("dotsBinary2", bytes)