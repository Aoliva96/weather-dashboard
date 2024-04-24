// New alert banner function
function newAlert(text) {
  const alertElement = document.getElementById("alert");
  const messageElement = document.getElementById("message");
  const closeElement = document.getElementById("close");

  messageElement.textContent = text;
  hider(alertElement);

  closeElement.addEventListener("click", function closeHandler(event) {
    event.preventDefault();
    hider(alertElement);
    closeElement.removeEventListener("click", closeHandler);
  });
}

// Element hider toggle function
function hider(element) {
  if (!element.classList.contains("hider")) {
    element.classList.add("hider");
  } else {
    element.classList.remove("hider");
  }
}

// Handle form data
const form = document.getElementById("cityForm");
const searches = JSON.parse(localStorage.getItem("city-searches")) || [];
const history = document.getElementsByClassName("historyBtn") || [];
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const toggleImp = document.getElementById("toggleImperial");
const toggleMet = document.getElementById("toggleImperial");
let unitSetting = "imperial";

// Update history from localStorage
// updateHistory(searches);

// Assign button handler functions
function searchButtonHandler() {
  const city = document.getElementById("citySearch").value;
  unitSetting = document.getElementById("units").value;

  if (city) {
    if (searches.includes(city)) {
      console.log(`${city} is a duplicate, not added to search history.`);
    } else {
      searches.push(city);
      localStorage.setItem("city-searches", JSON.stringify(searches));
      console.log(`${city} added to search history`);
    }

    // console.log("New searches array:", searches);
    fetchData(city);
    updateHistory(searches);
    form.reset();

    return { city, unitSetting };

    // const newSearch = document.getElementById("citySearch").value;
    // unitSetting = document.getElementById("units").value;

    // if (!newSearch) {
    //   newAlert("City name is required for new forecast.");
    //   return;
    // }

    // if (searches.includes(newSearch)) {
    //   console.log(`${newSearch} is a duplicate, not added to search history.`);
    // } else {
    //   searches.push(newSearch);
    //   localStorage.setItem("city-searches", JSON.stringify(searches));
    //   console.log(`${newSearch} added to search history`);
    // }

    // city = newSearch;
    // console.log("New searches array:", searches);

    // fetchData(newSearch);
    // updateHistory(searches);

    // form.reset();
    // return city, unitSetting;
  }

  newAlert("City name is required for new forecast.");
}

function historyButtonHandler(city) {
  console.log(`${city} history button clicked`);
  unitSetting = document.getElementById("units").value;
  fetchData(city);
  form.reset();

  return { city, unitSetting };
}

// function historyButtonHandler(historySearch) {
//   console.log(`${historySearch} history button clicked`);
//   unitSetting = document.getElementById("units").value;

//   city = historySearch;
//   fetchData(historySearch);
//   form.reset();
//   return city, unitSetting;
// }

function clearButtonHandler() {
  console.log("Clear history button clicked");
  localStorage.clear();
  updateHistory();
  form.reset();
}

// Function to generate history buttons
function updateHistory(searches) {
  const historyContainer = document.getElementById("historyContainer");
  const hrElements = document.querySelectorAll("hr");
  let searchList = [];

  searchList = Array.from(searches);

  if (searchList.length === 0) {
    hider(hrElements[0]);
    hider(hrElements[1]);
    hider(clearBtn);
  }

  searchList.forEach((searchItem) => {
    const listItem = document.createElement("li");
    const historyButton = document.createElement("button");

    historyButton.textContent = searchItem;
    historyButton.classList.add("historyBtn");
    historyButton.type = "button";

    listItem.appendChild(historyButton);
    historyContainer.appendChild(listItem);
  });
}

// function updateHistory(searchHistory) {
//   const container = document.getElementById("historyContainer");
//   const dividers = document.querySelectorAll("hr");

//   let buttons = [];
//   buttons = Array.from(searchHistory);

//   if (buttons.length === 0) {
//     hider(dividers[0]);
//     hider(dividers[1]);
//     hider(clearBtn);
//   }

//   buttons.forEach((element) => {
//     const li = document.createElement("li");
//     const button = document.createElement("button");

//     button.textContent = element;
//     button.classList.add("historyBtn");
//     button.type = "button";
//     li.appendChild(button);
//     container.appendChild(li);
//   });
// }

console.log("Search history:", searches);
updateHistory(searches);

// Add button listeners
searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  searchButtonHandler();
});

clearBtn.addEventListener("click", (event) => {
  event.preventDefault();
  clearButtonHandler();
});

Array.from(history).forEach((historyItem) => {
  let city = historyItem.textContent;

  historyItem.addEventListener("click", (event) => {
    event.preventDefault();
    historyButtonHandler(city);
  });
});

// Global API data storage
const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";
let tempUnit,
  windUnit,
  geoData = [],
  weatherData = [],
  forecastData = [];

