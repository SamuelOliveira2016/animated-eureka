var CharacterController = pc.createScript('characterController');

CharacterController.attributes.add('speed', { type: 'number', default: 5 });
CharacterController.attributes.add('jumpImpulse', { type: 'number', default: 400 });

// initialize code called once per entity
CharacterController.prototype.initialize = function() {
    this.groundCheckRay = new pc.Vec3(0, -1.2, 0);
    this.rayEnd = new pc.Vec3();

    this.groundNormal = new pc.Vec3();
    this.onGround = true;
    this.jumping = false;
};

// character-controller.js
CharacterController.prototype.move = function (direction) {
    if (this.onGround && !this.jumping && this.app.root.findByName('FPV').script.firstPersonView.movementEnabled) {
        var tmp = new pc.Vec3();

        var length = direction.length();
        if (length > 0) {
            // calculate new forward vec parallel to the current ground surface
            tmp.cross(this.groundNormal, direction).cross(tmp, this.groundNormal);
            tmp.normalize().scale(length * this.speed);
        }
        this.entity.rigidbody.linearVelocity = tmp;
    }
};

CharacterController.prototype.jump = function () {
    if (this.onGround && !this.jumping) {
        this.entity.rigidbody.applyImpulse(0, this.jumpImpulse, 0);
        this.onGround = false;
        this.jumping = true;
        setTimeout(function () {
            this.jumping = false;
        }.bind(this), 500);
    }
};

// update code called every frame
CharacterController.prototype.update = function(dt) {
    var pos = this.entity.getPosition();
    this.rayEnd.add2(pos, this.groundCheckRay);

    // Fire a ray straight down to just below the bottom of the rigid body, 
    // if it hits something then the character is standing on something.
    var result = this.app.systems.rigidbody.raycastFirst(pos, this.rayEnd);
    this.onGround = !!result;
    if (result) {
        this.groundNormal.copy(result.normal);
    }
};

