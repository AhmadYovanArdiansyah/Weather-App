class GeolocationService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.geoApiBaseUrl = 'https://api.openweathermap.org/geo/1.0';
    }

    async fetchData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async getLocationByCoordinates(latitude, longitude) {
        const url = `${this.geoApiBaseUrl}/reverse?lat=${latitude}&lon=${longitude}&limit=${10}&appid=${this.apiKey}`;
        const geoData = await this.fetchData(url);
        if (geoData && geoData[0]) {
            return geoData[0];
        } else {
            throw new Error('Tidak dapat memperoleh informasi lokasi');
        }
    }

    async getCoordinatesByLocation(location) {
        const url = `${this.geoApiBaseUrl}/direct?q=${location}&limit=5&appid=${this.apiKey}`;
        const geoData = await this.fetchData(url);
        if (geoData && geoData[0]) {
            return geoData[0];
        } else {
            throw new Error('Tidak dapat memperoleh informasi lokasi');
        }
    }
}

class WeatherService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.weatherApiBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    }

    async fetchData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async getWeatherData(latitude, longitude) {
        const url = `${this.weatherApiBaseUrl}?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
        return this.fetchData(url);
    }
}

const apiKey = '81f216bd12a152353a353d4d6d08a428';
const geoService = new GeolocationService(apiKey);
const weatherService = new WeatherService(apiKey);

const getElement = (selector) => document.querySelector(selector);

const locationInput = getElement('#locationInput');
const searchButton = getElement('#searchButton');
const currentLocationButton = getElement('#currentLocationButton');
const locationName = getElement('#locationName');
const weatherIconElement = getElement('.weather-icon');
const descriptionElement = getElement('#description');
const temperatureElement = getElement('#temperature');
const humidityElement = getElement('#humidity');
const locationElement = getElement('#location');

function displayWeatherInfo(weatherData) {
    const { weather, main } = weatherData;
    weatherIconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" />`;
    descriptionElement.textContent = `It's ${weather[0].description}`;
    temperatureElement.textContent = `${Math.round(main.temp)}°`;
    humidityElement.textContent = `${main.humidity}%`;
}

async function searchAndDisplayWeather(location) {
    try {
        const geodata = await geoService.getCoordinatesByLocation(location);
        console.log(geodata);
        const { lat, lon, name } = geodata;
        locationName.textContent = `${name} Now`;

        const weatherData = await weatherService.getWeatherData(lat, lon);
        displayWeatherInfo(weatherData);
    } catch (error) {
        locationName.textContent = error.message;
    }
}

async function getWeatherDataFromCurrentLocation() {
    if ("geolocation" in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude } = position.coords;

            try {
                const geodata = await geoService.getLocationByCoordinates(latitude, longitude);
                console.log(geodata);
                const { lat, lon, name } = geodata;
                locationName.textContent = `${name} Now`;

                const weatherData = await weatherService.getWeatherData(lat, lon);
                displayWeatherInfo(weatherData);
            } catch (error) {
                locationName.textContent = error.message;
            }
        } catch (error) {
            locationName.textContent = "Error getting location: " + error.message;
        }
    } else {
        locationName.textContent = "Geolocation is not available in this browser.";
    }
}


searchButton.addEventListener('click', () => searchAndDisplayWeather(locationInput.value));

locationInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        searchAndDisplayWeather(locationInput.value);
    }
});

getWeatherDataFromCurrentLocation();
