const apiCountryURL = "https://flagsapi.com/";
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;
const apiUnsplash = `https://source.unsplash.com/${screenWidth}x${screenHeight}/?`;

// Função para solicitar permissão de localização
async function getLocationPermission() {
    return new Promise((resolve) => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
                resolve(permissionStatus.state === 'granted' || permissionStatus.state === 'prompt');
            });
        } else {
            resolve(true); 
        }
    });
}

// Função para obter dados do clima por coordenadas
async function getWeatherDataByCoordinates(latitude, longitude) {
    const apiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;
    await fetchWeatherData(apiURL, latitude, longitude); 
}

// Função para obter dados do clima por nome da local
async function getWeatherDataByCityName(cityName) {
    const apiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cityName)}&appid=${apiKey}&units=metric&lang=pt_br`;
    await fetchWeatherData(apiURL);
}

// Função para buscar dados do clima na API
async function fetchWeatherData(apiURL) {
    try {
        document.getElementById('loading').style.display = 'block';
        const response = await fetch(apiURL);
        const json = await response.json();
        const city = await getCityByCoordinates(json.coord.lat, json.coord.lon)
        const state = await getStateByCoordinates(json.coord.lat, json.coord.lon); 
        const suburb = await getSuburbByCoordinates(json.coord.lat, json.coord.lon);
        const rua = await getRuaByCoordinates(json.coord.lat, json.coord.lon)
        json.city = city
        json.suburb = suburb; 
        json.rua = rua;
        if (!state) {
            json.state = json.city;
        } else {
            json.state = state;
        }
        if (json.cod === 200) {
            showInfo({
                city: json.city,
                country: json.sys.country,
                temp: json.main.temp,
                tempMax: json.main.temp_max,
                tempMin: json.main.temp_min,
                thermalSensation: json.main.feels_like,
                description: json.weather[0].description,
                tempIcon: json.weather[0].icon,
                windSpeed: json.wind.speed,
                humidity: json.main.humidity,
                longitude: json.coord.lon,
                latitude: json.coord.lat,
                windDirection: json.wind.deg,
                state: json.state,
                suburb: json.suburb,
                rua: json.rua
            });
            console.log(json)
        } else {
            showAlert(`Não foi possível localizar. Verifique se o nome da local está correto.
            <img src="src/img/thinking_emoji.png"/>`);
        }
    } catch (error) {
        showAlert(`Ocorreu um erro ao buscar os dados do clima, digite um local válido.
        <img src="src/img/thinking_emoji.png"/>`);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
    console.log(showInfo())
}

// Função para obter o estado por coordenadas
async function getStateByCoordinates(latitude, longitude) {
    const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    try {
        const response = await fetch(nominatimURL);
        const data = await response.json();
        return data.address.state || "não encontrado"
    } catch (error) {
        throw new Error("Erro ao obter o estado.");
    }
}

// Função para obter o subúrbio por coordenadas
async function getSuburbByCoordinates(latitude, longitude) {
    const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(nominatimURL);
        const data = await response.json();
        return data.address.suburb || "não encontrado"
    } catch (error) {
        throw new Error("Erro ao obter o subúrbio.");
    }
}

// Função para obter a cidade por coordenadas

async function getCityByCoordinates(latitude, longitude) {
    const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(nominatimURL);
        const data = await response.json();
        return data.address.city || "não encontrada";
    } catch (error) {
        throw new Error("Erro ao obter o nome da cidade.");
    }
}


// Função para obter a rua por coordenadas

async function getRuaByCoordinates(latitude, longitude) {
    const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(nominatimURL);
        const data = await response.json();
        return data.address.road || "não encontrada";
    } catch (error) {
        throw new Error("Erro ao obter o nome da rua.");
    }
}

// Função para obter a localização do usuário
function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
}

// Função para exibir alerta
function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg
}

// Função para exibir informações do clima
async function showInfo(json) {
    showAlert('')
    document.querySelector('#weather').classList.add('show')
    document.querySelector('#local').innerHTML = `${json.city}`
    document.querySelector('#country').innerHTML = `${json.country}`
    document.querySelector('#state').innerHTML = `${json.state}`
    document.querySelector('#suburb').innerHTML = `${json.suburb}`
    document.querySelector('#rua').innerHTML = `${json.rua}`



    const countryImg = document.querySelector("#country");
    if (countryImg) {
        const countryFlagUrl = `${apiCountryURL}${json.country}/flat/64.png`;
        countryImg.setAttribute('src', countryFlagUrl);
    } else {
        console.error("Elemento #country não encontrado no documento.");
    }

    document.body.style.backgroundImage = `url("${apiUnsplash + json.city}")`;
    document.querySelector('#temp_value').innerHTML = `${json.temp.toString().replace('.', ',')} <sup> °C </sup>`
    document.querySelector('#temp_description').innerHTML = `${json.description}`
    document.querySelector('#temp_img').setAttribute('src', `http://openweathermap.org/img/wn/${json.tempIcon}@2x.png`)
    document.querySelector('#temp_max').innerHTML = `${json.tempMax.toFixed(1).toString().replace('.', ',')} <sup> °C </sup>`
    document.querySelector('#temp_min').innerHTML = `${json.tempMin.toFixed(1).toString().replace('.', ',')} <sup> °C </sup>`
    document.querySelector('#humidity').innerHTML = `${json.humidity}%`
    document.querySelector('#wind').innerHTML = `${json.windSpeed}km/h`
    document.querySelector('#longitude').innerHTML = `${json.longitude}°`
    document.querySelector('#latitude').innerHTML = `${json.latitude}°`
    const windDirection = getWindDirection(json.windDirection);
    document.querySelector('#wind_direction').innerHTML = windDirection;
    document.querySelector('#thermal_sensation').innerHTML = `${json.thermalSensation}`

    updateTempBackground(json.temp);
}

