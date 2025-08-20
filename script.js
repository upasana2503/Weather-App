document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location-input');
    const searchButton = document.getElementById('search-button');
    const clearHistoryButton = document.getElementById('clear-history-button');
    const historyList = document.getElementById('history-list');
    const viewSelect = document.getElementById('viewSelect');

    // Weather display sections
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const currentWeatherSection = document.getElementById('current-weather');
    const hourlyForecastSection = document.getElementById('hourly-forecast');
    const sevenDayForecastSection = document.getElementById('7day-forecast');
    const fifteenDayForecastSection = document.getElementById('15day-forecast');
    const monthlyOverviewSection = document.getElementById('monthly-overview');

    // Data display elements
    const currentLocationSpan = document.getElementById('current-location');
    const currentTempSpan = document.getElementById('current-temp');
    const currentConditionsSpan = document.getElementById('current-conditions');
    const currentHumiditySpan = document.getElementById('current-humidity');
    const currentWindSpan = document.getElementById('current-wind');
    const hourlyContainer = document.getElementById('hourly-container');
    const sevenDayContainer = document.getElementById('7day-container');
    const fifteenDayContainer = document.getElementById('15day-container');
    const monthlyStatsContainer = document.getElementById('monthly-stats-container');
    const monthlyDailyContainer = document.getElementById('monthly-daily-container');

    const API_KEY = 'UVN5HQB6ZXCRANVWPUN5DESS8'; // Your VisualCrossing API Key
    const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

    let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

    const viewOptions = [
        { name: "Current Weather", value: "current" },
        { name: "Hourly Forecast", value: "hourly" },
        { name: "7-Day Forecast", value: "7day" },
        { name: "15-Day Forecast", value: "15day" },
        { name: "Monthly Overview", value: "monthly" }
    ];

    // Function to populate the select dropdown
    function populateViewSelect() {
        viewOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.name;
            viewSelect.appendChild(opt);
        });
    }

    // Function to show a specific weather view section
    function showWeatherView(viewId) {
        document.querySelectorAll('.weather-view').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(viewId)?.classList.add('active');
    }

    // Function to fetch weather data
    async function fetchWeather(city, viewMode) {
        if (!city) {
            showWeatherView('empty-state');
            return;
        }

        showWeatherView('loading-state');
        searchButton.disabled = true;
        locationInput.disabled = true;
        viewSelect.disabled = true;

        let url;
        let includeParam = '';
        let startDate = '';
        let endDate = '';

        switch (viewMode) {
            case 'current':
                includeParam = 'current';
                break;
            case 'hourly':
                includeParam = 'hours';
                break;
            case '7day':
            case '15day':
                includeParam = 'days';
                break;
            case 'monthly':
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1; // getMonth() is 0-indexed
                startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
                endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`; // Last day of the month
                includeParam = 'days'; // We need daily data to aggregate monthly
                break;
        }

        if (viewMode === 'monthly') {
            url = `${BASE_URL}${city}/${startDate}/${endDate}?unitGroup=metric&include=${includeParam}&key=${API_KEY}&contentType=json`;
        } else {
            url = `${BASE_URL}${city}?unitGroup=metric&include=${includeParam}&key=${API_KEY}&contentType=json`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            renderData(data, viewMode);
            addToHistory(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            showWeatherView('error-state');
        } finally {
            searchButton.disabled = false;
            locationInput.disabled = false;
            viewSelect.disabled = false;
        }
    }

    // Function to render data based on viewType
    function renderData(data, viewMode) {
        // Clear all containers first
        currentLocationSpan.textContent = '';
        currentTempSpan.textContent = '';
        currentConditionsSpan.textContent = '';
        currentHumiditySpan.textContent = '';
        currentWindSpan.textContent = '';
        hourlyContainer.innerHTML = '';
        sevenDayContainer.innerHTML = '';
        fifteenDayContainer.innerHTML = '';
        monthlyStatsContainer.innerHTML = '';
        monthlyDailyContainer.innerHTML = '';

        showWeatherView(viewMode + '-forecast'); // Default to showing the specific forecast section

        switch (viewMode) {
            case 'current':
                const current = data.currentConditions;
                currentLocationSpan.textContent = data.resolvedAddress;
                currentTempSpan.textContent = `${current.temp}°C`;
                currentConditionsSpan.textContent = current.conditions;
                currentHumiditySpan.textContent = `${current.humidity}%`;
                currentWindSpan.textContent = `${current.windspeed} km/h`;
                showWeatherView('current-weather');
                break;
            case 'hourly':
                const todayHourly = data.days[0];
                if (todayHourly && todayHourly.hours) {
                    todayHourly.hours.slice(0, 24).forEach(hour => { // Display next 24 hours
                        const hourDiv = document.createElement('div');
                        hourDiv.classList.add('forecast-item');
                        const time = new Date(hour.datetimeEpoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        hourDiv.innerHTML = `
                            <h3>${time}</h3>
                            <p>${hour.temp}°C</p>
                            <p>${hour.conditions}</p>
                        `;
                        hourlyContainer.appendChild(hourDiv);
                    });
                }
                break;
            case '7day':
                data.days.slice(0, 7).forEach(day => {
                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('forecast-item');
                    const date = new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    dayDiv.innerHTML = `
                        <h3>${date}</h3>
                        <p>High: ${day.tempmax}°C</p>
                        <p>Low: ${day.tempmin}°C</p>
                        <p>${day.conditions}</p>
                    `;
                    sevenDayContainer.appendChild(dayDiv);
                });
                break;
            case '15day':
                data.days.forEach(day => { // Iterate over all available days (up to 15)
                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('forecast-item');
                    const date = new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    dayDiv.innerHTML = `
                        <h3>${date}</h3>
                        <p>High: ${day.tempmax}°C</p>
                        <p>Low: ${day.tempmin}°C</p>
                        <p>${day.conditions}</p>
                    `;
                    fifteenDayContainer.appendChild(dayDiv);
                });
                break;
            case 'monthly':
                // Aggregate monthly data
                let totalTemp = 0;
                let maxTemp = -Infinity;
                let minTemp = Infinity;
                const conditionsCount = {};

                data.days.forEach(day => {
                    totalTemp += day.temp;
                    if (day.tempmax > maxTemp) maxTemp = day.tempmax;
                    if (day.tempmin < minTemp) minTemp = day.tempmin;
                    conditionsCount[day.conditions] = (conditionsCount[day.conditions] || 0) + 1;

                    // Also render daily data for the month
                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('forecast-item');
                    const date = new Date(day.datetimeEpoch * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    dayDiv.innerHTML = `
                        <h3>${date}</h3>
                        <p>High: ${day.tempmax}°C</p>
                        <p>Low: ${day.tempmin}°C</p>
                        <p>${day.conditions}</p>
                    `;
                    monthlyDailyContainer.appendChild(dayDiv);
                });

                const avgTemp = (totalTemp / data.days.length).toFixed(1);
                const mostCommonCondition = Object.keys(conditionsCount).reduce((a, b) => conditionsCount[a] > conditionsCount[b] ? a : b, '');

                monthlyStatsContainer.innerHTML = `
                    <div class="monthly-stat-card">
                        <h3>Avg Temp</h3>
                        <p>${avgTemp}°C</p>
                    </div>
                    <div class="monthly-stat-card">
                        <h3>Max Temp</h3>
                        <p>${maxTemp}°C</p>
                    </div>
                    <div class="monthly-stat-card">
                        <h3>Min Temp</h3>
                        <p>${minTemp}°C</p>
                    </div>
                    <div class="monthly-stat-card">
                        <h3>Conditions</h3>
                        <p>${mostCommonCondition}</p>
                    </div>
                `;
                showWeatherView('monthly-overview');
                break;
        }
    }

    // Function to add to history
    function addToHistory(location) {
        if (!searchHistory.includes(location)) {
            searchHistory.unshift(location); // Add to the beginning
            searchHistory = searchHistory.slice(0, 5); // Keep only last 5 searches
            localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
            renderHistory();
        }
    }

    // Function to render history
    function renderHistory() {
        historyList.innerHTML = '';
        searchHistory.forEach((location, index) => {
            const li = document.createElement('li');
            li.textContent = location;
            li.addEventListener('click', () => {
                locationInput.value = location;
                fetchWeather(location, viewSelect.value); // Fetch with current selected view
            });

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-history-item');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent li click event
                removeFromHistory(index);
            });
            li.appendChild(removeBtn);
        });
    }

    // Function to remove from history
    function removeFromHistory(index) {
        searchHistory.splice(index, 1);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        renderHistory();
    }

    // Function to clear all history
    function clearAllHistory() {
        searchHistory = [];
        localStorage.removeItem('weatherSearchHistory');
        renderHistory();
        showWeatherView('empty-state'); // Show empty state after clearing history
    }

    // Event Listeners
    searchButton.addEventListener('click', () => {
        const location = locationInput.value.trim();
        fetchWeather(location, viewSelect.value);
    });

    locationInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    viewSelect.addEventListener('change', () => {
        const location = locationInput.value.trim();
        fetchWeather(location, viewSelect.value);
    });

    clearHistoryButton.addEventListener('click', clearAllHistory);

    // Initial setup
    populateViewSelect();
    renderHistory();
    showWeatherView('empty-state'); // Start with empty state
});