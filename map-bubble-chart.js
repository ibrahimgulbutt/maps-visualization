function MapBubbleChart(maxdimension, title, longitude, latitude, size, dimension) {
    this.maxdimension = maxdimension;
    this.title = title;
    this.longitude = longitude;
    this.latitude = latitude;
    this.size = size;
    this.dimension = dimension;

    // Initialize the map
    this.map = L.map('map').setView([0, 0], 2); // Center the map at [0, 0] with zoom level 2

    // Add a tile layer to the map (e.g., OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.draw = function() {
        // Draw bubbles on the map
        for (let i = 0; i < this.maxdimension; i++) {
            let lat = parseFloat(this.latitude[i]);
            let lon = parseFloat(this.longitude[i]);
            let size = parseInt(this.size[i]);
            let name = this.dimension[i];

            L.circle([lat, lon], {
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.5,
                radius: size * 10000 // Adjust bubble size based on data
            }).bindPopup(name).addTo(this.map);
        }
    };
}

function preload() {
    console.log("Preload function called for map image.");
    mapimg = loadImage('https://uploads-ssl.webflow.com/5d6e55ca1416617737eabacd/60be3976de00dcadda1fea81_worldmap.jpg');
    console.log("Map image preloaded.");
}