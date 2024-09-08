function OlympicsMedalBarChart() {
    this.name = 'Olympics Medal Chart';
    this.id = 'olympics-medal-chart';
    this.loaded = false;
    this.selectedYear = '1896';  // Set default year
    this.selectedCountry = 'All Countries';  // Default country selection
    this.yearDropdown = null;  // Dropdown for year selection
    this.countryDropdown = null;  // Dropdown for country selection

    this.preload = function() {
        loadStrings('./data/Olympics2021/Country_Medals.csv', (result) => {
            // Manually parse the CSV file
            this.rawData = result;
            this.loaded = true;
            console.log("Data loaded successfully");
        }, (error) => {
            console.log("Error loading the file:", error);
        });
    };

    this.setup = function() {
        // Parse the rawData manually using semicolon as a delimiter
        this.data = this.rawData.map(row => row.split(';'));

        // Extract headers
        this.headers = this.data[0];  // ['Year', 'Country_Code', ...]
    
        // Remove the headers from the data array
        this.data = this.data.slice(1);

        // Group data by year and country
        this.yearsData = this.groupDataByYear();
        this.countryData = this.groupDataByCountry();
        console.log("Grouped Data by Year:", this.yearsData);
        console.log("Grouped Data by Country:", this.countryData);

        // Create the year dropdown
        this.yearDropdown = createSelect();
        this.yearDropdown.option('Select a year...');
        for (let year in this.yearsData) {
            this.yearDropdown.option(year);
        }
        this.yearDropdown.selected('1896');  // Set default selection
        this.yearDropdown.changed(() => {
            this.selectedYear = this.yearDropdown.value();
        });
        this.yearDropdown.style('padding', '8px');
        this.yearDropdown.style('font-size', '14px');
        this.yearDropdown.style('border', '1px solid #ccc');
        this.yearDropdown.style('border-radius', '5px');
        this.yearDropdown.style('margin-left', '20px');

        // Create the country dropdown
        this.countryDropdown = createSelect();
        this.countryDropdown.option('All Countries');
        let countryNames = Object.keys(this.countryData);
        countryNames.sort();  // Sort countries alphabetically
        countryNames.forEach(country => {
            this.countryDropdown.option(country);
        });
        this.countryDropdown.selected('All Countries');  // Set default selection
        this.countryDropdown.changed(() => {
            this.selectedCountry = this.countryDropdown.value();
            if (this.selectedCountry === 'All Countries') {
                this.yearDropdown.removeAttribute('disabled'); // Enable year dropdown
                this.selectedYear = '1896';  // Reset year selection
            } else {
                this.yearDropdown.attribute('disabled', ''); // Disable year dropdown
                this.selectedYear = null;  // Clear selected year when a country is selected
            }
        });
        this.countryDropdown.style('padding', '8px');
        this.countryDropdown.style('font-size', '14px');
        this.countryDropdown.style('border', '1px solid #ccc');
        this.countryDropdown.style('border-radius', '5px');
        this.countryDropdown.style('margin-left', '20px');
    };

    this.groupDataByYear = function() {
        const yearsData = {};

        this.data.forEach(row => {
            const year = row[0];           // 'Year'
            const countryCode = row[1];    // 'Country_Code'
            const countryName = row[2];    // 'Country_Name'
            const gold = parseInt(row[5]);  // 'Gold'
            const silver = parseInt(row[6]); // 'Silver'
            const bronze = parseInt(row[7]); // 'Bronze'
            const totalMedals = gold + silver + bronze;

            if (!yearsData[year]) {
                yearsData[year] = [];
            }
            yearsData[year].push({ countryCode, countryName, totalMedals });
        });

        return yearsData;
    };

    this.groupDataByCountry = function() {
        const countryData = {};

        this.data.forEach(row => {
            const year = row[0];           // 'Year'
            const countryCode = row[1];    // 'Country_Code'
            const countryName = row[2];    // 'Country_Name'
            const gold = parseInt(row[5]);  // 'Gold'
            const silver = parseInt(row[6]); // 'Silver'
            const bronze = parseInt(row[7]); // 'Bronze'
            const totalMedals = gold + silver + bronze;

            if (!countryData[countryName]) {
                countryData[countryName] = [];
            }
            countryData[countryName].push({ year, totalMedals });
        });

        return countryData;
    };

    this.draw = function() {
        clear();
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
    
        clear();
    
        let displayData;
    
        if (this.selectedCountry !== 'All Countries') {
            displayData = this.countryData[this.selectedCountry];
            if (!displayData) {
                console.log("No data for the selected country.");
                return;
            }
    
            // Sort the displayData by year
            displayData.sort((a, b) => a.year - b.year);
        } else if (this.selectedYear && this.selectedYear !== 'Select a year...') {
            displayData = this.yearsData[this.selectedYear];
            if (!displayData) {
                console.log("No data for the selected year.");
                return;
            }
        } else {
            console.log("No year or country selected.");
            return;
        }
    
        // Limit to maximum 30 countries or years
        if (displayData.length > 30) {
            displayData = displayData.slice(0, 30);
        }
    
        const maxMedals = Math.max(...displayData.map(d => d.totalMedals || d.totalMedals));
    
        // Adjust screen dynamically based on the number of bars (up to 30)
        const margin = 50;
        const barWidth = (width - margin * 2) / displayData.length;
        const yScale = (height - margin * 2) / maxMedals;
    
        // Draw y-axis labels
        textSize(12);
        textAlign(RIGHT);
        for (let j = 0; j <= maxMedals; j += Math.ceil(maxMedals / 5)) {
            const y = height - j * yScale - margin;
            text(j, margin - 10, y);
            stroke(200);
            line(margin, y, width - margin, y); // Grid lines
        }
    
        // Title for the graph
        textAlign(CENTER);
        textSize(20);
        if (this.selectedCountry === 'All Countries') {
            text(`${this.selectedYear} Olympic Medal Records`, width / 2, margin / 2);
        } else {
            text(`Olympic Medal History: ${this.selectedCountry}`, width / 2, margin / 2);
        }
    
        // Draw bars
        displayData.forEach((d, i) => {
            const barHeight = d.totalMedals * yScale;
            const xPos = i * barWidth + margin;
            const yPos = height - barHeight - margin;
    
            // Draw the bar
            fill('steelblue');
            rect(xPos, yPos, barWidth * 0.8, barHeight);
    
            // Add total medals text inside the bars
            fill('red');  // Set the text color to red
            textAlign(CENTER);
            textSize(12);
            text(d.totalMedals, xPos + barWidth * 0.4, yPos + barHeight / 2);
    
            // Show year or country code on hover
            if (mouseX > xPos && mouseX < xPos + barWidth * 0.8 && mouseY < height - margin && mouseY > yPos) {
                fill(0);  // Set the text color to black
                textSize(14);
                let hoverText = this.selectedCountry === 'All Countries' ? d.countryName : d.year;
                let textX = xPos + barWidth * 0.4;
                let textY = Math.max(yPos - 20, margin); // Ensure the text doesn't go above the canvas
                text(hoverText, textX, textY);
            }
    
            // Add year or country code labels below the bars
            fill(0);  // Set the text color to black
            textAlign(CENTER);
            textSize(10);
            let label = this.selectedCountry === 'All Countries' ? d.countryCode : d.year;
            text(label, xPos + barWidth * 0.4, height - margin + 20);
        });
    };
    
    // Adding the year and country dropdowns to the control panel
    this.getControls = function() {
        var controls = [];

        if (this.yearDropdown) {
            controls.push(this.yearDropdown);
        }
        if (this.countryDropdown) {
            controls.push(this.countryDropdown);
        }
        return controls;
    };
}
