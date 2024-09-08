function PieChart(x, y, diameter) {
  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;

  // Tooltip element
  this.tooltip = createDiv('');
  this.tooltip.style('position', 'absolute');
  this.tooltip.style('background-color', 'rgba(0, 0, 0, 0.7)');
  this.tooltip.style('color', 'white');
  this.tooltip.style('padding', '8px');
  this.tooltip.style('border-radius', '5px');
  this.tooltip.style('font-size', '14px');
  this.tooltip.style('font-weight', 'bold');
  this.tooltip.style('display', 'none');

  this.get_radians = function(data) {
    var total = sum(data);
    var radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * TWO_PI);
    }

    return radians;
  };

  this.draw = function(data, labels, colours, title) {
    if (data.length == 0) {
      alert('Data has length zero!');
    } else if (![labels, colours].every((array) => {
      return array.length == data.length;
    })) {
      alert(`Data (length: ${data.length})
Labels (length: ${labels.length})
Colours (length: ${colours.length})
Arrays must be the same length!`);
    }

    var angles = this.get_radians(data);
    var lastAngle = 0;
    let isMouseOverAnySlice = false;

    for (var i = 0; i < data.length; i++) {
      let baseColour = color(colours[i]);

      // Gradient effect: fill with base color
      fill(baseColour);
      stroke(0);
      strokeWeight(1);

      let isMouseOver = this.isMouseOverSlice(lastAngle, angles[i]);
      let offset = isMouseOver ? 20 : 0; // Offset when the mouse is over

      let midAngle = lastAngle + angles[i] / 2;
      let xOffset = offset * cos(midAngle);
      let yOffset = offset * sin(midAngle);

      arc(this.x + xOffset, this.y + yOffset, this.diameter, this.diameter, lastAngle, lastAngle + angles[i] + 0.001); // Hack for 0!

      if (isMouseOver) {
        isMouseOverAnySlice = true;
        this.showTooltip(mouseX, mouseY, labels[i], data[i], sum(data));
      }

      if (labels) {
        this.makeLegendItem(labels[i], i, colours[i]);
      }

      lastAngle += angles[i];
    }

    if (!isMouseOverAnySlice) {
      this.hideTooltip();
    }

    if (title) {
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(30);
      textStyle(BOLD);
      text(title, this.x, this.y - this.diameter * 0.6);
    }
  };

  this.isMouseOverSlice = function(lastAngle, angle) {
    let mouseAngle = atan2(mouseY - this.y, mouseX - this.x);
    if (mouseAngle < 0) mouseAngle += TWO_PI; // Ensure angle is positive

    let withinArc = mouseAngle > lastAngle && mouseAngle < lastAngle + angle;
    let distance = dist(mouseX, mouseY, this.x, this.y);

    return withinArc && distance < this.diameter / 2;
  };

  this.showTooltip = function(x, y, label, value, total) {
    let percentage = ((value / total) * 100).toFixed(2) + '%';
    this.tooltip.html(`${label}: ${percentage}`);
    this.tooltip.style('display', 'block');
    this.tooltip.position(x + 10, y + 10);
  };

  this.hideTooltip = function() {
    this.tooltip.style('display', 'none');
  };

  this.makeLegendItem = function(label, i, colour) {
    var x = this.x + 50 + this.diameter / 2;
    var y = this.y + (this.labelSpace * i) - this.diameter / 3;
    var boxWidth = this.labelSpace / 2;
    var boxHeight = this.labelSpace / 2;

    fill(colour);
    rect(x, y, boxWidth, boxHeight);

    fill('black');
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    textStyle(BOLD);
    text(label, x + boxWidth + 10, y + boxHeight / 2);
  };
}
