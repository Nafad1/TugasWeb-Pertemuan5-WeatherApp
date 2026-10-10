const API_KEY = 'afe3a5e0f5b64808e6af7377238ca78b';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const form = document.querySelector('#searchForm');
const input = document.querySelector('#cityInput');
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const result = document.querySelector('#weatherResult');
const historyContainer = document.querySelector('#historyContainer');
const historyList = document.querySelector('#historyList');
const unitToggle = document.querySelector('#unitToggle');

let currentUnit = 'C';
let lastWeatherData = null;

const showLoading = () => loading.classList.remove('hidden');
const hideLoading = () => loading.classList.add('hidden');

const showError = (msg) => {
  error.textContent = msg;
  error.classList.remove('hidden');
  result.classList.add('hidden');
};

const getWeather = async (city) => {
  try {
    showLoading();
    error.classList.add('hidden');
    result.classList.add('hidden');

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;
    const res = await fetch(url);

    if (res.status === 404) throw new Error(`Kota "${city}" tidak ditemukan.`);
    if (!res.ok) throw new Error('Server error. Coba lagi nanti.');

    const data = await res.json();
    lastWeatherData = data;
    displayWeather(data);
    saveToHistory(city);
  } catch (err) {
    if (err.name === 'TypeError') {
      showError('Network error. Periksa koneksi internet Anda.');
    } else {
      showError(err.message);
    }
  } finally {
    hideLoading();
  }
};

const formatTemp = (celsius) => {
  if (currentUnit === 'C') return `${Math.round(celsius)}°C`;
  return `${Math.round((celsius * 9) / 5 + 32)}°F`;
};

const displayWeather = (data) => {
  document.querySelector('#cityName').textContent = data.name;
  document.querySelector('#temperature').textContent = formatTemp(data.main.temp);
  document.querySelector('#description').textContent = data.weather[0].description;
  document.querySelector('#humidity').textContent = `Kelembaban: ${data.main.humidity}%`;
  document.querySelector('#weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  result.classList.remove('hidden');
};

const toggleUnit = () => {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  unitToggle.textContent = currentUnit === 'C' ? 'Tampilkan °F' : 'Tampilkan °C';
  if (lastWeatherData) {
    document.querySelector('#temperature').textContent = formatTemp(lastWeatherData.main.temp);
  }
};

const saveToHistory = (city) => {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  const normalizedCity = city.toLowerCase().trim();

  if (!history.includes(normalizedCity)) {
    history.unshift(normalizedCity);
    if (history.length > 5) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
  }
  renderHistory();
};

const renderHistory = () => {
  const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  if (history.length === 0) {
    historyContainer.classList.add('hidden');
    return;
  }

  historyContainer.classList.remove('hidden');
  historyList.innerHTML = history
    .map(city => `<li onclick="searchFromHistory('${city}')">${city}</li>`)
    .join('');
};

const searchFromHistory = (city) => {
  input.value = city;
  getWeather(city);
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (city) getWeather(city);
});

unitToggle.addEventListener('click', toggleUnit);

renderHistory();