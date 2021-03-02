const fs = require("fs");

var myObj = []

for (let i = 0; i < 1_000_000; i++){
    myObj.push([i%8, Math.round(Math.random()*1e10)/1e6,Math.round(Math.random()*1e10)/1e6,])
}

fs.writeFileSync('dotsJson', JSON.stringify(myObj))