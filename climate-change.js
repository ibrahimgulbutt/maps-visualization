function ClimateChange() {
  this.name = 'Climate Change';
  this.id = 'climate-change';
  this.xAxisLabel = 'Year';
  this.yAxisLabel = '℃';

  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: false,
    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  this.loaded = false;

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/surface-temperature/surface-temperature.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
        console.log('Data loaded:', table); // Debug statement
        self.computeStatistics();
      });
  };

  this.setup = function() {
    textSize(16);
    textAlign(CENTER, CENTER);
    this.minYear = this.data.getNum(0, 'year');
    this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minTemperature = min(this.data.getColumn('temperature'));
    this.maxTemperature = max(this.data.getColumn('temperature'));
    this.meanTemperature = mean(this.data.getColumn('temperature'));
    this.frameCount = 0;

    this.createSliders();
    this.createTemperatureSliders();
    this.createExportButton();
  };

  this.destroy = function() {
    this.startSlider.remove();
    this.endSlider.remove();
    this.minTempSlider.remove();
    this.maxTempSlider.remove();
    this.exportButton.remove();
  };

  this.getControls = function() {
    return [this.startSliderLabel, this.startSlider, this.endSliderLabel, this.endSlider,
            this.exportButton];
  };

  this.createSliders = function() {
    this.startSliderDiv = createDiv().style('margin', '20px');
    this.startSliderLabel = createSpan('Start Year: ').style('font-weight', 'bold').parent(this.startSliderDiv);
    this.startSlider = createSlider(this.minYear, this.maxYear - 1, this.minYear, 1).parent(this.startSliderDiv);

    this.endSliderDiv = createDiv().style('margin', '20px');
    this.endSliderLabel = createSpan('End Year: ').style('font-weight', 'bold').parent(this.endSliderDiv);
    this.endSlider = createSlider(this.minYear + 1, this.maxYear, this.maxYear, 1).parent(this.endSliderDiv);
  };

  this.createTemperatureSliders = function() {
    this.minTempSliderDiv = createDiv().style('margin', '20px');
    this.minTempSliderLabel = createSpan('Min Temperature: ').style('font-weight', 'bold').parent(this.minTempSliderDiv);
    this.minTempSlider = createSlider(this.minTemperature, this.maxTemperature, this.minTemperature).parent(this.minTempSliderDiv);

    this.maxTempSliderDiv = createDiv().style('margin', '20px');
    this.maxTempSliderLabel = createSpan('Max Temperature: ').style('font-weight', 'bold').parent(this.maxTempSliderDiv);
    this.maxTempSlider = createSlider(this.minTemperature, this.maxTemperature, this.maxTemperature).parent(this.maxTempSliderDiv);
  };

  this.createExportButton = function() {
    this.exportButton = createButton('Export Data');
    this.exportButton.mousePressed(() => {
      let filteredData = [];
      for (var i = 0; i < this.data.getRowCount(); i++) {
        let year = this.data.getNum(i, 'year');
        if (year >= this.startYear && year <= this.endYear) {
          filteredData.push({
            year: year,
            temperature: this.data.getNum(i, 'temperature')
          });
        }
      }
      let csvContent = "data:text/csv;charset=utf-8," 
                      + "year,temperature\n"
                      + filteredData.map(e => e.year + "," + e.temperature).join("\n");
      let encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
    });
  };

  this.computeStatistics = function() {
    var temperatures = this.data.getColumn('temperature');
    this.meanTemperature = mean(temperatures);
    this.medianTemperature = median(temperatures);
    this.stdDevTemperature = stdDev(temperatures);
    console.log('Statistics computed:', this.meanTemperature, this.medianTemperature, this.stdDevTemperature); // Debug statement
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();

    this.minTemperature = this.minTempSlider.value();
    this.maxTemperature = this.maxTempSlider.value();

    console.log('Current range:', this.startYear, this.endYear);
    console.log('Temperature range:', this.minTemperature, this.maxTemperature);

    drawYAxisTickLabels(this.minTemperature,
                        this.maxTemperature,
                        this.layout,
                        this.mapTemperatureToHeight.bind(this),
                        1);

    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    stroke(200);
    strokeWeight(1);
    line(this.layout.leftMargin,
         this.mapTemperatureToHeight(this.meanTemperature),
         this.layout.rightMargin,
         this.mapTemperatureToHeight(this.meanTemperature));

    console.log(this.stdDevTemperature);
    console.log(this.meanTemperature);
    console.log(this.medianTemperature);

    textSize(14);
    fill(0);
    text(`Mean Temperature: ${this.meanTemperature.toFixed(2)}℃`, width / 2, height - 30);

    var previous;
    var numYears = this.endYear - this.startYear;
    var segmentWidth = this.layout.plotWidth() / numYears;
    var yearCount = 0;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        'year': this.data.getNum(i, 'year'),
        'temperature': this.data.getNum(i, 'temperature')
      };

      if (previous != null && current.year > this.startYear && current.year <= this.endYear) {
        noStroke();
        fill(this.mapTemperatureToColour(current.temperature));
        rect(this.mapYearToWidth(previous.year),
             this.layout.topMargin,
             segmentWidth,
             this.layout.plotHeight());

        stroke(0);
        line(this.mapYearToWidth(previous.year),
             this.mapTemperatureToHeight(previous.temperature),
             this.mapYearToWidth(current.year),
             this.mapTemperatureToHeight(current.temperature));

        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
        if (yearCount % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
        }

        if (numYears <= 6 && yearCount == numYears - 1) {
          drawXAxisTickLabel(current.year, this.layout, this.mapYearToWidth.bind(this));
        }

        yearCount++;
      }

      if (yearCount == numYears) {
        break;
      }

      previous = current;
    }
  };

  this.mapYearToWidth = function(value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapTemperatureToHeight = function(value) {
    // Constrain the mapped temperature height to stay within the plot area
    return constrain(map(value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin),
                     this.layout.topMargin, this.layout.bottomMargin);
  };
  

  this.mapTemperatureToColour = function(value) {
    var tempMin = this.minTempSlider.value();
    var tempMax = this.maxTempSlider.value();
    var red = map(value, tempMin, tempMax, 0, 255);
    var blue = 255 - red;
    return color(red, 0, blue, 100);
  };
}
