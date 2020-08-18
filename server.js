
// ============= Packages =============

const express = require('express');
require('dotenv').config(); // reads the file : `.env`
const cors  = require('cors');
const superagent = require('superagent');



// ============= Global Variables =============

const PORT = process.env.PORT || 3003; // short cuircuiting and choosing PORT if it exists in the env, otherwise 3003
const app = express();
app.use(cors()); // enables the server to talk to local things



// ============= Routes =============

app.get('/location', (request, response) => {

  // load json from file
  // pass it through the constructor
  // send it to the front end

  const jsonObject = require('./data/location.json');
  const constructedLocation = new Location(jsonObject);

  response.send(constructedLocation);

});


app.get('/weather', sendWeatherData);

function sendWeatherData(request, response){
  // read the json file
  // format the data
  // send it with .send

  const jsonObj = require('./data/weather.json');
  const arrFromJson = jsonObj.data;

  // request.query is where the question always lives (Amelia asks for 3 claps -> request.query.claps)



  // .catch(error => {
  //   console.log(error);
  //   response.status(500).send(error.message);
  // });



  const weatherArray = arrFromJson.map(objInTheJSON => {
    return new Weather(objInTheJSON);

  });
  // for each obj in the json file, make a constructed obj and put it in arr
  // send arr
  response.send(weatherArray);
}

// ============= All other functions =============


function Location(jsonObject){
  // console.log(jsonObject);

  this.formatted_query = jsonObject[0].display_name;
  this.latitude = jsonObject[0].lat;
  this.longitude = jsonObject[0].lon;

}


function Weather(jsonObject){
  // console.log(jsonObject);

  this.forecast = jsonObject.weather.description;
  this.time = jsonObject.valid_date;
}


// ============= Start Server =============

// app.listen(PORT, () => console.log(`Yass! Connected!`));
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));
