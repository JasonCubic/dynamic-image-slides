const _ = require('lodash');
const store = require('./store');

let timer;

function initTimer() {
  const timerMs = store.get('timerMs');
  // eslint-disable-next-line no-use-before-define
  timer = setTimeout(advance, timerMs);
}

function advance() {
  clearTimeout(timer);
  const io = store.get('io');
  const files = store.get('files');
  if (files.length === 0) {
    io.emit('new-slide-images', {}); // emit custom event to all connected sockets (broadcast)
  }
  if (files.length === 1) {
    const currentlyShownImageName = store.get('currentlyShownImageName');
    if (files[0].filename === currentlyShownImageName) {
      console.log('only one image to show and it is currently being shown.  Not advancing.');
      initTimer();
      return;
    }
  }
  const sortedFiles = _.cloneDeep(_.orderBy(files, ['lastShown', 'date', 'url'], ['asc', 'asc', 'asc']));
  io.emit('new-slide-images', sortedFiles[0]); // emit custom event to all connected sockets (broadcast)
  sortedFiles[0].lastShown = new Date().getTime();
  store.set('currentlyShownImageName', sortedFiles[0].filename);
  store.set('files', sortedFiles);
  initTimer();
}

module.exports.initTimer = initTimer;
module.exports.advance = advance;
