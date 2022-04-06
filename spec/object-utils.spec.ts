import { removeElement } from '../src';
import { listenOwnProperty } from '@tylertech/forge-core';

describe('object-utils', () => {
  describe('listenOwnProperty', () => {
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
    });

    afterEach(() => {
      removeElement(inputElement);
    });

    it('should call listener when property changes', () => {
      const listener = jasmine.createSpy('callback');
      listenOwnProperty(this, inputElement, 'value', listener);
      inputElement.value = 'test';
      
      expect(inputElement.value).toBe('test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('test');
    });

    it('should not affect prototype', () => {
      const listener = jasmine.createSpy('callback');
      listenOwnProperty(this, inputElement, 'value', listener);
      const secondInput = document.createElement('input');
      inputElement.value = 'test';

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('test');
      expect(inputElement.value).toBe('test');
      expect(secondInput.value).toBe('');
    });

    it('should throw if property does not exist', () => {
      expect(() => listenOwnProperty(this, inputElement, 'asdf', () => {})).toThrow();
    });

    it('should throw if object is not extensible', () => {
      Object.preventExtensions(inputElement);
      expect(() => listenOwnProperty(this, inputElement, 'value', () => {})).toThrow();
    });
  });
});
