/* tslint:disable:no-unused-variable */
import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import {Vector2d} from './vector2d';

describe('Vector2d', () => {
  it('should create an instance', () => {
    expect(new Vector2d(1, 2)).toBeTruthy();
  });

  it('should set x and y ', () => {
    let vector2d = new Vector2d(4, 2);
    expect(vector2d.x).toBe(4);
    expect(vector2d.y).toBe(2);
  });

  it('should not add to the original vector', () => {
    let vector2d = new Vector2d(4, 2);
    vector2d.add(new Vector2d(2, 3));
    expect(vector2d.x).toBe(4);
    expect(vector2d.y).toBe(2);
  });

  it('should add and return a new vector', () => {
    let vector2d = new Vector2d(4, 2);
    let result = vector2d.add(new Vector2d(2, 3));
    expect(result.x).toBe(6);
    expect(result.y).toBe(5);
  });

});
