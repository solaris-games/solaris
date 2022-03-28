module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'padded-blocks': 'off',
    'camelcase': 'off',
    'space-infix-ops': 'off',
    'keyword-spacing': 'off',
    'no-multiple-empty-lines': 'off',
    'semi': 'off',
    'space-in-parens': 'off',
    'eqeqeq': 'off',
    'space-before-function-paren': 'off',
    'spaced-comment': 'off',
    'brace-style': 'off',
    'object-curly-spacing': 'off',
    'operator-linebreak': 'off',
    'block-spacing': 'off',
    'comma-dangle': 'off',
    'no-multi-spaces': 'off',
    'comma-spacing': 'off',
    'no-trailing-spaces': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
