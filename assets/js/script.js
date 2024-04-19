// TODO: Searchbar (search for city, change forecast to that city, & add city to search history)
// TODO: Search History (update displayed weather data on click)

// Form data placeholder values
let city = "Oakland";
let country = "US";
let limit = 1;

const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";
const geoQuery = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=${limit}&appid=${APIKey}`;

// Global API data storage
let geoData = [];
let weatherData = [];
let forecastData = [];

// Function for calling APIs
async function fetchData() {
  try {
    // API call for geolocation data
    const geoResponse = await fetch(geoQuery);
    const geoJson = await geoResponse.json();
    const cityName = geoJson[0].name;
    const country = geoJson[0].country;
    const latitude = geoJson[0].lat;
    const longitude = geoJson[0].lon;

    // Send fetched data to array
    geoData.push({
      cityName: cityName,
      country: country,
      latitude: latitude,
      longitude: longitude,
    });

    // Generate API queries w/ geoData
    const weatherQuery = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${APIKey}`;
    const forecastQuery = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${APIKey}`;

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
    document.querySelector(
      "h2.title"
    ).innerHTML = `${geoData[0].cityName} (${weatherData[0].date}) <img src="${weatherData[0].iconURL}" aria-label="icon" />`;
    document.querySelector("p.t").innerHTML = `Temp: ${weatherData[0].t}°F`;
    document.querySelector("p.w").innerHTML = `Wind: ${weatherData[0].w} MPH`;
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
      tempEl.textContent = `Temp: ${forecast.t}°F`;

      const windEl = dayCard.querySelector(".w");
      windEl.textContent = `Wind: ${forecast.w} MPH`;

      const humidEl = dayCard.querySelector(".h");
      humidEl.textContent = `Humidity: ${forecast.h}%`;
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
