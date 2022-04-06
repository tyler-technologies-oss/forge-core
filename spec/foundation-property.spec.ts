import { FoundationProperty } from '@tylertech/forge-core';

const BEFORE_FOUNDATION_SET = 'before-foundation-set';

const foundationPropertyNotFoundMessage = (className: string, propertyName: string) => `${className}\'s foundation does not contain the property \"${propertyName}\"`;
const foundationNotFoundMessage = (className: string) => `${className} does not have a foundation`;

interface IFoundation {
  index?: number;
}

class Foundation implements IFoundation {
  private _index = 1;
  private _customSet: any;
  private _correct: number = 0;
  private _onlyGetFoundation = 0;

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

  public get onlyGetFoundation() {
    return this._onlyGetFoundation;
  }
}

class TestComponent {
  public localName = 'Test';

  constructor(private _foundation: IFoundation) {}

  @FoundationProperty()
  public index: number;

  @FoundationProperty({ name: 'dude wheres my car' })
  public incorrectFoundation: number;

  @FoundationProperty({ name: 'correct' })
  public correctFoundation: number;

  @FoundationProperty({ get: false, set: false })
  public noFoundationProxy: number;

  @FoundationProperty({ set: false })
  public onlyGetFoundation: number;

  @FoundationProperty()
  public set customSet(value: any) {
    document.dispatchEvent(new CustomEvent(BEFORE_FOUNDATION_SET, { detail: value }));
  }
}

class TestComponentNoFoundation {
  public localName = 'Test';

  constructor() {}

  @FoundationProperty()
  public index: number;
}

class FoundationNoIndex implements IFoundation {}

describe('FoundationPropertyDecorator', () => {
  let instance: TestComponent;

  beforeEach(() => {
    instance = new TestComponent(new Foundation());
  });

  it('should return the foundation property if defined', () => {
    const index = instance.index;
    expect(index).toBe(1, 'the property did not use the foundation');
  });

  it('should set the foundation property if defined', () => {
    instance.index = 0;
    const index = instance.index;
    expect(index).toBe(0, 'the property did not use the foundation');
  });

  it('should throw error if foundation property is not defined', () => {
    instance = new TestComponent(new FoundationNoIndex());
    const action = () => {
      const index = instance.index;
    };
    expect(action).toThrowError(foundationPropertyNotFoundMessage(instance.localName, 'index'));
  });

  it('should perform event emit before setting foundation through decorator', () => {
    const spy = jasmine.createSpy('Custom Set');
    document.addEventListener(BEFORE_FOUNDATION_SET, spy, { once: true });
    const customSet = 'Custom Set';
    instance.customSet = customSet;

    expect(spy).toHaveBeenCalled();
    expect(instance.customSet).toBe(customSet);
  });

  it('should throw error when get if component does not have a foundation', () => {
    const inst = new TestComponentNoFoundation();

    const action = () => {
      const index = inst.index;
    };

    expect(action).toThrowError(foundationNotFoundMessage(inst.localName));
  });

  it('should throw error when set if component does not have a foundation', () => {
    const inst = new TestComponentNoFoundation();

    const action = () => {
      inst.index = 3;
    };

    expect(action).toThrowError(`${inst.localName} does not have a foundation`);
  });

  it('should throw error when entering the incorrect foundation custom name', () => {
    const action = () => {
      const index = instance.incorrectFoundation;
    };

    expect(action).toThrow();
  });

  it('should set foundation with custom property', () => {
    const action = () => {
      const index = instance.correctFoundation;
      instance.correctFoundation += 1;
    };

    expect(action).not.toThrow();
    expect(instance.correctFoundation).toBe(1);
    expect(instance['_foundation']['correct']).toBe(1);
    expect(instance['_foundation']['_correct']).toBe(1);
  });

  it('should allow not proxying the foundation set', () => {
    instance.noFoundationProxy = 5;
    const num = instance.noFoundationProxy;
    expect(num).toBe(5);
    expect(instance['_foundation']['noFoundationProxy']).toBeUndefined();
  });

  it('should allow not proxying the foundation set', () => {
    const num = instance.onlyGetFoundation;
    expect(num).toBe(0);
    const action = () => {
      instance.onlyGetFoundation = 3;
    };

    expect(instance['_foundation']['_onlyGetFoundation']).toBe(0);
    expect(instance.onlyGetFoundation).toBe(0);
    expect(action).toThrow();
  });

  it('should only call the wire function once', () => {
    instance.customSet = 1;
    instance.customSet = 2;
    instance.customSet = 3;
    instance.customSet = 4;
    instance.customSet = 5;

    expect(instance.customSet).toBe(5);
  });
});
