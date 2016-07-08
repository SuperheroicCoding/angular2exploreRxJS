import {PhysicsObject} from './physicsObject';

export class Mario implements PhysicsObject {

  constructor(public x: number,
              public y: number,
              public vx: number,
              public vy: number,
              public ax: number,
              public ay: number,
              public dir: string) {
  }
}
