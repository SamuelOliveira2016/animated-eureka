var LookTrigger = pc.createScript('lookTrigger');

// Initialize code called once per entity
LookTrigger.prototype.initialize = function() {
    this.ray = new pc.Vec3();
    this.hitEntity = null;
    this.thresholdDistance = 5; // Set the threshold distance here

    // Listen for update event
    this.app.on('update', this.updateLookTrigger, this);

    // Create a text element to display the detected object's name
    this.createTextElement();

    // Create a crosshair element in the center of the screen
    this.createCrosshair();
};

// Update the look trigger
LookTrigger.prototype.updateLookTrigger = function(dt) {
    // Get the camera entity
    var cameraEntity = this.entity.findByName('Camera');
    if (!cameraEntity) {
        console.error('Camera entity not found');
        return;
    }

    // Get the forward direction of the camera
    var forward = cameraEntity.forward.clone();

    // Set the ray from the camera position in the forward direction
    this.ray.copy(cameraEntity.getPosition()).add(forward.scale(this.thresholdDistance)); // Use thresholdDistance

    // Perform the raycast
    var result = this.app.systems.rigidbody.raycastFirst(cameraEntity.getPosition(), this.ray);
    if (result) {
        this.hitEntity = result.entity;

        // Trigger an event or display information about the detected object
        this.displayObjectName(this.hitEntity.name);
    } else {
        this.hitEntity = null;
        this.displayObjectName('');
    }
};

// Create a text element to display the detected object's name
LookTrigger.prototype.createTextElement = function() {
    this.textElement = document.createElement('div');
    this.textElement.style.position = 'absolute';
    this.textElement.style.bottom = '50px';
    this.textElement.style.left = '10px';
    this.textElement.style.zIndex = '1000';
    this.textElement.style.padding = '5px';
    this.textElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.textElement.style.color = '#fff';
    this.textElement.style.borderRadius = '5px';
    this.textElement.style.display = 'none'; // Initially hidden
    document.body.appendChild(this.textElement);
};

// Display the object's name
LookTrigger.prototype.displayObjectName = function(name) {
    if (name) {
        this.textElement.innerText = 'Você está olhando para: ' + name;
        this.textElement.style.display = 'block';
    } else {
        this.textElement.style.display = 'none';
    }
};

// Create a crosshair element in the center of the screen
LookTrigger.prototype.createCrosshair = function() {
    this.crosshair = document.createElement('div');
    this.crosshair.style.position = 'absolute';
    this.crosshair.style.top = '50%';
    this.crosshair.style.left = '50%';
    this.crosshair.style.transform = 'translate(-50%, -50%)';
    this.crosshair.style.width = '5px'; // Smaller width for a crosshair
    this.crosshair.style.height = '5px'; // Smaller height for a crosshair
    this.crosshair.style.border = '2px solid #fff'; // Thicker border for visibility
    this.crosshair.style.borderRadius = '50%'; // Make it circular
    this.crosshair.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    this.crosshair.style.zIndex = '1000';
    document.body.appendChild(this.crosshair);
};
