
// ============= Packages =============

const express = require('express');
require('dotenv').config(); // reads the file : `.env`


// ============= Global Variables =============

const PORT = process.env.PORT || 3003; // short cuircuiting and choosing PORT if it exists in the env, otherwise 3003
const app = express();
// app.use(cors()); // enables the server to talk to local things



// ============= Routes =============

// app.get('/location', (request, response) => {

//   // load json from file
//   // pass it through the constructor
//   // send it to the front end

//   const jsonObject = require('./data/location.json');
//   const constructedLocation = new Location(jsonObject);

//   response.send(constructedLocation);

// });



// ============= Start Server =============

// app.listen(PORT, () => console.log(`Yass! Connected!`));
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));
