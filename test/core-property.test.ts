import { expect } from '@esm-bundle/chai';
import { spy } from 'sinon';
import { coreProperty } from '../src';

const BEFORE_CORE_SET = 'before-core-set';

const corePropertyNotFoundMessage = (className: string, propertyName: string) => `${className}\'s core does not contain the property \"${propertyName}\"`;
const coreNotFoundMessage = (className: string) => `${className} does not have a core`;

interface ICore {
  index?: number;
}

class Core implements ICore {
  private _index = 1;
  private _customSet: any;
  private _correct: number = 0;
  private _onlyGetCore = 0;

  public get index() {
    return this._index;
  }
  public set index(value: number) {
    this._index = value;
  }

  public set customSet(value: any) {
    this._customSet = value;
  }
  public get customSet() {
    return this._customSet;
  }

  public get correct() {
    return this._correct;
  }
  public set correct(value: number) {
    this._correct = value;
  }

  public get onlyGetCore() {
    return this._onlyGetCore;
  }
}

class TestComponent {
  public localName = 'Test';

  constructor(private _core: ICore) {}

  @coreProperty()
  public index: number;

  @coreProperty({ name: 'dude wheres my car' })
  public incorrectCore: number;

  @coreProperty({ name: 'correct' })
  public correctCore: number;

  @coreProperty({ get: false, set: false })
  public noCoreProxy: number;

  @coreProperty({ set: false })
  public onlyGetCore: number;

  @coreProperty()
  public set customSet(value: any) {
    document.dispatchEvent(new CustomEvent(BEFORE_CORE_SET, { detail: value }));
  }
}

class TestComponentNoCore {
  public localName = 'Test';

  constructor() {}

  @coreProperty()
  public index: number;
}

class CoreNoIndex implements ICore {}

describe('corePropertyDecorator', () => {
  it('should return the core property if defined', () => {
    const instance = new TestComponent(new Core());
    const index = instance.index;
    expect(index).to.equal(1, 'the property did not use the core');
  });

  it('should set the core property if defined', () => {
    const instance = new TestComponent(new Core());
    instance.index = 0;
    const index = instance.index;
    expect(index).to.equal(0, 'the property did not use the core');
  });

  it('should throw error if core property is not defined', () => {
    const instance = new TestComponent(new CoreNoIndex());
    const action = () => {
      const index = instance.index;
    };
    expect(action).to.throw(corePropertyNotFoundMessage(instance.localName, 'index'));
  });

  it('should perform event emit before setting core through decorator', () => {
    const cb = spy();
    document.addEventListener(BEFORE_CORE_SET, cb, { once: true });
    const customSet = 'Custom Set';
    const instance = new TestComponent(new Core());
    instance.customSet = customSet;

    expect(cb.called).to.be.true;
    expect(instance.customSet).to.equal(customSet);
  });

  it('should throw error when get if component does not have a core', () => {
    const inst = new TestComponentNoCore();

    const action = () => {
      const index = inst.index;
    };

    expect(action).to.throw(coreNotFoundMessage(inst.localName));
  });

  it('should throw error when set if component does not have a core', () => {
    const inst = new TestComponentNoCore();

    const action = () => {
      inst.index = 3;
    };

    expect(action).to.throw(`${inst.localName} does not have a core`);
  });

  it('should throw error when entering the incorrect core custom name', () => {
    const instance = new TestComponent(new Core());
    const action = () => {
      const index = instance.incorrectCore;
    };

    expect(action).to.throw();
  });

  it('should set core with custom property', () => {
    const instance = new TestComponent(new Core());
    const action = () => {
      const index = instance.correctCore;
      instance.correctCore += 1;
    };

    expect(action).not.to.throw();
    expect(instance.correctCore).to.equal(1);
    expect(instance['_core']['correct']).to.equal(1);
    expect(instance['_core']['_correct']).to.equal(1);
  });

  it('should allow not proxying the core set', () => {
    const instance = new TestComponent(new Core());
    instance.noCoreProxy = 5;
    const num = instance.noCoreProxy;
    expect(num).to.equal(5);
    expect(instance['_core']['noCoreProxy']).to.be.undefined;
  });

  it('should allow not proxying the core set', () => {
    const instance = new TestComponent(new Core());
    const num = instance.onlyGetCore;
    expect(num).to.equal(0);
    const action = () => {
      instance.onlyGetCore = 3;
    };

    expect(instance['_core']['_onlyGetCore']).to.equal(0);
    expect(instance.onlyGetCore).to.equal(0);
    expect(action).to.throw();
  });

  it('should only call the wire function once', () => {
    const instance = new TestComponent(new Core());
    instance.customSet = 1;
    instance.customSet = 2;
    instance.customSet = 3;
    instance.customSet = 4;
    instance.customSet = 5;

    expect(instance.customSet).to.equal(5);
  });
});
