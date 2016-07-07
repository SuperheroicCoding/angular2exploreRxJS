/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { BackpressureComponent } from './backpressure.component';

describe('Component: Backpressure', () => {
  it('should create an instance', () => {
    let component = new BackpressureComponent();
    expect(component).toBeTruthy();
  });
});
