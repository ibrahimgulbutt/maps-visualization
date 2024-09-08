function PayGapTimeSeries() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Pay gap: 1997-2017';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'pay-gap-timeseries';

  // Title to display above the plot.
  this.title = 'Gender Pay Gap: Average difference between male and female pay.';

  // Names for each axis.
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
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

    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  // Setup function
  this.setup = function() {
    textSize(16);

    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');
    this.minPayGap = 0;
    this.maxPayGap = max(this.data.getColumn('pay_gap'));

    // Slider to adjust start year
    this.slider = createSlider(this.startYear, this.endYear, this.startYear, 1);
    this.slider.style('width', '400px');

    // Toggle button to switch between pay gap and individual male/female pay
    this.showMedianPay = false;
    this.toggleButton = createButton('Toggle Pay Gap / Median Pay');
    this.toggleButton.mousePressed(() => this.showMedianPay = !this.showMedianPay);

    this.currentYear = this.startYear;  // For animation
  };

  // Tooltip drawing function
  this.drawTooltip = function(x, y, year, payGap, medianMale, medianFemale) {
    // Create or update tooltip element
    let tooltip = document.getElementById('paygap1997tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'paygap1997tooltip';
      document.body.appendChild(tooltip);
    }
    
    // Set tooltip content
    tooltip.innerHTML = `
      <div>Year: ${year}</div>
      <div>Pay Gap: ${payGap.toFixed(2)}%</div>
      <div>Male Pay: ${medianMale}</div>
      <div>Female Pay: ${medianFemale}</div>
    `;
  
    // Position the tooltip
    tooltip.style.left = `${x + 300}px`; // Adjust horizontal position
    tooltip.style.top = `${y + 150}px`; // Adjust vertical position
    tooltip.style.display = 'block'; // Make sure the tooltip is visible
  };
  
  

  

  this.destroy = function() {};

  // Main draw function
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.startYear = this.slider.value();  // Update based on slider value

    this.drawTitle();
    drawYAxisTickLabels(this.minPayGap, this.maxPayGap, this.layout, this.mapPayGapToHeight.bind(this), 0);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    var previous = null;
    var numYears = this.endYear - this.startYear;

    // Animation - draw data points one by one
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var current = {
        'year': this.data.getNum(i, 'year'),
        'payGap': this.data.getNum(i, 'pay_gap'),
        'medianMale': this.data.getNum(i, 'median_male'),
        'medianFemale': this.data.getNum(i, 'median_female')
      };

      if (current.year <= this.currentYear) {
        if (previous != null) {
          // Set color by trend (increasing/decreasing pay gap)
          if (current.payGap > previous.payGap) {
            stroke('red');
          } else {
            stroke('green');
          }
          strokeWeight(3); // Set line width here
          line(this.mapYearToWidth(previous.year),
               this.mapPayGapToHeight(previous.payGap),
               this.mapYearToWidth(current.year),
               this.mapPayGapToHeight(current.payGap));

          var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

          if (i % xLabelSkip == 0) {
            drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
          }

          // Highlight significant changes
          if (Math.abs(current.payGap - previous.payGap) > 5) {
            fill('orange');
            ellipse(this.mapYearToWidth(current.year), this.mapPayGapToHeight(current.payGap), 10, 10);
          }
        }

        // Show tooltip when hovering over points
        if (dist(mouseX, mouseY, this.mapYearToWidth(current.year), this.mapPayGapToHeight(current.payGap)) < 5) {
          this.drawTooltip(mouseX, mouseY, current.year, current.payGap, current.medianMale, current.medianFemale);
        }

        previous = current;
      }
    }

    // Increment currentYear for animation
    if (this.currentYear < this.endYear) {
      this.currentYear++;
    }

    // Toggle to show male/female pay lines
    if (this.showMedianPay) {
      stroke('blue');
      for (var i = 1; i < this.data.getRowCount(); i++) {
        var year = this.data.getNum(i, 'year');
        var malePay = this.data.getNum(i, 'median_male');
        var femalePay = this.data.getNum(i, 'median_female');
        line(this.mapYearToWidth(this.data.getNum(i - 1, 'year')),
             this.mapPayGapToHeight(this.data.getNum(i - 1, 'median_male')),
             this.mapYearToWidth(year), this.mapPayGapToHeight(malePay));
        stroke('purple');
        line(this.mapYearToWidth(this.data.getNum(i - 1, 'year')),
             this.mapPayGapToHeight(this.data.getNum(i - 1, 'median_female')),
             this.mapYearToWidth(year), this.mapPayGapToHeight(femalePay));
      }
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapYearToWidth = function(value) {
    return map(value, this.startYear, this.endYear, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapPayGapToHeight = function(value) {
    return map(value, this.minPayGap, this.maxPayGap, this.layout.bottomMargin, this.layout.topMargin);
  };

  this.getControls = function() {
    var controls = [];

    if (this.slider) {
        controls.push(this.slider);
    }

    if (this.toggleButton) {
        controls.push(this.toggleButton);
    }

    return controls;
};
}
