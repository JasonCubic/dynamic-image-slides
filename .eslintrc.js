module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    'linebreak-style': 'off',
    'max-len': [ 'warn', { code: 175 } ],
  },
}
