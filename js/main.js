window.onload = function() {
    var img = document.getElementById('weather-image');
    var mobileImageUrl = 'images/clouds-3994154_1280.jpg';
    if (window.innerWidth <= 1000) { // Change this value based on your mobile viewport width
        img.src = mobileImageUrl;
    }
};

// Function to show loading indicator
function showLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

// Function to hide loading indicator
function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

// Fetch city coordinates and populate select dropdown
fetch('city_coordinates.csv')
    .then(response => response.text())
    .then(data => {
        const lines = data.trim().split('\n').slice(1); // Skip header line
        const select = document.getElementById('citySelect');

        lines.forEach(line => {
            const [latitude, longitude, city, country] = line.split(',');
            const option = document.createElement('option');
            option.textContent = `${city}, ${country}`;
            option.value = `${latitude},${longitude}`;
            select.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching CSV data:', error);
    });

// Function to create a grid item for weather data
function createWeatherGridItem(date, day, month, iconSrc, weatherHeader, maxTemp, minTemp) {
    // Create grid item element
    const gridItem = document.createElement('div');
    gridItem.classList.add('bg-white', 'hover:bg-opacity-75', 'rounded-lg', 'overflow-hidden', 'shadow-md', 'transition', 'duration-300', 'transform', 'hover:-translate-y-1', 'hover:shadow-lg');
    // Populate grid item with weather data
    gridItem.innerHTML = `
        <div class="p-4 flex flex-col items-center">
            <h1 class="text-lg font-semibold"> ${day}</h1>
            <p class="text-sm dark:text-gray-400 mb-3">${month} ${date.toString().slice(6, 8)}</p>
            <img src="${iconSrc}" alt="Weather Icon">
            <h2 class="mt-2 text-xl font-semibold mb-2">${weatherHeader}</h2>
            <div class="flex justify-center items-center mt-2">
                <p class="text-gray-700 mr-2">High:</p>
                <p class="text-gray-700">${maxTemp}°C</p>
            </div>
            <div class="flex justify-center items-center mt-2">
                <p class="text-gray-700 mr-2">Low:</p>
                <p class="text-gray-700">${minTemp}°C</p>
            </div>
        </div>
    `;

    return gridItem;
}

// Function to fetch weather data and populate grid
function populateWeatherGrid(latitude, longitude) {
    showLoadingIndicator(); // Show loading indicator while fetching data

    const grid = document.querySelector('.grid');
    // Clear existing grid items
    grid.innerHTML = '';
    // Make a request to the 7Timer API
    fetch(`https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civillight&output=json`)
        .then(response => response.json())
        .then(data => {
            const dataseries = data.dataseries;
            const grid = document.querySelector('.grid');

            // Clear existing grid items
            grid.innerHTML = '';

            // Create grid items for each day's weather
            dataseries.forEach(series => {

                const date = series.date;
                const dateStr = date.toString();
                const datef = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`)
                const month = datef.toLocaleDateString('en-US', { month: 'short' });
                const day = datef.toLocaleDateString('en-US', { weekday: 'long' });
                const iconSrc = `images/${series.weather}.png`; // Assuming images are stored locally
                const weatherHeader = series.weather.charAt(0).toUpperCase() + series.weather.slice(1);
                const maxTemp = series.temp2m.max;
                const minTemp = series.temp2m.min;

                const gridItem = createWeatherGridItem(date, day, month, iconSrc, weatherHeader, maxTemp, minTemp);
                grid.appendChild(gridItem);
            });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        })
        .finally(() => {
            hideLoadingIndicator(); // Hide loading indicator once data fetching is complete
        });
}

// Event listener for city selection
const citySelect = document.getElementById('citySelect');
citySelect.addEventListener('change', function() {
    const selectedValue = this.value;
    const [latitude, longitude] = selectedValue.split(',');
    populateWeatherGrid(latitude, longitude);
});
