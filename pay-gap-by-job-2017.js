function PayGapByJob2017() {
  // Name and ID for the visualisation.
  this.name = 'Pay gap by job: 2017';
  this.id = 'pay-gap-by-job-2017';
  this.loaded = false;

  // Graph properties.
  this.pad = 40;
  this.dotSizeMin = 5;
  this.dotSizeMax = 20;
  this.colorGradient = [
    color(255, 69, 0),   // Red - Men Paid More
    color(0, 128, 0),    // Green - Equal Pay
    color(30, 144, 255)  // Blue - Women Paid More
  ];

  // Zoom properties.
  this.zoomLevel = 1;
  this.zoomFactor = 1.2;
  this.currentXMin = 0;
  this.currentXMax = 100;
  this.currentYMin = -20;
  this.currentYMax = 20;
  this.originalXMin = 0;
  this.originalXMax = 100;
  this.originalYMin = -20;
  this.originalYMax = 20;

  this.zoomInButton = null;
  this.zoomOutButton = null;

  this.AllButton = null;
  this.MenButton = null;
  this.WomenButton = null;
  this.EqualButton = null;
  this.ButtonLabel=null;
  // Filter properties.
  this.filter = 'All';

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function() {
    this.animationProgress = 0;

    // Create filter buttons
    this.AllButton = createButton('All');
    this.MenButton = createButton('Men Paid More');
    this.WomenButton = createButton('Women Paid More');
    this.EqualButton = createButton('Equal Pay');

    // Create zoom buttons
    this.zoomInButton = createButton('Zoom In');
    this.zoomOutButton = createButton('Zoom Out');

    // Setup button click handlers
    this.AllButton.mousePressed(() => this.setFilter('All'));
    this.MenButton.mousePressed(() => this.setFilter('Men Paid More'));
    this.WomenButton.mousePressed(() => this.setFilter('Women Paid More'));
    this.EqualButton.mousePressed(() => this.setFilter('Equal Pay'));
    this.zoomInButton.mousePressed(() => this.zoomIn());
    this.zoomOutButton.mousePressed(() => this.zoomOut());
  };

  this.destroy = function() {
    // Remove filter and zoom buttons
    this.AllButton.remove();
    this.MenButton.remove();
    this.WomenButton.remove();
    this.EqualButton.remove();
    this.zoomInButton.remove();
    this.zoomOutButton.remove();
  
    // Additional cleanup if needed
    if (this.filterButtonsDiv) {
      this.filterButtonsDiv.remove();
    }
    if (this.zoomButtonsDiv) {
      this.zoomButtonsDiv.remove();
    }
  };
  

  this.getControls = function() {
    // Return the filter and zoom controls to be added to the control panel.
    return [this.AllButton, this.MenButton, this.WomenButton, this.EqualButton,this.zoomInButton, this.zoomOutButton];
  };

  this.createFilterControls = function() {
    let filterButtonStyle = `
      background-color: #007bff;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    `;

    let zoomButtonStyle = `
    background-color: #dc3545; /* Red for zoom buttons */
    color: red;
    border: 2px solid #a71d2a; /* Darker red border for 3D effect */
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* 3D shadow effect */
    font-weight: bold;
  `;

  this.ButtonLabel = createSpan('hello').style('font-weight', 'bold').parent(this.startSliderDiv);

    // Apply style to filter buttons
    this.AllButton.style(filterButtonStyle);
    this.MenButton.style(filterButtonStyle);
    this.WomenButton.style(filterButtonStyle);
    this.EqualButton.style(filterButtonStyle);

    // Apply style to zoom buttons
    this.zoomInButton.style('margin', '10px').style('background-color', '#28a745').style('color', '#fff').style('border', 'none').style('padding', '5px 10px').style('border-radius', '5px');
    this.zoomOutButton.style('margin', '10px').style('background-color', '#28a745').style('color', '#fff').style('border', 'none').style('padding', '5px 10px').style('border-radius', '5px');
  };

  this.setFilter = function(filter) {
    this.filter = filter;
    redraw();
  };

  this.zoomIn = function() {
    this.zoomLevel *= this.zoomFactor;
    this.updateZoomBounds();
    redraw();
  };

  this.zoomOut = function() {
    this.zoomLevel /= this.zoomFactor;
    this.updateZoomBounds();
    redraw();
  };

  this.filterData = function(propFemale, payGap, numJobs, jobs) {
    // Filtering data based on the selected filter
    let filteredData = {
      propFemale: [],
      payGap: [],
      numJobs: [],
      jobs: []
    };

    for (let i = 0; i < propFemale.length; i++) {
      if (this.filter === 'All' ||
          (this.filter === 'Men Paid More' && payGap[i] > 0) ||
          (this.filter === 'Women Paid More' && payGap[i] < 0) ||
          (this.filter === 'Equal Pay' && payGap[i] === 0)) {
        filteredData.propFemale.push(propFemale[i]);
        filteredData.payGap.push(payGap[i]);
        filteredData.numJobs.push(numJobs[i]);
        filteredData.jobs.push(jobs[i]);
      }
    }

    return filteredData;
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }
  
    background(255);
    this.addAxes();
  
    var jobs = this.data.getColumn('job_subtype');
    var propFemale = this.data.getColumn('proportion_female');
    var payGap = this.data.getColumn('pay_gap');
    var numJobs = this.data.getColumn('num_jobs');
  
    propFemale = stringsToNumbers(propFemale);
    payGap = stringsToNumbers(payGap);
    numJobs = stringsToNumbers(numJobs);
  
    var filteredData = this.filterData(propFemale, payGap, numJobs, jobs);
  
    var propFemaleMin = this.currentXMin;
    var propFemaleMax = this.currentXMax;
    var payGapMin = this.currentYMin;
    var payGapMax = this.currentYMax;
  
    var numJobsMin = min(filteredData.numJobs);
    var numJobsMax = max(filteredData.numJobs);
  
    noStroke();
    this.animationProgress = min(1, this.animationProgress + 0.01);
  
    let tooltip = document.getElementById('paygap2017tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'paygap2017tooltip';
      document.body.appendChild(tooltip);
    }
  
    tooltip.style.display = 'none'; // Hide tooltip by default
  
    for (let i = 0; i < filteredData.propFemale.length; i++) {
      let x = map(filteredData.propFemale[i], propFemaleMin, propFemaleMax, this.pad, width - this.pad);
      let y = map(filteredData.payGap[i], payGapMin, payGapMax, height - this.pad, this.pad);
      let size = map(filteredData.numJobs[i], numJobsMin, numJobsMax, this.dotSizeMin, this.dotSizeMax) * this.animationProgress;
  
      let colIndex = map(filteredData.payGap[i], -20, 20, 0, this.colorGradient.length - 1);
      let dotColor = lerpColor(this.colorGradient[0], this.colorGradient[2], colIndex / (this.colorGradient.length - 1));
  
      fill(dotColor);
      ellipse(x, y, size);
  
      if (dist(mouseX, mouseY, x, y) < size / 2) {
        // Set tooltip content and position
        let tooltipText = `${filteredData.jobs[i]}<br>Pay Gap: ${filteredData.payGap[i].toFixed(2)}%<br>Female Proportion: ${filteredData.propFemale[i].toFixed(2)}%<br>Jobs: ${filteredData.numJobs[i]}`;
        tooltip.innerHTML = tooltipText;
        tooltip.style.left = `${mouseX + 500}px`; // Adjust horizontal position
        tooltip.style.top = `${mouseY + 60}px`; // Adjust vertical position
        tooltip.style.display = 'block'; // Make tooltip visible
  
        // Draw dot outline
        stroke(0);
        strokeWeight(2);
        ellipse(x, y, size + 10);
        noStroke();
      }
    }
  
    this.addLegend();
  };
  
  

  this.updateZoomBounds = function() {
    this.currentXMin = this.originalXMin / this.zoomLevel;
    this.currentXMax = this.originalXMax / this.zoomLevel;
    this.currentYMin = this.originalYMin / this.zoomLevel;
    this.currentYMax = this.originalYMax / this.zoomLevel;
  };

  this.addAxes = function () {
    stroke(150);
    line(width / 2, this.pad, width / 2, height - this.pad);
    line(this.pad, height / 2, width - this.pad, height / 2);

    let xStep = (this.currentXMax - this.currentXMin) / 10;
    for (let i = this.currentXMin; i <= this.currentXMax; i += xStep) {
      let x = map(i, this.currentXMin, this.currentXMax, this.pad, width - this.pad);
      stroke(150);
      line(x, height / 2 - 5, x, height / 2 + 5);
      fill(0);
      textAlign(CENTER, TOP);
      text(i.toFixed(2), x, height / 2 + 10);
    }

    let yStep = (this.currentYMax - this.currentYMin) / 8;
    for (let i = this.currentYMin; i <= this.currentYMax; i += yStep) {
      let y = map(i, this.currentYMin, this.currentYMax, height - this.pad, this.pad);
      stroke(150);
      line(width / 2 - 5, y, width / 2 + 5, y);
      fill(0);
      textAlign(RIGHT, CENTER);
      text(i.toFixed(2), width / 2 - 10, y);
    }
  };

  this.addLegend = function() {
    // Add legend for color gradient
    let legendWidth = 200;
    let legendHeight = 20;
    let legendX = width - this.pad - legendWidth;
    let legendY = this.pad;

    for (let i = 0; i < this.colorGradient.length; i++) {
      stroke(150);
      fill(this.colorGradient[i]);
      rect(legendX + i * (legendWidth / this.colorGradient.length), legendY, legendWidth / this.colorGradient.length, legendHeight);
    }

    fill(0);
    textSize(12);
    textAlign(LEFT, CENTER);
    text('Men Paid More', legendX, legendY + legendHeight + 10);
    text('Women Paid More', legendX + legendWidth - textWidth('Women Paid More'), legendY + legendHeight + 10);
  };
}

function stringsToNumbers(array) {
  return array.map(function(value) {
    return parseFloat(value.replace(/,/g, ''));
  });
}
