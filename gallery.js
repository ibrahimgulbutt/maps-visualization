function Gallery() {
  this.visuals = [];
  this.selectedVisual = null;
  var self = this;

  this.addVisual = function(vis) {
    if (!vis.hasOwnProperty('id') || !vis.hasOwnProperty('name')) {
      alert('Make sure your visualization has an id and name!');
      return;
    }

    if (this.findVisIndex(vis.id) != null) {
      alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
      return;
    }

    this.visuals.push(vis);

    var menuItem = createElement('li', '');
    var iconSpan = createElement('span', '');
    iconSpan.addClass('icon');
    var nameSpan = createElement('span', vis.name);
    menuItem.child(iconSpan);
    menuItem.child(nameSpan);

    menuItem.addClass('menu-item');
    menuItem.id(vis.id);

    menuItem.mouseOver(function(e) {
      var el = select('#' + e.srcElement.id);
      el.addClass("hover");
    });

    menuItem.mouseOut(function(e) {
      var el = select('#' + e.srcElement.id);
      el.removeClass("hover");
    });

    menuItem.mouseClicked(function(e) {
      var menuItems = selectAll('.menu-item');
      for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].removeClass('selected');
      }
      var el = select('#' + e.srcElement.id);
      el.addClass('selected');
      self.selectVisual(e.srcElement.id);
    });

    var visMenu = select('#visuals-menu');
    visMenu.child(menuItem);

    if (vis.hasOwnProperty('preload')) {
      vis.preload();
    }
  };

  this.findVisIndex = function(visId) {
    for (var i = 0; i < this.visuals.length; i++) {
      if (this.visuals[i].id == visId) {
        return i;
      }
    }
    return null;
  };

  this.selectVisual = function(visId) {
    var visIndex = this.findVisIndex(visId);

    if (visIndex != null) {
        // If a visualization is already selected, call its destroy method
        if (this.selectedVisual != null && this.selectedVisual.hasOwnProperty('destroy')) {
            this.selectedVisual.destroy();
        }

        // Switch to the new visualization
        this.selectedVisual = this.visuals[visIndex];

        // Setup the new visualization
        if (this.selectedVisual.hasOwnProperty('setup')) {
            this.selectedVisual.setup();
        }

        // Refresh the control panel
        this.updateControlPanel();

        // Make the control panel visible
        var controlPanel = select('#control-panel');
        controlPanel.addClass('visible');

        loop();
    }
};

  this.updateControlPanel = function() {
    var controlPanel = select('#control-panel');
    controlPanel.html(''); // Clear existing controls

    if (this.selectedVisual && this.selectedVisual.hasOwnProperty('getControls')) {
      var controls = this.selectedVisual.getControls();
      controls.forEach(function(control) {
        control.addClass('control-item');
        controlPanel.child(control);
      });
    }
  };
}
