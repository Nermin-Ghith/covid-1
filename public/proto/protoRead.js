var Pbf = require('pbf');
var Dots = require('./dotDensity.js').Dots;
var axios = require('axios');

axios.get("http://localhost:8080/dotsBinary.pbf",
        {
            responseType: 'arraybuffer'
        })
        .then((response) => {
            
            var pbf = new Pbf(response.data);
            var obj = Dots.read(pbf);

            console.log(obj)
        })
        .catch((error) => console.log(error));
// // read

// console.log(obj)