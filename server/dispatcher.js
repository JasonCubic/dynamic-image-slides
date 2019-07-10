const _ = require('lodash');
const store = require('./store');

let timer;

function initTimer() {
  const timerSec = store.get('timerSec');
  // eslint-disable-next-line no-use-before-define
  timer = setTimeout(advance, timerSec * 1000);
}

function advance() {
  clearTimeout(timer);
  const io = store.get('io');
  const files = _.cloneDeep(store.get('files'));
  if (files.length === 0) {
    io.emit('new-slide-images', {}); // emit custom event to all connected sockets (broadcast)
    // TODO: handle when all slides are deleted
  }
  if (files.length === 1) {
    const currentlyShownImageName = store.get('currentlyShownImageName');
    if (files[0].filename === currentlyShownImageName) {
      console.log('only one image to show and it is currently being shown.  Not advancing.');
      initTimer();
      return;
    }
  }

  const currentlyShownImageName = store.get('currentlyShownImageName');
  const currentlyShownImageIndex = files.findIndex(row => row.filename === currentlyShownImageName);

  if (currentlyShownImageIndex !== -1) {
    files[currentlyShownImageIndex].lastShown = new Date().getTime();
  }

  // store.set('files', sortedFiles);


  const sortedFiles = _.cloneDeep(_.orderBy(files, ['lastShown', 'date', 'url'], ['asc', 'asc', 'asc']));
  io.emit('new-slide-images', sortedFiles[0]); // emit custom event to all connected sockets (broadcast)
  // sortedFiles[0].lastShown = new Date().getTime();
  store.set('currentlyShownImageName', sortedFiles[0].filename);
  store.set('files', sortedFiles);
  initTimer();
}

function getLastIndex(idx, len) {
  if (idx === 0) {
    return len - 1;
  }
  return idx - 1;
}

function getNextIndex(idx, len) {
  if (idx >= len - 1) {
    return 0;
  }
  return idx + 1;
}

function next() {
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
  const currentlyShownImageName = store.get('currentlyShownImageName');
  const currentlyShownImageIndex = files.findIndex(row => row.filename === currentlyShownImageName);
  files[currentlyShownImageIndex].lastShown = new Date().getTime();
  const nextIndex = getNextIndex(currentlyShownImageIndex, files.length);
  io.emit('new-slide-images', files[nextIndex]); // emit custom event to all connected sockets (broadcast)
  store.set('currentlyShownImageName', files[nextIndex].filename);
  store.set('files', files);
  initTimer();
}

function back() {
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
  const currentlyShownImageName = store.get('currentlyShownImageName');
  const currentlyShownImageIndex = files.findIndex(row => row.filename === currentlyShownImageName);
  files[currentlyShownImageIndex].lastShown = new Date().getTime();
  const lastIndex = getLastIndex(currentlyShownImageIndex, files.length);
  io.emit('new-slide-images', files[lastIndex]); // emit custom event to all connected sockets (broadcast)
  store.set('currentlyShownImageName', files[lastIndex].filename);
  store.set('files', files);
  initTimer();
}

module.exports.initTimer = initTimer;
module.exports.advance = advance;
module.exports.next = next;
module.exports.back = back;