// Função para analisar o nome da local e o estado
function parseCityAndState(cityNameAndState) {
    const [cityName, state] = cityNameAndState.trim().split(/\s+/);
    return [cityName, state.toUpperCase()];
}

// Função para obter a direção do vento
function getWindDirection(degrees) {
    const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Função para atualizar o estilo do elemento #temp com base na temperatura
function updateTempBackground(temp) {
    const tempElement = document.querySelector('#temp');

    // Define diferentes cores de fundo com base na faixa de temperatura
    if (temp <= 0) {
        tempElement.style.background = 'linear-gradient(180deg, #021a5c 0%, #1e0d48 100%)';
    } else if (temp <= 10) {
        tempElement.style.background = 'linear-gradient(180deg, #022481 0%, #220177 100%)';
    } else if (temp <= 20) {
        tempElement.style.background = 'linear-gradient(180deg, #0d3dc0 0%, #1a43be 100%)';
    } else if (temp <= 30) {
        tempElement.style.background = 'linear-gradient(180deg, #de9802 0%, #f6cc24 100%)';
    } else {
        tempElement.style.background = 'linear-gradient(180deg, #de5602 0%, #f6cc24 100%)';
    }
}

// Evento que é disparado quando o conteúdo do DOM é completamente carregado
document.addEventListener('DOMContentLoaded', async () => {
    // Adiciona um ouvinte de evento para o botão 'use_location'
    const useLocationButton = document.getElementById('use_location');
    useLocationButton.addEventListener('click', async () => {
        const permissionGranted = await getLocationPermission();
        if (permissionGranted) {
            try {
                const position = await getLocation();
                const { latitude, longitude } = position.coords;
                await getWeatherDataByCoordinates(latitude, longitude);
            } catch (error) {
                showAlert(`Você não permitiu o acesso a sua localização, digite o nome do local ou permita.
                <img src="src/img/sad_emoji.webp"/>`
            );
            }
        } else {
            showAlert(`Acesso à localização negado. Por favor, insira o nome da local.
            <img src="src/img/thinking_emoji.png"/>
            `);
        }
    });

    // Adiciona um ouvinte de evento para o botão de pesquisa
    const searchButton = document.querySelector('#search button[type="submit"]');
    searchButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const cityName = document.querySelector('#city_name').value;
        if (cityName) {
            await getWeatherDataByCityName(cityName);
        } else {
            showAlert(`Por favor, insira o nome do local.
            <img src="src/img/happy_emoji.png"/>
            `);
        }
    });
});
