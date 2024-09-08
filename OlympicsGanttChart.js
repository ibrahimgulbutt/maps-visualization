function OlympicsGanttChart() {
  this.name = 'Olympics Gantt Chart';
  this.id = 'olympics-gantt-chart';

  this.layout = {
    leftMargin: 150,
    rightMargin: width - 50,
    topMargin: 50,
    bottomMargin: height - 50,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
  };

  this.loaded = false;

  // Dropdowns for date selection, to be added to the control panel
  this.createDateDropdowns = function() {
    const uniqueYears = [...new Set(this.data.getColumn('year'))].sort();

    const startDropdown = createSelect();
    const endDropdown = createSelect();

    startDropdown.option('Select Start Year');
    endDropdown.option('Select End Year');

    uniqueYears.forEach(year => {
      startDropdown.option(year);
      endDropdown.option(year);
    });

    // Set default values
    startDropdown.selected(uniqueYears[0]);
    endDropdown.selected(uniqueYears[uniqueYears.length - 1]);

    // Add dropdowns to control panel
    this.startDropdown = startDropdown;
    this.endDropdown = endDropdown;
  };

  this.preload = function() {
    var self = this;
    this.data = loadTable('./data/Olympics2021/Olympics_Games.csv', 'csv', 'header', function(table) {
      self.loaded = true;
    });
  };

  this.setup = function() {
    textSize(16);
    this.selectedCountry = 'All Countries';

    const margin = {top: 150, right: 100, bottom: 50, left: 500};
    const width = this.layout.plotWidth();
    const height = this.layout.plotHeight();

    d3.select('svg').remove();
    d3.select('#gantt-tooltip').remove();

    const svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('position', 'absolute')
      .style('top', '40%')
      .style('left', '50%')
      .style('transform', 'translate(-50%, -50%)')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select('body').append('div')
      .attr('id', 'gantt-tooltip')
      .style('position', 'absolute')
      .style('background', '#f4f4f4')
      .style('padding', '8px')
      .style('border-radius', '5px')
      .style('box-shadow', '0px 0px 5px rgba(0,0,0,0.3)')
      .style('pointer-events', 'none')
      .style('visibility', 'hidden')
      .style('z-index', '9999');

    this.svg = svg;
    this.tooltip = tooltip;

    this.createDateDropdowns();
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(255);

    const selectedStartDate = parseInt(this.startDropdown.value());
    const selectedEndDate = parseInt(this.endDropdown.value());

    const events = [];
    for (let i = 0; i < this.data.getRowCount(); i++) {
      const startDateStr = this.data.getString(i, 'start_date');
      const endDateStr = this.data.getString(i, 'end_date');
      const year = this.data.getNum(i, 'year');

      if (startDateStr && endDateStr && year >= selectedStartDate && year <= selectedEndDate) {
        const startDate = new Date(startDateStr + ' ' + year);
        const endDate = new Date(endDateStr + ' ' + year);

        const event = {
          'year': year,
          'city': this.data.getString(i, 'city'),
          'country_noc': this.data.getString(i, 'country_noc'),
          'flag_url': this.data.getString(i, 'country_flag_url'),
          'start_date': startDate,
          'end_date': endDate,
        };
        events.push(event);
      }
    }

    events.sort((a, b) => a.year - b.year);

    const y = d3.scaleTime()
      .domain([new Date(2000, 0, 1), new Date(2000, 11, 31)])
      .range([this.layout.plotHeight(), 0]);

    const x = d3.scaleBand()
      .domain(events.map(d => d.year))
      .range([0, this.layout.plotWidth()])
      .padding(0.1);

    this.svg.selectAll('*').remove();

    // X-axis
    this.svg.append('g')
      .attr('transform', `translate(0, ${this.layout.plotHeight()})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    // Y-axis
    this.svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.timeFormat('%B')));

    // Draw bars
    this.svg.selectAll('rect')
      .data(events)
      .enter().append('rect')
      .attr('x', d => x(d.year))
      .attr('y', d => y(new Date(2000, d.end_date.getMonth(), d.end_date.getDate())))
      .attr('height', d => y(new Date(2000, d.start_date.getMonth(), d.start_date.getDate())) - y(new Date(2000, d.end_date.getMonth(), d.end_date.getDate())))
      .attr('width', x.bandwidth())
      .attr('fill', (d) => {
        const colorScale = d3.scaleLinear().domain([d.start_date, d.end_date]).range(['#1f77b4', '#ff7f0e']);
        return colorScale(d.start_date);
      })
      .on('mouseover', (event, d) => {
        d3.select(event.target).raise();
        this.tooltip.html(`<strong>Country Code:</strong> ${d.country_noc}<br>
                           <strong>City:</strong> ${d.city}<br>
                           <strong>Year:</strong> ${d.year}<br>
                           <strong>Dates:</strong> ${d3.timeFormat('%d %B')(d.start_date)} - ${d3.timeFormat('%d %B')(d.end_date)}`)
          .style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        this.tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden');
      });

    // Add flags
    this.svg.selectAll('image')
      .data(events)
      .enter().append('image')
      .attr('x', d => x(d.year) + x.bandwidth() / 2 - 15)
      .attr('y', d => y(new Date(2000, d.end_date.getMonth(), d.end_date.getDate())) - 25)
      .attr('width', 30)
      .attr('height', 20)
      .attr('xlink:href', d => d.flag_url);

    // Zoom and Pan
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [this.layout.plotWidth(), this.layout.plotHeight()]])
      .extent([[0, 0], [this.layout.plotWidth(), this.layout.plotHeight()]])
      .on('zoom', (event) => {
        this.svg.selectAll('rect').attr('transform', event.transform);
        this.svg.selectAll('image').attr('transform', event.transform);
      });

    this.svg.call(zoom);
  };

  this.getControls = function() {
    var controls = [];

    if (this.startDropdown && this.endDropdown) {
      controls.push(this.startDropdown);
      controls.push(this.endDropdown);
    }

    return controls;
  };
  this.destroy = function() {
    d3.select('svg').remove();
    d3.select('#gantt-tooltip').remove();
};
}
