"use strict";
const weatherInfoDiv = document.getElementById("weatherInfo");
const mapImage = document.createElement("img");
const weatherTemplate = document.getElementById("weatherTemplate");
const fetchDataButton = document.getElementById("fetchData");
const cityNameInput = document.querySelector("#cityInput");
const eventContainer = document.querySelector(".event_container");

const mapboxApiKey = "pk.eyJ1IjoiYWJvb29kc2EiLCJhIjoiY2xtYXcwcDZtMHp3ODNjcXE0YWY4dmNrMyJ9.0sDQp8tgynWP70CQOLZkrw";
function fetchData(cityName) {
  if (!cityName) {
    console.log("ass");
  }
  const weatherApiKey = "c233524953b26f5885f25e5f96816ad9";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApiKey}`;
  const eventsApiKey = "dGZ6cx8vkDKVJptA5d5stXMzGP7GeObZ";
  const eventUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${eventsApiKey}&city=${cityName}`;

  Promise.all([fetch(weatherUrl).then((response) => response.json()), fetch(eventUrl).then((response) => response.json())])
    .then(([weatherData, eventData]) => {
      displayData(weatherData, eventData);
      console.log(weatherData);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      weatherInfoDiv.innerHTML += `<p>Error fetching data for ${cityName}. Please try again.</p>`;
    });
}
function displayData(weatherData, eventData) {
  const clone = document.importNode(weatherTemplate.content, true);
  clone.querySelector("h2").textContent = `${weatherData.name}, ${weatherData.sys.country}`;
  clone.querySelector(".temperature").textContent = `Temperature: ${(weatherData.main.temp - 273.15).toFixed(0)}°C`;
  clone.querySelector(".temperature_feeling").textContent = `Feels like: ${(weatherData.main.feels_like - 273.15).toFixed(0)}°C`;
  clone.querySelector(".temperature_humidity").textContent = `Humidity: ${weatherData.main.humidity}%`;

  clone.querySelector(".weather-description").textContent = `Weather: ${weatherData.weather[0].description}`;
  clone.querySelector(".time_zone").textContent = new Date(Date.now() + weatherData.timezone * 1000).toLocaleTimeString();
  clone.querySelector("img").src = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${weatherData.coord.lon},${weatherData.coord.lat},10.2,0,0/600x300?access_token=${mapboxApiKey}`;

  const eventContainer = clone.querySelector(".event_container");

  if (typeof eventData._embedded === "undefined") {
    eventContainer.innerHTML = "<p>No events found</p>";
  } else {
    eventData._embedded.events.forEach((event) => {
      const soldOut = event.dates.status.code === "offsale" ? "sold_out" : event.dates.status.code === "onsale" ? "available" : event.dates.status.code === "rescheduled" ? "rescheduled" : "";

      console.log(event);
      const eventHtml = `
      <div>
            <div class="image_container">
                <img
                    src="${event.images[8].url}">
            </div>
            <div class="details_container">
                <h3>${event.name} </h3>
                <h4>Date: ${event.dates.start.localDate}</h4>
                <p class=${soldOut}></p>
                <a href="${event.url}">link</a>
                <p>${event._embedded.venues[0].name ? event._embedded.venues[0].name : event._embedded.venues[0].address.line1}</p>
            </div>
        </div>
      `;
      eventContainer.innerHTML += eventHtml;
    });
  }
  weatherInfoDiv.appendChild(clone);
}

fetchDataButton.addEventListener("click", (e) => {
  const cityName = document.querySelector("#cityInput").value;
  e.preventDefault();
  cityNameInput.blur();
  weatherInfoDiv.innerHTML = "";
  document.getElementById("mapContainer").innerHTML = "";

  fetchData(cityName);
});
