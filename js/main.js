"use strict";
const weatherInfoDiv = document.getElementById("weatherInfo");
const fetchDataButton = document.getElementById("fetchData");
const cityInput = document.getElementById("cityInput");

fetchDataButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") {
    return;
  }
  const apiKey = "c233524953b26f5885f25e5f96816ad9";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      weatherInfoDiv.innerHTML = `
                        <h2>${data.name}, ${data.sys.country}</h2>
                        <p>Temperature: ${data.main.temp}°C</p>
                        <p>Weather: ${data.weather[0].description}</p>
                    `;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      weatherInfoDiv.innerHTML = "<p>Error fetching data. Please try again.</p>";
    });
});
