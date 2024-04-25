// TODO: Bugfix testing, fix city name capitalization in search history or localStorage

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
  // console.log(`Toggled hider(); on ${element.id}`);
}

// Handle form data
const form = document.getElementById("cityForm");
let searches = JSON.parse(localStorage.getItem("city-searches")) || [];
const history = document.getElementsByClassName("historyBtn") || [];
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const toggleImp = document.getElementById("toggleImperial");
const toggleMet = document.getElementById("toggleImperial");
let unitSetting = "imperial";

console.log("Search history:", searches);

// Update history from localStorage
updateHistory(searches);

// Set up button handlers
function searchButtonHandler() {
  const newSearch = document.getElementById("citySearch").value;
  unitSetting = document.getElementById("units").value;

  if (!newSearch) {
    newAlert("City name is required for new forecast.");
    return;
  }

  if (searches.includes(newSearch)) {
    console.log(`${newSearch} is a duplicate, not added to search history.`);
  } else {
    searches.push(newSearch);
    localStorage.setItem("city-searches", JSON.stringify(searches));
    console.log(`${newSearch} added to search history`);
  }

  city = newSearch;
  console.log("New searches array:", searches);

  fetchData(newSearch);
  updateHistory(searches);

  form.reset();
  return city, unitSetting;
}

function historyButtonHandler(historySearch) {
  console.log(`${historySearch} history button clicked`);
  unitSetting = document.getElementById("units").value;

  city = historySearch;
  fetchData(historySearch);
  form.reset();
  return city, unitSetting;
}

function clearButtonHandler() {
  console.log("Clear history button clicked");
  localStorage.clear();
  searches = [];
  updateHistory(searches);
  form.reset();
}

// Function to generate history buttons
function updateHistory(searchHistory) {
  const container = document.getElementById("historyContainer");
  // const dividers = document.querySelectorAll("hr");

  container.innerHTML = "";
  let buttons = [];
  buttons = Array.from(searchHistory);

  if (buttons.length === 0) {
    // hider(dividers[0]);
    // hider(dividers[1]);
    // hider(clearBtn);
    clearBtn.classList.add("hider");
  } else {
    clearBtn.classList.remove("hider");
  }

  buttons.forEach((element) => {
    const li = document.createElement("li");
    const button = document.createElement("button");

    button.textContent = element;
    button.classList.add("historyBtn");
    button.type = "button";
    li.appendChild(button);
    container.appendChild(li);
  });
}

// Add button listeners
searchBtn.addEventListener("click", function (event) {
  event.preventDefault();
  searchButtonHandler();
});

clearBtn.addEventListener("click", function (event) {
  event.preventDefault();
  clearButtonHandler();
});

Array.from(history).forEach(function (button) {
  let buttonName = button.textContent;

  button.addEventListener("click", function (event) {
    event.preventDefault();
    historyButtonHandler(buttonName);
  });
});

// Global API data storage
const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";

let geoData = [];
let weatherData = [];
let forecastData = [];

let tempUnit;
let windUnit;

// Function for calling APIs
async function fetchData(city) {
  try {
    // API call for geolocation data
    const geoQuery = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
    const geoResponse = await fetch(geoQuery);
    const geoJson = await geoResponse.json();
    const cityName = geoJson[0].name;
    const country = geoJson[0].country;
    const state = geoJson[0].state;
    const latitude = geoJson[0].lat;
    const longitude = geoJson[0].lon;

    // Send fetched data to array
    let stateName;
    if (state != undefined) {
      geoData.push({
        cityName: cityName,
        country: country,
        state: state,
        latitude: latitude,
        longitude: longitude,
      });
      stateName = `${geoData[0].state}, `;
    } else {
      geoData.push({
        cityName: cityName,
        country: country,
        latitude: latitude,
        longitude: longitude,
      });
      stateName = "";
    }

    // Generate API queries w/ geoData
    const weatherQuery = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;
    const forecastQuery = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unitSetting}&appid=${APIKey}`;

    // API call for current weather data
    const weatherResponse = await fetch(weatherQuery);
    const weatherJson = await weatherResponse.json();

    // Convert Unix timestamp to JavaScript Date
    const currentRawDate = new Date(weatherJson.dt * 1000);
    const currentDate = `${(currentRawDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${currentRawDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${currentRawDate.getFullYear()}`;

    const icon = weatherJson.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const t = weatherJson.main.temp;
    const w = weatherJson.wind.speed;
    const h = weatherJson.main.humidity;

    // Send fetched data to array
    weatherData.push({
      rawDate: currentRawDate,
      date: currentDate,
      iconURL: iconURL,
      t: t,
      w: w,
      h: h,
    });

    // API call for forecasted weather data
    const forecastResponse = await fetch(forecastQuery);
    const forecastJson = await forecastResponse.json();
    const forecasts = forecastJson.list;

    forecasts.forEach((forecast) => {
      // Convert Unix timestamp to JavaScript Date
      const forecastRawDate = new Date(forecast.dt * 1000);
      const forecastDate = `${(forecastRawDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${forecastRawDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${forecastRawDate.getFullYear()}`;

      const icon = forecast.weather[0].icon;
      const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      const t = forecast.main.temp;
      const w = forecast.wind.speed;
      const h = forecast.main.humidity;

      // Send fetched data to array
      forecastData.push({
        rawDate: forecastRawDate,
        date: forecastDate,
        iconURL: iconURL,
        t: t,
        w: w,
        h: h,
      });
    });

    // Filter forecastData array to increments of 24 hours
    fiveDayForecast = forecastData.filter(function (value, index, Arr) {
      return index % 8 == 0;
    });

    // NOTE: Above filter method is fragile, only returns every 8th element, equivalent to 24hr intervals. Ideally, filter would target 'date' objects for each element specifically.

    // Render current weather HTML
    if (unitSetting === "imperial") {
      tempUnit = "°F";
      windUnit = "MPH";
    } else if (unitSetting === "metric") {
      tempUnit = "°C";
      windUnit = "KPH";
    }

    document.querySelector(
      "h2.title"
    ).innerHTML = `${geoData[0].cityName} (${weatherData[0].date}) <img src="${weatherData[0].iconURL}" aria-label="icon" />`;
    document.querySelector(
      "p.subtitle"
    ).innerHTML = `${stateName}${geoData[0].country}`;
    document.querySelector(
      "p.t"
    ).innerHTML = `Temp: ${weatherData[0].t}${tempUnit}`;
    document.querySelector(
      "p.w"
    ).innerHTML = `Wind: ${weatherData[0].w} ${windUnit}`;
    document.querySelector("p.h").innerHTML = `Humidity: ${weatherData[0].h}%`;

    // Render 5-Day forecast HTML
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

    // Unhide forecast HTML if hidden
    const container = document.getElementById("forecastContainer");
    let isHidden = container.classList.contains("hider");

    if (isHidden === true) {
      hider(container);
    }

    // Clear storage arrays for next search
    geoData = [];
    weatherData = [];
    forecastData = [];
  } catch (error) {
    newAlert(`No weather data found for "${city}"`);
    console.error("Error fetching data:", error);
  }
}
