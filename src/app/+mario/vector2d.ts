export class Vector2d {

  static ZERO_VECTOR = new Vector2d(0, 0);

  constructor(private _x: number, private _y: number) {
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  add(vec: Vector2d) {
    return new Vector2d(vec.x + this.x, vec.y + this.y);
  }

  mul(multiplicant: number) {
    return new Vector2d(this.x * multiplicant, this.y * multiplicant);
  }
}
