import recessOrder from 'stylelint-config-recess-order';
import standard from 'stylelint-config-standard';
import stylelintOrder from 'stylelint-order';

export default {
  plugins: [stylelintOrder],
  extends: [standard, recessOrder],
  ignoreFiles: [
    'dist/**',
    'build/**',
    'coverage/**',
    'node_modules/**',
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
  ],
  rules: {
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    'block-no-empty': null,
    'no-empty-source': null,
  },
};
