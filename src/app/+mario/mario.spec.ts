/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import {Mario} from './mario';

describe('Mario', () => {
  it('should create an instance', () => {
    expect(new Mario(0, 0, 0, 0, 0, 0, 'right')).toBeTruthy();
  });
});
