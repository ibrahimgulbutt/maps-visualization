function TechDiversityGender() {
  // Name for the visualisation to appear in the menu bar.
  this.name = 'Tech Diversity: Gender';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'tech-diversity-gender';

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    leftMargin: 130,
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Middle of the plot: for 50% line.
  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;

  // Default visualisation colours.
  this.femaleColour = color(255, 0 ,0);
  this.maleColour = color(0, 255, 0);

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Sorting order (default is by company name).
  this.sortOrder = 'company';

  // Whether to show percentages on bars.
  this.showPercent = true;

  this.sortBy=null;
  this.togglePercent=null;

  // Preload the data.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/gender-2018.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    textSize(16);
    // Create a sort dropdown
    this.sortBy = createSelect();
    this.sortBy.option('Company Name');
    this.sortBy.option('Female Percentage');
    this.sortBy.option('Male Percentage');
    this.sortBy.changed(() => {
      let selected = this.sortBy.value();
      if (selected === 'Company Name') {
        this.sortOrder = 'company';
      } else if (selected === 'Female Percentage') {
        this.sortOrder = 'female';
      } else {
        this.sortOrder = 'male';
      }
      this.sortData();
    });

    // Toggle percentage display
    this.togglePercent = createCheckbox('Show Percentages', this.showPercent);
    this.togglePercent.changed(() => {
      this.showPercent = this.togglePercent.checked();
    });
  };

  this.destroy = function() {
  };

  // Sort data based on selected order
  this.sortData = function() {
    this.data.rows.sort((a, b) => {
      if (this.sortOrder === 'company') {
        return a.get('company').localeCompare(b.get('company'));
      }
      return b.getNum(this.sortOrder) - a.getNum(this.sortOrder);
    });
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawCategoryLabels();
    this.sortData(); // Sort data before drawing

    var lineHeight = (height - this.layout.topMargin) /
        this.data.getRowCount();

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var company = {
        'name': this.data.getString(i, 'company'),
        'female': this.data.getNum(i, 'female'),
        'male': this.data.getNum(i, 'male'),
      };

      // Company name
      fill(0);
      noStroke();
      textAlign('right', 'top');
      text(company.name,
           this.layout.leftMargin - this.layout.pad,
           lineY);

      // Female employees bar
      fill(this.femaleColour);
      rect(this.layout.leftMargin,
           lineY,
           this.mapPercentToWidth(company.female),
           lineHeight - this.layout.pad);

      // Male employees bar
      fill(this.maleColour);
      rect(this.layout.leftMargin + this.mapPercentToWidth(company.female),
           lineY,
           this.mapPercentToWidth(company.male),
           lineHeight - this.layout.pad);

      // Display percentage values if toggled on
      if (this.showPercent) {
        fill(0);
        textAlign('left', 'center');
        text(`${company.female}%`,
             this.layout.leftMargin + this.mapPercentToWidth(company.female) - 50,
             lineY + (lineHeight / 2));
        textAlign('left', 'center');
        text(`${company.male}%`,
             this.layout.leftMargin + this.mapPercentToWidth(company.female) +
             this.mapPercentToWidth(company.male) - 50,
             lineY + (lineHeight / 2));
      }

      // Store data for tooltip
      if (mouseX > this.layout.leftMargin &&
          mouseX < this.layout.rightMargin &&
          mouseY > lineY && mouseY < lineY + lineHeight) {
        this.hoveredCompany = company;
        this.hoveredY = lineY;
        this.hoveredLineHeight = lineHeight;
      }
    }

    // Draw 50% line
    stroke(150);
    strokeWeight(1);
    line(this.midX,
         this.layout.topMargin,
         this.midX,
         this.layout.bottomMargin);

    // Draw legend
    this.drawLegend();

    // Draw tooltip
    if (this.hoveredCompany) {
      this.showHoverInfo(this.hoveredCompany, this.hoveredY, this.hoveredLineHeight);
    }
  };

  // Display hover info box
  this.showHoverInfo = function(company, y, lineHeight) {
    fill(255);
    stroke(0);
    strokeWeight(2); // Ensure tooltip box is visible
    rect(mouseX + 10, mouseY - 30, 150, 70); // Adjusted position for tooltip
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text(`Company: ${company.name}`, mouseX + 15, mouseY - 25);
    text(`Female: ${company.female}%`, mouseX + 15, mouseY - 10);
    text(`Male: ${company.male}%`, mouseX + 15, mouseY + 5);
  };

  this.drawCategoryLabels = function() {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female',
         this.layout.leftMargin,
         this.layout.pad);
    textAlign('center', 'top');
    text('50%',
         this.midX,
         this.layout.pad);
    textAlign('right', 'top');
    text('Male',
         this.layout.rightMargin,
         this.layout.pad);
  };

  // Draw a simple legend
// Draw a simple legend
this.drawLegend = function() {
  fill(0);
  textAlign('center', 'top'); // Center text horizontally
  text('Legend:', width / 2, this.layout.topMargin - 60); // Adjust vertical position

  // Define the spacing for legend items
  var legendSpacing = 100;
  var startX = width / 2 - legendSpacing;

  // Female legend
  fill(this.femaleColour);
  rect(startX, this.layout.topMargin - 20, 15, 15); // Adjust vertical position
  fill(0);
  text('Female', startX + 50, this.layout.topMargin - 20);

  // Male legend
  fill(this.maleColour);
  rect(startX + 80, this.layout.topMargin - 20, 15, 15); // Adjust vertical position
  fill(0);
  text('Male', startX + 120, this.layout.topMargin - 20);
};



  this.mapPercentToWidth = function(percent) {
    return map(percent, 0, 100, 0, this.layout.plotWidth());
  };

  this.getControls = function() {
    var controls = [];

    if (this.togglePercent) {
        controls.push(this.togglePercent);
    }

    if (this.sortBy) {
        controls.push(this.sortBy);
    }

    return controls;
};
}
