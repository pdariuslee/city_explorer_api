
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
const pg = require('pg');
const { response } =  require('express');


// ============= Global Variables =============

const PORT = process.env.PORT || 3003; // short cuircuiting and choosing PORT if it exists in the env, otherwise 3003
const app = express();
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

// ============= Express configs =============

app.use(cors()); // enables the server to talk to local things

// client definition is anything that asks a server for anything
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.error(error));

// ============= Routes =============

//route one
app.get('/location', sendLocationData);


function sendLocationData(req, res){

  // load json from file / pass it through the constructor /send it to the front end

  const sqlStatement = 'SELECT * FROM locations;';
  const locationSearch = req.query.city; //this would be the city

  client.query(sqlStatement)
    .then(resultFromSql => {

      // console.log(resultFromSql.rows);
      let existingValue = resultFromSql.rows.map(element => element.search_query);
      if(existingValue.includes(locationSearch)){
        client.query(`SELECT * FROM locations WHERE search_query = '${locationSearch}'`)
          .then(storedData => {
            res.send(storedData.rows[0]);
          });
      } else {
        const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${locationSearch}&format=json`;

        superagent.get(urlToSearch)
          .then(APIresult => {

            const superagentResultArray = APIresult.body;
            // console.log(superagentResultArray[0].display_name);
            const queryString = ('INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)');
            const valueArray = [locationSearch, superagentResultArray[0].display_name, superagentResultArray[0].lat, superagentResultArray[0].lon];
            client.query(queryString, valueArray)
              .then( insertedData => {
                // console.log(insertedData);
                res.send(new Location(superagentResultArray));
              });
            // const constructedLocations = new Location(superagentResultArray);



            // res.send(constructedLocations);
          });
      }
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
      // console.log(trailData.body);
      const trailPass = trailData.body.trails;
      const trailArr = trailPass.map(index => new Trail(index));
      res.send(trailArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}


//route 4
app.get('/movies', sendMovies);

function sendMovies(req, res){

  let movieTitle = req.query.search_query;
  const urlToAPIMovies = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${movieTitle}&page=1&include_adult=false`;


  superagent.get(urlToAPIMovies)
    .then(APIMovieData => {

      const movieArr = APIMovieData.body.results.map(movieData => new Movie(movieData));
      res.send(movieArr);

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

function Movie(jsonObject){
  this.title = jsonObject.original_title;
  this.overview = jsonObject.overview;
  this.average_votes = jsonObject.vote_average;
  this.total_votes = jsonObject.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w1280' + jsonObject.backdrop_path;
  this.popularity = jsonObject.popularity;
  this.released_on = jsonObject.release_date;
}

// ============= Start Server =============

// app.listen(PORT, () => console.log(`Yass! Connected!`));
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));

  });
