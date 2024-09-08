function TechDiversityRace() {
  // Name for the visualization to appear in the menu bar.
  this.name = 'Tech Diversity: Race';

  // Each visualization must have a unique ID with no special characters.
  this.id = 'tech-diversity-race';

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualization is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/race-2018.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Create a select DOM element.
    this.select = createSelect();
    // Add the custom class for styling
    this.select.class('company-select');

    // Fill the options with all company names.
    var companies = this.data.columns;
    // First entry is empty.
    for (let i = 1; i < companies.length; i++) {
      this.select.option(companies[i]);
    }
  };

  this.getControls = function() {
    // Return the dropdown select element as a control
    return [this.select];
  };

  this.destroy = function() {
    this.select.remove();
  };

  // Create a new pie chart object.
  this.pie = new PieChart(width / 2, height / 2, width * 0.4);

  // Assuming you have an element with the class 'tooltip' for the tooltip
const tooltip = d3.select('#pie-tooltip');

this.draw = function() {
  if (!this.loaded) {
    console.log('Data not yet loaded');
    return;
  }

  var companyName = this.select.value();
  var col = stringsToNumbers(this.data.getColumn(companyName));
  var labels = this.data.getColumn(0);
  var colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];
  var title = 'Employee diversity at ' + companyName;

  this.pie.draw(col, labels, colours, title);

  // Bind data to pie chart slices and handle mouse events
  d3.selectAll('.arc')
    .on('mousemove', function(event, d) {
      tooltip
        .style('opacity', 1)
        .style('left', (event.pageX + 10) + 'px')  // Slight offset to the right
        .style('top', (event.pageY + 100) + 'px')   // Slight offset below the cursor
        .html(`Label: ${d.data.label}<br>Value: ${d.data.value}`);
    })
    .on('mouseout', function() {
      tooltip.style('opacity', 0);
    });
};

}
