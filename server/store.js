const _ = require('lodash');

const store = {
  io: {},
  slidePath: '',
  slideUrlPrefix: 'slides/',
  port: 3000,
  files: [],
  oldFiles: [],
  diffFiles: [],
  currentlyShownImageName: 0,
  timerMs: 30 * 1000,
};

module.exports.get = path => _.get(store, path, '');
module.exports.getAll = () => store;
module.exports.set = (path, value) => _.set(store, path, value);
