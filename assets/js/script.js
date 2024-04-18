// TODO: Searchbar (search for city, change forecast to that city, & add city to search history)
// TODO: Search History (change display back to clicked city in history)
// TODO: Save data to localHost

let city = "Oakland";
const APIKey = "4c08af06a21cfe76c7e6e95c093d982f";
const APIQuery = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${APIKey}`;

// API call for forecasted weather data
let forecastData = [];
fetch(APIQuery)
  .then((response) => response.json())
  .then((data) => {
    // Access the list of forecasts for each day
    const forecasts = data.list;

    // Loop through each forecast to extract data
    forecasts.forEach((forecast) => {
      // Extract date/time of the forecast and convert to Date object
      const forecastDateTime = new Date(forecast.dt * 1000);
      const formattedDate = `${(forecastDateTime.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${forecastDateTime
        .getDate()
        .toString()
        .padStart(2, "0")}/${forecastDateTime.getFullYear()}`;

      // Extract weather details
      const icon = forecast.weather[0].icon;
      const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      const t = forecast.main.temp;
      const w = forecast.wind.speed;
      const h = forecast.main.humidity;

      console.log(
        `Forecast for ${formattedDate}: Icon: ${iconURL}, Temperature: ${t}°F, Windspeed: ${w} MPH, Humidity: ${h}%`
      );

      // Render current weather HTML
      document.querySelector(
        "h2.title"
      ).innerHTML = `${city} (${formattedDate}) <img src="${iconURL}" aria-label="icon" />`;
      document.querySelector("p.t").innerHTML = `Temp: ${t}°F`;
      document.querySelector("p.w").innerHTML = `Wind: ${w} MPH`;
      document.querySelector("p.h").innerHTML = `Humidity: ${h}%`;

      // Populate forecastData array with forecast details for each day
      forecastData.push({
        date: formattedDate,
        iconURL: iconURL,
        t: t,
        w: w,
        h: h,
      });
    });

    // Render 5-Day forecast HTML
    const dayCards = document.querySelectorAll(".dayCard");
    dayCards.forEach((dayCard, index) => {
      const dayForecast = forecastData[index];

      // Update elements in dayCard with corresponding forecast data
      const dateEl = dayCard.querySelector(".date");
      dateEl.textContent = dayForecast.date;

      const iconEl = dayCard.querySelector(".icon");
      iconEl.src = dayForecast.iconURL;

      const tempEl = dayCard.querySelector(".t");
      tempEl.textContent = `Temp: ${dayForecast.t}°F`;

      const windEl = dayCard.querySelector(".w");
      windEl.textContent = `Wind: ${dayForecast.w} MPH`;

      const humidEl = dayCard.querySelector(".h");
      humidEl.textContent = `Humidity: ${dayForecast.h}%`;
    });
  })
  .catch((error) => {
    console.error("Error fetching OpenWeatherMap API data:", error);
  });
