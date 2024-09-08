function preload() {
  console.log("Preload function called for map image.");
  mapimg = loadImage('https://uploads-ssl.webflow.com/5d6e55ca1416617737eabacd/60be3976de00dcadda1fea81_worldmap.jpg');
  console.log("Map image preloaded.");
}

function setup() {
  canvasContainer = select('#app');
  var c = createCanvas(800, 450);
  c.parent('app');

  gallery = new Gallery();
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new Olympics2021Geography());
  gallery.addVisual(new OlympicsMedalBarChart()); 
  gallery.addVisual(new OlympicsGanttChart()); // Add the Gantt Chart
}


function draw() {
  if (gallery.selectedVisual !== null) {
      clear();
      gallery.selectedVisual.draw();
  }
}