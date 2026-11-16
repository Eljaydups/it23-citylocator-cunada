const map = L.map('map').setView([12.8797, 121.7740], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const markerLayer = L.layerGroup().addTo(map);

const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');
const statusText = document.getElementById('status');

function showMessage(message) {
    statusText.textContent = message;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const city = input.value.trim();

    if (city.length < 2) {
        showMessage('Please type at least 2 letters.');
        return;
    }


    markerLayer.clearLayers();
    showMessage('Searching...');

    const url =
        'https://geocoding-api.open-meteo.com/v1/search?' +
        new URLSearchParams({
            name: city,
            count: '5',        
            language: 'en',
            countryCode: 'PH', 
            format: 'json'
        });


    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }

        const data = await response.json();
        const locations = data.results ?? [];

        if (locations.length === 0) {
            showMessage('No results for "' + city + '". Check the spelling and try again.');
            return;
        }

        const bounds = [];

        locations.forEach((place) => {
            const coords = [place.latitude, place.longitude];
            bounds.push(coords);

         
            const popup = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = place.name;
            popup.appendChild(title);
            popup.appendChild(document.createElement('br'));

            const details = [place.admin1, place.country].filter(Boolean).join(', ');
            popup.appendChild(document.createTextNode(details));

            L.marker(coords).addTo(markerLayer).bindPopup(popup);
        });

        if (bounds.length === 1) {
            map.setView(bounds[0], 11);
        } else {
            map.fitBounds(bounds, { padding: [35, 35] });
        }

        showMessage('Found ' + locations.length + ' location(s) for "' + city + '".');
    } catch (error) {
        console.error(error);
        showMessage('Something went wrong. Check your internet connection and try again.');
    }
});