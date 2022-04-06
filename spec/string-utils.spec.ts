import * as StringUtils from '@tylertech/forge-core/utils/string-utils';

describe('StringUtils', () => {
  describe('dashify', () => {
    it('should convert camelCase to dash seperators', () => {
      expect(StringUtils.dashify('camelCaseCamelCase')).toBe('camel-case-camel-case');
    });

    it('should return original value', () => {
      expect(StringUtils.dashify(0 as any)).toBe(0 as any);
      expect(StringUtils.dashify(undefined as any)).toBeUndefined();
    });
  });
});
