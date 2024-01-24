import * as THREE from "three";

export class Character {
  // Character Constructor
  constructor(mColor) {
    // Create our cone geometry and material
    let coneGeo = new THREE.ConeGeometry(0.5, 1, 10);
    let coneMat = new THREE.MeshStandardMaterial({ color: mColor });

    // Create the local cone mesh (of type Object3D)
    let mesh = new THREE.Mesh(coneGeo, coneMat);
    // Increment the y position so our cone is just atop the y origin
    mesh.position.y = mesh.position.y + 0.5;
    // Rotate our X value of the mesh so it is facing the +z axis
    mesh.rotateX(Math.PI / 2);

    // Add our mesh to a Group to serve as the game object
    this.gameObject = new THREE.Group();
    this.gameObject.add(mesh);

    let range = 5;
    let loca = 25;

    // Initialize movement variables

    this.location = new THREE.Vector3(
      2 * loca * Math.random() - loca,
      2 * loca * Math.random() - loca,
      2 * loca * Math.random() - loca
    );
    this.velocity = new THREE.Vector3(
      2 * loca * Math.random() - loca,
      2 * loca * Math.random() - loca,
      2 * loca * Math.random() - loca
    );
    this.acceleration = new THREE.Vector3(0, 0, 0);

    this.topSpeed = 6;
    this.mass = 1;
    this.maxForce = 4;
    this.perception = 2;
  }

  // update character
  update(deltaTime, boids) {
    // update velocity via acceleration
    this.velocity.addScaledVector(this.acceleration, deltaTime);
    if (this.velocity.length() > this.topSpeed) {
      this.velocity.setLength(this.topSpeed);
    }

    // update location via velocity
    this.location.addScaledVector(this.velocity, deltaTime);

    // rotate the character to ensure they face
    // the direction of movement
    let angle = Math.atan2(this.velocity.x, this.velocity.z);
    this.gameObject.rotation.y = angle;

    // check we are within the bounds of the world
    this.checkEdges();

    // set the game object position
    this.gameObject.position.set(this.location.x, 0, this.location.z);

    this.acceleration.multiplyScalar(0);

    this.velocity.setLength(this.topSpeed);
  }

  // check we are within the bounds of the world
  checkEdges() {
    if (this.location.x < -25) {
      this.location.x = 25;
    }
    if (this.location.z < -25) {
      this.location.z = 25;
    }
    if (this.location.x > 25) {
      this.location.x = -25;
    }
    if (this.location.z > 25) {
      this.location.z = -25;
    }
  }

  // Apply force to our character
  applyForce(force) {
    // here, we are saying force = force/mass
    force.divideScalar(this.mass);
    // this is acceleration + force/mass
    this.acceleration.add(force);
  }

  align(boids) {
    let total = 0;
    let avg = new THREE.Vector3();
    let dis = new THREE.Vector2(this.location.x, this.location.z);
    let otherDis = new THREE.Vector2();
    for (let i = 0; i < boids.length; i++) {
      let d = dis.distanceTo(
        otherDis.set(boids[i].location.x, boids[i].location.z)
      );

      if (d < this.perception && boids[i] != this) {
        avg.add(boids[i].velocity);
        total++;
      }
    }
    if (total > 0) {
      avg.divideScalar(total);
      avg.sub(this.velocity);
    }
    this.velocity.setLength(this.topSpeed);
    avg.setLength(this.maxForce);
    this.applyForce(avg);
  }

  cohesion(boids) {
    let total = 0;
    let avg = new THREE.Vector3();
    let dis = new THREE.Vector2(this.location.x, this.location.z);
    let otherDis = new THREE.Vector2();
    for (let i = 0; i < boids.length; i++) {
      let d = dis.distanceTo(
        otherDis.set(boids[i].location.x, boids[i].location.z)
      );

      if (d < this.perception && boids[i] != this) {
        avg.add(boids[i].location);
        total++;
      }
    }
    if (total > 0) {
      avg.divideScalar(total);
      avg.sub(this.location);
    }
    avg.setLength(this.maxForce);
    this.velocity.setLength(this.topSpeed);
    this.applyForce(avg);
  }

  separation(boids) {
    let total = 0;
    let avg = new THREE.Vector3();
    let dis = new THREE.Vector2(this.location.x, this.location.z);
    let otherDis = new THREE.Vector2();
    for (let i = 0; i < boids.length; i++) {
      let d = dis.distanceTo(
        otherDis.set(boids[i].location.x, boids[i].location.z)
      );

      if (d < this.perception && boids[i] != this) {
        let diff = new THREE.Vector3();
        diff.subVectors(this.location, boids[i].location);
        diff.divideScalar(d * d * d * d);
        avg.add(diff);
        total++;
      }
    }
    if (total > 0) {
      avg.divideScalar(total);
    }
    avg.setLength(this.maxForce);
    this.velocity.setLength(this.topSpeed);
    this.applyForce(avg);
  }
}
