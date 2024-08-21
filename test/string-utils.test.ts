import { expect } from '@esm-bundle/chai';
import { dashify } from '../src/utils/string-utils';

describe('StringUtils', () => {
  describe('dashify', () => {
    it('should convert camelCase to dash seperators', () => {
      expect(dashify('camelCaseCamelCase')).to.equal('camel-case-camel-case');
    });

    it('should return original value', () => {
      expect(dashify(0 as any)).to.equal(0 as any);
      expect(dashify(undefined as any)).to.be.undefined;
    });
  });
});
