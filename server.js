
// Creating a server
// 1. touch server.js
// 1.5 touch .eslintrc.json
// 1.5 touch .env
// 2. run `npm init` (say yes to everything) (creates package.json)
// 3. GET THE SERVER RUNNING
// 4. install the packages (libraries) `npm install <PACKAGENAME> <PACKAGENAME> <ETC>`
//    on day 6- those are express and dotenv
//    dotenv : loads the environment file (".env") for us
//    express: the app itself - runs the server (http requests, responses, cookies, servery things)
//    cors: allows local testing of our server
// 5. in the js file - load the packages
// 6. configure the `app`
// 7. tell the server to listen on the port
// 8. start writing routes to handle requests from the client



// ============= Packages =============

const express = require('express');
require('dotenv').config(); // reads the file : `.env`
const cors  = require('cors');
const superagent = require('superagent');



// ============= Global Variables =============

const PORT = process.env.PORT || 3003; // short cuircuiting and choosing PORT if it exists in the env, otherwise 3003
const app = express();
app.use(cors()); // enables the server to talk to local things
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;


// ============= Routes =============

//route one
app.get('/location', sendLocationData);

function sendLocationData(req, res){

  // load json from file
  // pass it through the constructor
  // send it to the front end

  const thingToSearchFor = req.query.city; //this would be the city
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${thingToSearchFor}&format=json`;

  superagent.get(urlToSearch)
    .then(whateverComesBack => {

      const superagentResultArray = whateverComesBack.body;
      const constructedLocations = new Location(superagentResultArray);
      res.send(constructedLocations);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });

}

//route two
app.get('/weather', sendWeatherData);

function sendWeatherData(req, res){
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;


  superagent.get(urlToSearchWeather)
    .then(weatherComingBack => {
      const weatherPass = weatherComingBack.body.data;
      const weatherArr = weatherPass.map(index => new Weather(index));
      res.send(weatherArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}

//route three
app.get('/trails', sendTrailData);

function sendTrailData(req, res){
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  const urlToTrails = `https://www.hikingproject.com/data/get-trails?&lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_API_KEY}`;


  superagent.get(urlToTrails)
    .then(trailData => {
      console.log(trailData.body);
      const trailPass = trailData.body.trails;
      const trailArr = trailPass.map(index => new Trail(index));
      res.send(trailArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
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

function Trail(jsonObject){
  this.name = jsonObject.name;
  this.location = jsonObject.location;
  this.length = jsonObject.length;
  this.stars = jsonObject.stars;
  this.star_votes = jsonObject.starVotes;
  this.summary = jsonObject.summary;
  this.trail_url = jsonObject.url;
  this.conditions = jsonObject.conditionDetails;
  this.condition_date = jsonObject.conditionDate.split(' ',1);
  this.condition_time = jsonObject.conditionDate.split(' ')[1];

}

// ============= Start Server =============

// app.listen(PORT, () => console.log(`Yass! Connected!`));
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));
