function Olympics2021Geography() {
    this.name = 'Olympics 2021 Geography';
    this.id = 'olympics-2021-geography';
    this.loaded = false;

    // UI elements
    this.slider = null;
    this.countryDropdown = null;
    this.disciplineDropdown = null;
    this.selectedCountry = null;
    this.selectedDiscipline = null;
    this.totalCountries = 0;
    this.countryData = {};
    this.disciplineData = {};

    // Create the tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'olympics2021-tooltip';
    this.tooltip.classList.add('hidden');
    document.body.appendChild(this.tooltip);

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/Olympics2021/Updated_MergedData.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
            }
        );
    };

    this.setup = function() {
        textSize(16);
        textAlign('center', 'center');
        this.mapImage = loadImage('https://uploads-ssl.webflow.com/5d6e55ca1416617737eabacd/60be3976de00dcadda1fea81_worldmap.jpg');

        // Group data by country and discipline
        this.groupData();

        // Create a slider for country display
        this.slider = createSlider(1, Object.keys(this.countryData).length, Object.keys(this.countryData).length, 1);
        this.slider.style('width', '400px');

        // Create dropdowns for country and discipline selection (as before)
        this.createDropdowns();
    };

    this.createDropdowns = function() {
        // Create a dropdown for country selection
        this.countryDropdown = createSelect();
        this.countryDropdown.option('Select a country...');
        for (let country in this.countryData) {
            this.countryDropdown.option(country);
        }
        this.countryDropdown.changed(() => {
            this.selectedCountry = this.countryDropdown.value();
            if (this.selectedCountry === 'Select a country...') {
                this.selectedCountry = null;
            }
        });
        this.countryDropdown.style('padding', '8px');
        this.countryDropdown.style('font-size', '14px');
        this.countryDropdown.style('border', '1px solid #ccc');
        this.countryDropdown.style('border-radius', '5px');
        this.countryDropdown.style('margin-left', '20px');

        // Create a dropdown for discipline selection
        this.disciplineDropdown = createSelect();
        this.disciplineDropdown.option('Select a discipline...');
        for (let discipline in this.disciplineData) {
            this.disciplineDropdown.option(discipline);
        }
        this.disciplineDropdown.changed(() => {
            this.selectedDiscipline = this.disciplineDropdown.value();
            if (this.selectedDiscipline === 'Select a discipline...') {
                this.selectedDiscipline = null;
            }
        });
        this.disciplineDropdown.style('padding', '8px');
        this.disciplineDropdown.style('font-size', '14px');
        this.disciplineDropdown.style('border', '1px solid #ccc');
        this.disciplineDropdown.style('border-radius', '5px');
        this.disciplineDropdown.style('margin-left', '20px');
    };

    this.groupData = function() {
        this.countryData = {};
        this.disciplineData = {};

        for (let i = 0; i < this.data.getRowCount(); i++) {
            let country = this.data.getString(i, 'Country Code');
            let lat = this.data.getNum(i, 'Latitude');
            let lon = this.data.getNum(i, 'Longitude');
            let player = this.data.getString(i, 'Name of Player');
            let discipline = this.data.getString(i, 'Discipline');

            if (!this.countryData[country]) {
                this.countryData[country] = {
                    athletes: [],
                    disciplines: new Set(),
                    lat: lat,
                    lon: lon
                };
            }
            this.countryData[country].athletes.push(player);
            this.countryData[country].disciplines.add(discipline);

            if (!this.disciplineData[discipline]) {
                this.disciplineData[discipline] = new Set();
            }
            this.disciplineData[discipline].add(country);
        }
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        clear();
        image(this.mapImage, 0, 0, width, height);

        textSize(24);
        textAlign(CENTER, TOP);
        text('Olympics 2021 Geography', width / 2, 20);

        let numCountries = this.slider.value();
        let displayedCountries = Object.keys(this.countryData).slice(0, numCountries);
        this.totalDots = 0;

        let tooltipVisible = false;

        for (let country of displayedCountries) {
            let countryInfo = this.countryData[country];
            let x = map(countryInfo.lon, -180, 180, 0, width);
            let y = map(countryInfo.lat, 90, -90, 0, height);

            // Filter by selected country and discipline
            if (this.selectedCountry && this.selectedCountry !== country) {
                continue;
            }
            if (this.selectedDiscipline && !countryInfo.disciplines.has(this.selectedDiscipline)) {
                continue;
            }

            fill(255, 0, 0);
            noStroke();
            ellipse(x, y, 10, 10);

            if (dist(mouseX, mouseY, x, y) < 10) {
                let numAthletes = countryInfo.athletes.length;

                // Set tooltip content and position
                this.tooltip.innerHTML = `${country}: ${numAthletes} athletes`;
                this.tooltip.style.left = `${mouseX + 500}px`;
                this.tooltip.style.top = `${mouseY + 120}px`;
                this.tooltip.classList.remove('hidden');
                this.tooltip.classList.add('visible');
                tooltipVisible = true;
            }

            this.totalDots++;
        }

        if (!tooltipVisible) {
            this.tooltip.classList.remove('visible');
            this.tooltip.classList.add('hidden');
        }

        textSize(16);
        textAlign(RIGHT, BOTTOM);
        text(`Total Countries: ${this.totalDots}`, width - 20, height - 20);
    };

    this.getControls = function() {
        var controls = [];

        if (this.slider) {
            controls.push(this.slider);
        }

        if (this.countryDropdown) {
            controls.push(this.countryDropdown);
        }

        if (this.disciplineDropdown) {
            controls.push(this.disciplineDropdown);
        }

        return controls;
    };
}