// Function to fetch API data
async function fetchData(city) {
  try {
    const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
    const geoResponse = await fetch(geoURL);
    const geoJson = await geoResponse.json();
    const location = geoJson[0];
    const {
      name: cityName,
      country,
      state,
      lat: latitude,
      lon: longitude,
    } = location;
    geoData.push({ cityName, country, state, latitude, longitude });

    const weatherURL = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;
    const forecastURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;

    const [weatherJson, forecastJson] = await Promise.all([
      fetch(weatherURL).then((res) => res.json()),
      fetch(forecastURL).then((res) => res.json()),
    ]);

    const currentWeatherData = processWeatherData(weatherJson);
    const forecastData = processForecastData(forecastJson);

    const fiveDayForecast = forecastData.filter(
      (value, index) => index % 8 === 0
    );

    const { tempUnit, windUnit } = getUnits(unitSetting);

    renderCurrentWeather(currentWeatherData);
    renderForecast(fiveDayForecast, tempUnit, windUnit);

    clearStorageArrays();
  } catch (error) {
    newAlert(`No weather data found for "${city}"`);
    console.error("Error fetching data:", error);
  }
}

// Handle data from current forecast
function processWeatherData(weatherJson) {
  const currentRawDate = new Date(weatherJson.dt * 1000);
  const currentDate = formatDate(currentRawDate);
  const iconURL = `https://openweathermap.org/img/wn/${weatherJson.weather[0].icon}@2x.png`;
  const {
    temp: t,
    wind: { speed: w },
    main: { humidity: h },
  } = weatherJson;
  return { rawDate: currentRawDate, date: currentDate, iconURL, t, w, h };
}

// Handle data from 5-Day forecast
function processForecastData(forecastJson) {
  return forecastJson.list.map((forecast) => {
    const forecastRawDate = new Date(forecast.dt * 1000);
    const forecastDate = formatDate(forecastRawDate);
    const iconURL = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
    const {
      temp: t,
      wind: { speed: w },
      main: { humidity: h },
    } = forecast;
    return { rawDate: forecastRawDate, date: forecastDate, iconURL, t, w, h };
  });
}

