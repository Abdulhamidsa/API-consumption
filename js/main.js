"use strict";
import { mapboxApiKey, eventsApiKey, weatherApiKey } from "./api-keys.js";

window.addEventListener("DOMContentLoaded", init);

const weatherInfoDiv = document.querySelector("#weather_info");
const weatherTemplate = document.querySelector("#weather_template");
const fetchDataButton = document.querySelector("#fetch_data");
const cityNameInput = document.querySelector("#city_input");
function init() {
  fetchDataButton.addEventListener("click", (e) => {
    const cityName = document.querySelector("#city_input").value;
    e.preventDefault();
    // BLUR TO CLOSE KEYBOARD ON PHONES WHEN CLICKING ENTER
    cityNameInput.blur();
    // CLEAR THE PREVIOUS DATA
    weatherInfoDiv.innerHTML = "";
    // mapContainer.innerHTML = "";
    // PASS THE CITY NAME TO THE FETCH DATA
    fetchData(cityName);
  });

  console.log("SCRIPT IS LOADED");
}

function fetchData(cityName) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApiKey}`;
  const eventUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${eventsApiKey}&city=${cityName}`;
  Promise.all([fetch(weatherUrl).then((response) => response.json()), fetch(eventUrl).then((response) => response.json())])
    .then(([weatherData, eventData]) => {
      // CHECK IF THE CITY IS NOT IN THE DATABASE GIVE FEEDBACK
      if (weatherData.cod !== 200) {
        weatherInfoDiv.innerHTML += `<p class="error"> <strong>${cityName}</strong>  is not a valid city name, please try again.</p>`;
        //REMEMBER THAT RETURN WORK AS EXIT() IN PHP
        return;
      }
      displayData(weatherData, eventData);
      console.log(weatherData);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function scrollEvent() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      let scrollDistance = document.documentElement.clientHeight;
      if (btn.className.includes("scroll_up")) {
        scrollDistance *= -1;
        console.log("Scrolling up");
      }
      window.scrollBy(0, scrollDistance);
    });
  });
}
function displayData(weatherData, eventData) {
  console.log();

  const clone = document.importNode(weatherTemplate.content, true);
  clone.querySelector("h2").textContent = `${weatherData.name}, ${weatherData.sys.country}`;
  clone.querySelector(".temperature").textContent = (weatherData.main.temp - 273.15).toFixed(0) + "°C";
  clone.querySelector(".temperature_feeling").textContent = `Feels like: ${(weatherData.main.feels_like - 273.15).toFixed(0)}°C`;
  clone.querySelector(".temperature_humidity").textContent = `Humidity: ${weatherData.main.humidity}%`;
  clone.querySelector(".wind_speed").textContent = `Wind speed: ${weatherData.wind.speed} m/s`;
  clone.querySelector(".weather_description").textContent = weatherData.weather[0].main;
  const mapContainer = clone.querySelector(".map_container");
  clone.querySelector(".local_date").textContent = new Date(Date.now() + weatherData.timezone * 1000).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }).replace(/,/g, " ");
  const mapImg = clone.querySelector(".map_container img");
  mapImg.src = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${weatherData.coord.lon},${weatherData.coord.lat},10.2,0,0/600x300?access_token=${mapboxApiKey}`;
  const eventContainer = clone.querySelector(".event_container");
  /////// CHECK IF THERE IS ANY EVENTS OR NAH
  if (typeof eventData._embedded === "undefined") {
    const divElement = document.createElement("div");
    divElement.className = "scroll_box scroll_none";
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = `No events happening at ${weatherData.name} at the momment`;
    divElement.appendChild(paragraphElement);
    weatherInfoDiv.appendChild(divElement);
  } else {
    const { name } = weatherData;
    const div_down_btn = document.createElement("div");
    div_down_btn.className = "scroll_box btn scroll_down";
    div_down_btn.innerHTML = `<p>See what's happening at ${name}</p><span class="material-symbols-outlined">expand_more</span>`;
    ////
    const div_up_btn = document.createElement("div");
    div_up_btn.className = "scroll_box btn scroll_up";
    div_up_btn.innerHTML = `<span class="material-symbols-outlined">expand_less</span><p>See weather</p>`;
    eventContainer.appendChild(div_up_btn);
    weatherInfoDiv.appendChild(div_down_btn);
    ///// HANDLE THE STYLE OF THE STATUS OF THE EVENT
    eventData._embedded.events.forEach((event) => {
      const soldOut = event.dates.status.code === "offsale" ? "sold_out" : event.dates.status.code === "onsale" ? "available" : event.dates.status.code === "rescheduled" ? "rescheduled" : "";
      const eventHtml = `
      <div>
        <a href="${event.url}">
          <div class="image_container">
            <img src="${event.images[8].url}">
          </div>
        </a>
          <div class="details_container">
            <h3>${event.name} </h3>
            <p class=${soldOut}></p> 
            <div class="date">
              <span class="material-symbols-outlined">calendar_month</span>
              <p>Date: ${event.dates.start.localDate}</p>
            </div>
              <div class="location">
                <span class="material-symbols-outlined">location_on</span>
                <p>${event._embedded.venues[0].name ? event._embedded.venues[0].name : event._embedded.venues[0].address.line1}</p>
            </div>
          </div>
      </div>
      `;
      eventContainer.innerHTML += eventHtml;
    });
    //// FOR LOOP TO CREATE LOCATION ICON RANDOMLY ON THE MAP
    for (let i = 0; i < eventData._embedded.events.length; i++) {
      const image = document.createElement("img");
      image.src = "media/location_icon.png";
      const left = Math.random() * 70;
      const top = Math.random() * 70;
      image.style.position = "absolute";
      image.style.width = "3%";
      image.style.height = "auto";
      image.style.left = `${left}%`;
      image.style.top = `${top}%`;
      mapContainer.appendChild(image);
    }
  }
  weatherInfoDiv.appendChild(clone);
  scrollEvent();
}
