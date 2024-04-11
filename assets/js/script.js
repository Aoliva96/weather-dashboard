// TODO: Searchbar (search for city, change forecast to that city, & add city to search history)
// TODO: Search History (change display back to clicked city in history)
// TODO: Current Weather (name, date, weather icon, temp, humidity, & wind speed)
// TODO: 5-Day Forecast (date, weather icon, temp, humidity, & wind speed for each day card)

let city = "San Francisco";
const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";
const APIQuery = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIKey}`;

// Global API value storage
let globalWeatherData = {};

fetch(APIQuery)
  .then((response) => response.json())
  .then((data) => {
    // Extract values
    globalWeatherData.conditions = data.weather[0].description;
    globalWeatherData.humidity = data.main.humidity;
    globalWeatherData.icon = data.weather[0].icon;
    globalWeatherData.iconURL = `https://openweathermap.org/img/wn/${globalWeatherData.icon}@2x.png`;
    globalWeatherData.temperature = Math.round(data.main.temp);
    globalWeatherData.wind = data.wind.speed;

    // Log values (for debugging)
    console.log("Conditions:", globalWeatherData.conditions);
    console.log("Humidity (%):", globalWeatherData.humidity);
    console.log("Weather Icon Code:", globalWeatherData.icon);
    console.log("Weather Icon URL:", globalWeatherData.iconURL);
    console.log("Temperature (F):", globalWeatherData.temperature);
    console.log("Wind Speed (MPH):", globalWeatherData.wind);
  })
  .catch((error) => {
    console.error("Error fetching OpenWeatherMap API data:", error);
  });

console.log(globalWeatherData);

// let city = "San Francisco";
// const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";
// const APIQuery = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIKey}`;

// fetch(APIQuery)
//   .then((response) => response.json())
//   .then((data) => {
//     // Extract values
//     const conditions = data.weather[0].description;
//     const rawTemp = data.main.temp;
//     const temperature = Math.round(rawTemp);
//     const wind = data.wind.speed;
//     const humidity = data.main.humidity;
//     const icon = data.weather[0].icon;

//     // Get weather icon URL
//     const iconQuery = `https://openweathermap.org/img/wn/${icon}@2x.png`;

//     // Log values (for debugging)
//     console.log("Conditions:", conditions);
//     console.log("Temperature (F):", temperature);
//     console.log("Wind Speed (MPH):", wind);
//     console.log("Humidity (%):", humidity);
//     console.log("Weather Icon Code:", icon);
//     console.log("Weather Icon URL:", iconQuery);
//   })
//   .catch((error) => {
//     console.error("Error fetching OpenWeatherMap API data:", error);
//   });
