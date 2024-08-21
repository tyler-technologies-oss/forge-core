import { expect } from '@esm-bundle/chai';
import * as Utils from '../src/utils/utils';

describe('Utils', () => {
  describe('randomChars', () => {
    it('should return default of 5 characters', () => {
      expect(Utils.randomChars().length).to.equal(5);
    });

    it('should return custom length string', () => {
      const len = 10;
      expect(Utils.randomChars(len).length).to.equal(len);
    });
  });

  describe('isDefined', () => {
    it('should return true when defined', () => {
      const test = true;
      expect(Utils.isDefined(test)).to.be.true;
    });

    it('should return false when undefined or null', () => {
      let test;
      expect(Utils.isDefined(test)).to.be.false;

      test = null;
      expect(Utils.isDefined(test)).to.be.false;
    });
  });

  describe('isString', () => {
    it('should return true when defined', () => {
      const test = '';
      expect(Utils.isString(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isString(test)).to.be.false;
    });

    it ('should return false for a non-string type', () => {
      const test = 0;
      expect(Utils.isString(test)).to.be.false;
    });
  });

  describe('isBoolean', () => {
    it('should return true when defined', () => {
      const test = false;
      expect(Utils.isBoolean(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isBoolean(test)).to.be.false;
    });

    it ('should return false for a non-boolean type', () => {
      const test = 0;
      expect(Utils.isBoolean(test)).to.be.false;
    });
  });

  describe('isNumber', () => {
    it('should return true when defined', () => {
      const test = 1;
      expect(Utils.isNumber(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isNumber(test)).to.be.false;
    });

    it ('should return false for a non-number type', () => {
      const test = '0';
      expect(Utils.isNumber(test)).to.be.false;
    });
  });

  describe('isDate', () => {
    it('should return true when defined', () => {
      const test = new Date();
      expect(Utils.isDate(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isDate(test)).to.be.false;
    });

    it ('should return false for a non-date type', () => {
      const test = 0;
      expect(Utils.isDate(test)).to.be.false;
    });
  });

  describe('isValidDate', () => {
    it('should return true for a valid date', () => {
      const test = new Date(Date.now());
      expect(Utils.isValidDate(test)).to.be.true;
    });

    it('should return false for an invalid date', () => {
      const test = new Date('invalid');
      expect(Utils.isValidDate(test)).to.be.false;
    });
  });

  describe('isFunction', () => {
    it('should return true when defined', () => {
      const test = () => {};
      expect(Utils.isFunction(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isFunction(test)).to.be.false;
    });

    it ('should return false for a non-function type', () => {
      const test = 0;
      expect(Utils.isFunction(test)).to.be.false;
    });
  });

  describe('isArray', () => {
    it('should return true when defined', () => {
      const test = [];
      expect(Utils.isArray(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isArray(test)).to.be.false;
    });

    it ('should return false for a non-array type', () => {
      const test = 0;
      expect(Utils.isArray(test)).to.be.false;
    });
  });

  describe('isObject', () => {
    it('should return true when defined', () => {
      const test = {};
      expect(Utils.isObject(test)).to.be.true;
    });

    it('should return false when undefined', () => {
      const test = undefined;
      expect(Utils.isObject(test)).to.be.false;
    });

    it ('should return false for a primitive type', () => {
      const test = 0;
      expect(Utils.isObject(test)).to.be.false;
    });
  });

  describe('coerceBoolean', () => {
    it('should return true for "true"', () => {
      expect(Utils.coerceBoolean('true')).to.be.true;
    });

    it('should return false for "false"', () => {
      expect(Utils.coerceBoolean('false')).to.be.false;
    });

    it('should return true for any string !== false', () => {
      expect(Utils.coerceBoolean('')).to.be.true;
    });
  });

  describe('coerceNumber', () => {
    it('should return 987 for "987"', () => {
      expect(Utils.coerceNumber('987')).to.equal(987);
    });

    it('should return NaN for non-numeric string', () => {
      expect(Utils.coerceNumber('blah')).to.be.NaN;
    });
  });

  describe('nameof', () => {
    it('should return name of variable', () => {
      const simpleVar = true;
      const simpleVarObj = { simpleVar };
      expect(Utils.nameof(function() { return simpleVarObj.simpleVar; })).to.equal('simpleVar');
    });

    it('should return name of property with arrow function', () => {
      const obj = { simpleVar: true };
      expect(Utils.nameof(function() { return obj.simpleVar; })).to.equal('simpleVar');
    });

    it('should return name of method with arrow function', () => {
      function TestObj() {}
      TestObj.prototype.someMethod = () => {};
      const obj = new TestObj();
      expect(Utils.nameof(function() { return obj.someMethod; })).to.equal('someMethod');
    });

    it('should return name of property with function keyword', () => {
      const obj = { simpleVar: true };
      expect(Utils.nameof(function() { return obj.simpleVar; })).to.equal('simpleVar'); // tslint:disable-line
    });

    it('should return name of method with function keyword', () => {
      function TestObj() {}
      TestObj.prototype.someMethod = () => {};
      const obj = new TestObj();
      expect(Utils.nameof(function() { return obj.someMethod; })).to.equal('someMethod'); // tslint:disable-line
    });
  });
});
