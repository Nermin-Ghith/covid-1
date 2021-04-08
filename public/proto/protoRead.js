var Pbf = require('pbf');
var Rows = require('./flatData.js').Rows;
var axios = require('axios');

axios.get("http://localhost:8080/test3.pbf",
        {
            responseType: 'arraybuffer'
        })
        .then((response) => {
            var t0 = Date.now()
            var pbf = new Pbf(response.data);
            var obj = Rows.read(pbf);
            console.log(Date.now() - t0);
        })
        .catch((error) => console.log(error));
// // read

// console.log(obj)