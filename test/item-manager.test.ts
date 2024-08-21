import { expect } from '@esm-bundle/chai';
import { ItemManager } from '../src/utils/item-manager';

interface ITestOption {
  Id: number;
  Name: string;
  Age: number;
}

describe('ItemManager', () => {
  const key = ['Id'];  
  const defaultOption = { Id: 1, Name: 'Tom Brady', Age: 40 };

  it('should clear items properly', () => {
    const manager = new ItemManager<ITestOption>(['Id']);
    manager.add(defaultOption);
    manager.clear();
    expect(manager.exists(defaultOption)).to.equal(false);
    expect(manager.count()).to.equal(0);
  });

  describe('using complex types', () => {
    describe('with key', () => {
      let manager: ItemManager<ITestOption>;

      beforeEach(() => {
        manager = new ItemManager<ITestOption>(key);
      });

      it('should have no items by default', () => {
        expect(manager.count()).to.equal(0);
      });

      it('should add single value', () => {      
        manager.add(defaultOption);
        expect(manager.count()).to.equal(1);
        expect(manager.getItems()[0]).to.equal(defaultOption);
      });

      it('should add multiple values', () => {
        const secondOption = { Id: 2, Name: 'Julian Edelman',  Age: 31 };
        manager.add(defaultOption);
        manager.add(secondOption);
        expect(manager.count()).to.equal(2);
        expect(manager.getItems()[0]).to.equal(defaultOption);
        expect(manager.getItems()[1]).to.equal(secondOption);
      });

      it('should not add duplicate values', () => {
        const secondOption = { Id: 1, Name: 'Julian Edelman',  Age: 31 };
        manager.add(defaultOption);
        manager.add(secondOption);
        expect(manager.count()).to.equal(1);
        expect(manager.getItems()[0]).to.equal(defaultOption);
      });

      it('should remove single value', () => {
        manager.add(defaultOption);
        manager.remove(defaultOption);
        expect(manager.count()).to.equal(0);
      });

      it('should remove multiple values', () => {
        const secondOption = { Id: 2, Name: 'Julian Edelman',  Age: 31 };
        manager.add(defaultOption);
        manager.add(secondOption);
        expect(manager.count()).to.equal(2);
        manager.remove(manager.getItems());
        expect(manager.count()).to.equal(0);
      });

      it('should remove matching value of different instance', () => {
        manager.add(defaultOption);
        manager.remove(JSON.parse(JSON.stringify(defaultOption)));
        expect(manager.count()).to.equal(0);
      });

      it('should allow changing key', () => {
        manager.setKey(['Age']);
        manager.add(defaultOption);
        expect(manager.count()).to.equal(1);
      });

      it('should recognize existing items after changing key', () => {
        manager.add(defaultOption);
        manager.setKey(['Age']);
        expect(manager.exists(defaultOption)).to.equal(true);
      });
    });

    describe('without key', () => {
      let manager: ItemManager<ITestOption>;

      beforeEach(() => {
        manager = new ItemManager<ITestOption>();
      });

      it('should allow duplicate objects of different reference but same structure', () => {
        manager.add(defaultOption);
        manager.add(JSON.parse(JSON.stringify(defaultOption)));
        expect(manager.count()).to.equal(2);
      });

      it('should do nothing if object is not in the items list when removing', () => {
        manager.add(defaultOption);
        manager.remove({ Id: 74, Name: 'Some Random Object', Age: 1 });
        expect(manager.count()).to.equal(1);
      });
    });
  });

  describe('using primitive types', () => {
    let manager: ItemManager<string>;

    beforeEach(() => {
      manager = new ItemManager<string>();
    });

    it('should add single primitive value', () => {
      manager.add('1');
      expect(manager.count()).to.equal(1);
      expect(manager.getItems()[0]).to.equal('1');
    });

    it('should add multiple primitive values', () => {
      manager.add(['1', '2']);
      expect(manager.count()).to.equal(2);
      expect(manager.getItems().indexOf('1') !== -1).to.equal(true);
      expect(manager.getItems().indexOf('2') !== -1).to.equal(true);
    });

    it('should not add duplicate primitive values', () => {
      manager.add(['1', '1']);
      expect(manager.count()).to.equal(1);
      expect(manager.getItems().indexOf('1') !== -1).to.equal(true);
    });

    it('should remove primitive value', () => {
      manager.add('1');
      manager.remove('1');
      expect(manager.count()).to.equal(0);
    });

    it('should have no side-effects if primitive value doesn\'t exist in items when removing', () => {
      manager.add('1');
      manager.remove('2');
      expect(manager.count()).to.equal(1);
    });
  });
});
