import { expect } from '@esm-bundle/chai';
import { spy } from 'sinon';
import { listenOwnProperty, deepValueExistsPredicate, deepSearchByValuePredicate } from '@tylertech/forge-core';

describe('object-utils', () => {
  describe('listenOwnProperty', () => {
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
    });

    afterEach(() => {
      inputElement.remove();
    });

    it('should call listener when property changes', () => {
      const listener = spy();
      listenOwnProperty(this, inputElement, 'value', listener);
      inputElement.value = 'test';

      expect(inputElement.value).to.equal('test');
      expect(listener.calledOnce).to.be.true;
      expect(listener.calledWith('test')).to.be.true;
    });

    it('should not affect prototype', () => {
      const listener = spy();
      listenOwnProperty(this, inputElement, 'value', listener);
      const secondInput = document.createElement('input');
      inputElement.value = 'test';

      expect(listener.calledOnce).to.be.true;
      expect(listener.calledWith('test')).to.be.true;
      expect(inputElement.value).to.equal('test');
      expect(secondInput.value).to.equal('');
    });

    it('should throw if property does not exist', () => {
      expect(() => listenOwnProperty(this, inputElement, 'asdf', () => { })).to.throw();
    });

    it('should throw if object is not extensible', () => {
      Object.preventExtensions(inputElement);
      expect(() => listenOwnProperty(this, inputElement, 'value', () => { })).to.throw();
    });
  });

  describe('deepSearchByValuePredicate:', () => {

    it('should return true if any of the keys matching limitProps have a value that includes the search value', () => {
      let obj = {
        Prop1: 'fa81d2f4-b61c-47ec-857a-0636994079b1',
        Prop2: 'dejHyRLqyWKU1tZXZhycGx',
        Prop3: 'system',
        Prop4: 1682958673998,
        ParentProp: {
          ChildProp1: 'TX-2023-ABC-000006',
          ChildProp2: '1',
        },
      };
      let result = deepSearchByValuePredicate('fa81', obj, [
        'Prop3',
        'Prop1',
        'ChildProp1',
        'Prop4',
      ]);
      expect(result).to.be.true;
    });

    it('should return true if any of the children keys matching limitProps have a value that includes the search value', () => {
      let obj = {
        Prop1: 'dejHyRLqyWKU1tZXZhycGx',
        ParentProp: {
          ChildProp: 'TX-2023-ABC-000006',
        },
      };
      let result = deepSearchByValuePredicate('TX-2023', obj, ['ChildProp']);
      expect(result).to.be.true;
    });

    it('should return true if the search value is present in the top level', () => {
      const arr = {
        StringProp: 'targetValue',
        ObjectProp: {},
      };
      let result = deepSearchByValuePredicate('targetValue', arr, []);
      expect(result).to.be.true;
    });

    it('should return true if the search value is present in any child props', () => {
      const arr = {
        Prop1: '',
        ParentProp: {
          ChildProp: 'targetValue',
        },
      };
      let result = deepSearchByValuePredicate('targetValue', arr, []);
      expect(result).to.be.true;
    });

    it('should return true if the search value is in a string array', () => {
      const arr = {
        Prop1: ['targetValue'],
        ParentProp: {
          ChildProp: '',
        },
      };
      let result = deepSearchByValuePredicate('targetValue', arr, []);
      expect(result).to.be.true;
    });

    it('should return false if the search value is not present', () => {
      const arr = {
        Prop1: '',
        ParentProp: {
          ChildProp: '',
        },
      };
      let result = deepSearchByValuePredicate('targetValue', arr, []);
      expect(result).to.be.false;
    });

    it('should return true if the value is in the object on one of the fields in the limitProps array ', () => {
      const arr = {
        Prop1: 'targetValue',
        ParentProp: {
          ChildProp: '',
        },
      };
      let result = deepSearchByValuePredicate('targetValue', arr, ['Prop1']);
      expect(result).to.be.true;
    });

    it('should return false if the value is in the object but not on one of the fields in the limitProps array ', () => {
      const arr = {
        Prop1: '',
        Prop2: [''],
        Prop3: true,
        ParentProp: {
          ChildProp: 'targetValue',
        },
      };
      let result = deepSearchByValuePredicate('targetValue', arr, ['Prop1']);
      expect(result).to.be.false;
    });
  });

  describe('deepValueExistsPredicate:', () => {

    it('should return true if search value matches string property', () => {
      let target = 'targetValue';
      let result = deepValueExistsPredicate('targetValue', target);
      expect(result).to.be.true;
    });

    it('should return false if search value does not match string property', () => {
      let target = 'targetValue';
      let result = deepValueExistsPredicate('notTheTargetValue', target);
      expect(result).to.be.false;
    });

    it('should return true if search value matches value in string array property', () => {
      let target = ['targetValue'];
      let result = deepValueExistsPredicate('targetValue', target);
      expect(result).to.be.true;
    });

    it('should return false  if search value does not match value in string array property', () => {
      let target = ['targetValue'];
      let result = deepValueExistsPredicate('notTheTargetValue', target);
      expect(result).to.be.false;
    });

    it('should return true if search value matches number property', () => {
      let target = 1;
      let result = deepValueExistsPredicate('1', target);
      expect(result).to.be.true;
    });

    it('should return false if search value does not match number property', () => {
      let target = 1;
      let result = deepValueExistsPredicate('2', target);
      expect(result).to.be.false;
    });

    it('should return true if search value matches value in number array property', () => {
      let target = [1];
      let result = deepValueExistsPredicate('1', target);
      expect(result).to.be.true;
    });

    it('should return false  if search value does not match value in number array property', () => {
      let target = [1];
      let result = deepValueExistsPredicate('2', target);
      expect(result).to.be.false;
    });
  });
});