// Date formatter
function formatDate(date) {
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

// Unit converter
function getUnits(unitSetting) {
  return unitSetting === "imperial"
    ? { tempUnit: "°F", windUnit: "MPH" }
    : { tempUnit: "°C", windUnit: "KPH" };
}

// Render current forecast HTML
function renderCurrentWeather(currentWeatherData) {
  document.querySelector(
    "h2.title"
  ).innerHTML = `${currentWeatherData.cityName} (${currentWeatherData.date}) <img src="${currentWeatherData.iconURL}" aria-label="icon"`;
  document.querySelector(
    "p.subtitle"
  ).innerHTML = `${stateName}${currentWeatherData.country}`;
  document.querySelector(
    "p.t"
  ).innerHTML = `Temp: ${currentWeatherData.t}${tempUnit}`;
  document.querySelector(
    "p.w"
  ).innerHTML = `Wind: ${currentWeatherData.w} ${windUnit}`;
  document.querySelector(
    "p.h"
  ).innerHTML = `Humidity: ${currentWeatherData.h}%`;
}

// Render 5-Day forecast HTML
function renderForecast(fiveDayForecast, tempUnit, windUnit) {
  const dayCards = document.querySelectorAll(".dayCard");

  dayCards.forEach((dayCard, index) => {
    const forecast = fiveDayForecast[index];

    // Update each dayCard with corresponding forecast data
    const dateEl = dayCard.querySelector(".date");
    dateEl.textContent = forecast.date;

    const iconEl = dayCard.querySelector(".icon");
    iconEl.src = forecast.iconURL;

    const tempEl = dayCard.querySelector(".t");
    tempEl.textContent = `Temp: ${forecast.t}${tempUnit}`;

    const windEl = dayCard.querySelector(".w");
    windEl.textContent = `Wind: ${forecast.w} ${windUnit}`;

    const humidEl = dayCard.querySelector(".h");
    humidEl.textContent = `Humidity: ${forecast.h}%`;
  });
}

// async function fetchData(city) {
//   try {
//     // API call for geolocation data
//     const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
//     const geoResponse = await fetch(geoURL);
//     const geoJson = await geoResponse.json();

//     let state = "";
//     let location = geoJson[0];
//     let cityName = location.name;
//     let country = location.country;
//     let latitude = location.lat;
//     let longitude = location.lon;

//     // const geoQuery = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
//     // const geoResponse = await fetch(geoQuery);
//     // const geoJson = await geoResponse.json();
//     // const cityName = geoJson[0].name;
//     // const country = geoJson[0].country;
//     // const state = geoJson[0].state;
//     // const latitude = geoJson[0].lat;
//     // const longitude = geoJson[0].lon;

//     // Send fetched data to array
//     if (location.state) {
//       state = location.state;
//       geoData.push({ cityName, country, state, latitude, longitude });
//     } else {
//       geoData.push({ cityName, country, latitude, longitude });
//     }

//     // let stateName;
//     // if (state != undefined) {
//     //   geoData.push({
//     //     cityName: cityName,
//     //     country: country,
//     //     state: state,
//     //     latitude: latitude,
//     //     longitude: longitude,
//     //   });
//     //   stateName = `${geoData[0].state}, `;
//     // } else {
//     //   geoData.push({
//     //     cityName: cityName,
//     //     country: country,
//     //     latitude: latitude,
//     //     longitude: longitude,
//     //   });
//     //   stateName = "";
//     // }

//     // Generate API queries w/ geoData
//     const weatherURL = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;
//     const forecastURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;

//     // const weatherQuery = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;
//     // const forecastQuery = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;

//     // API call for current weather data
//     const weatherResponse = await fetch(weatherURL);
//     const weatherJson = await weatherResponse.json();

//     // Convert Unix timestamp to JavaScript Date
//     const currentRawDate = new Date(weatherJson.dt * 1000);
//     const currentDate = `${(currentRawDate.getMonth() + 1)
//       .toString()
//       .padStart(2, "0")}/${currentRawDate
//       .getDate()
//       .toString()
//       .padStart(2, "0")}/${currentRawDate.getFullYear()}`;

//     const icon = weatherJson.weather[0].icon;
//     const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
//     const t = weatherJson.main.temp;
//     const w = weatherJson.wind.speed;
//     const h = weatherJson.main.humidity;

//     // Send fetched data to array
//     weatherData.push({
//       rawDate: currentRawDate,
//       date: currentDate,
//       iconURL: iconURL,
//       t: t,
//       w: w,
//       h: h,
//     });

//     // API call for forecasted weather data
//     const forecastResponse = await fetch(forecastQuery);
//     const forecastJson = await forecastResponse.json();
//     const forecasts = forecastJson.list;

//     forecasts.forEach((forecast) => {
//       // Convert Unix timestamp to JavaScript Date
//       const forecastRawDate = new Date(forecast.dt * 1000);
//       const forecastDate = `${(forecastRawDate.getMonth() + 1)
//         .toString()
//         .padStart(2, "0")}/${forecastRawDate
//         .getDate()
//         .toString()
//         .padStart(2, "0")}/${forecastRawDate.getFullYear()}`;

//       const icon = forecast.weather[0].icon;
//       const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
//       const t = forecast.main.temp;
//       const w = forecast.wind.speed;
//       const h = forecast.main.humidity;

//       // Send fetched data to array
//       forecastData.push({
//         rawDate: forecastRawDate,
//         date: forecastDate,
//         iconURL: iconURL,
//         t: t,
//         w: w,
//         h: h,
//       });
//     });

//     // Filter forecastData array to increments of 24 hours
//     fiveDayForecast = forecastData.filter(function (value, index, Arr) {
//       return index % 8 == 0;
//     });

//     // NOTE: Above filter method is fragile, only returns every 8th element, equivalent to 24hr intervals. Ideally, filter would target 'date' objects for each element specifically.

//     // Render current weather HTML
//     if (unitSetting === "imperial") {
//       tempUnit = "°F";
//       windUnit = "MPH";
//     } else if (unitSetting === "metric") {
//       tempUnit = "°C";
//       windUnit = "KPH";
//     }

//     document.querySelector(
//       "h2.title"
//     ).innerHTML = `${geoData[0].cityName} (${weatherData[0].date}) <img src="${weatherData[0].iconURL}" aria-label="icon" />`;
//     document.querySelector(
//       "p.subtitle"
//     ).innerHTML = `${stateName}${geoData[0].country}`;
//     document.querySelector(
//       "p.t"
//     ).innerHTML = `Temp: ${weatherData[0].t}${tempUnit}`;
//     document.querySelector(
//       "p.w"
//     ).innerHTML = `Wind: ${weatherData[0].w} ${windUnit}`;
//     document.querySelector("p.h").innerHTML = `Humidity: ${weatherData[0].h}%`;

// // Render 5-Day forecast HTML
// const dayCards = document.querySelectorAll(".dayCard");
// dayCards.forEach((dayCard, index) => {
//   const forecast = fiveDayForecast[index];

//   // Update each dayCard with corresponding forecast data
//   const dateEl = dayCard.querySelector(".date");
//   dateEl.textContent = forecast.date;

//   const iconEl = dayCard.querySelector(".icon");
//   iconEl.src = forecast.iconURL;

//   const tempEl = dayCard.querySelector(".t");
//   tempEl.textContent = `Temp: ${forecast.t}${tempUnit}`;

//   const windEl = dayCard.querySelector(".w");
//   windEl.textContent = `Wind: ${forecast.w} ${windUnit}`;

//   const humidEl = dayCard.querySelector(".h");
//   humidEl.textContent = `Humidity: ${forecast.h}%`;
// });

//     // Unhide forecast HTML if hidden
//     const container = document.getElementById("forecastContainer");
//     let isHidden = container.classList.contains("hider");

//     if (isHidden === true) {
//       hider(container);
//     }

//     // Clear storage arrays for next search
//     geoData = [];
//     weatherData = [];
//     forecastData = [];
//   } catch (error) {
//     newAlert(`No weather data found for "${city}"`);
//     console.error("Error fetching data:", error);
//   }
// }
