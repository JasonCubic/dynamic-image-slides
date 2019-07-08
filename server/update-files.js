const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const store = require('./store');
const dispatcher = require('./dispatcher');

const debouncedReadDir = _.debounce(fs.readdir, 250);

function updateStore(files, changedFilename) {
  files.sort();
  const now = new Date().getTime();
  const oldFiles = store.get('files');
  const slideUrlPrefix = store.get('slideUrlPrefix');
  const newFiles = files.map((file) => {
    const filesOldIndex = oldFiles.findIndex(row => row.filename === file);
    if (filesOldIndex === -1) {
      return {
        filename: file,
        date: now,
        lastShown: file === changedFilename ? -1 : 0,
        url: `${slideUrlPrefix}${encodeURIComponent(_.toLower(file))}`,
      };
    }
    return oldFiles[filesOldIndex];
  });
  store.set('oldFiles', oldFiles);
  store.set('files', newFiles);
  const currentlyShownImageName = store.get('currentlyShownImageName');
  const currentlyShownImageIndex = newFiles.findIndex(row => row.filename === currentlyShownImageName);
  const newlyChangedFilesWaitingToBeShown = newFiles.filter(row => row.lastShown === -1);
  const isCurrentImageValid = currentlyShownImageIndex !== -1;
  if (newlyChangedFilesWaitingToBeShown.length > 0 || !isCurrentImageValid) {
    dispatcher.advance();
  }
}

function isValidImage(rawFilename) {
  const filename = _.toLower(_.trim(rawFilename));
  if (_.endsWith(filename, '.jpg')) {
    return true;
  }
  if (_.endsWith(filename, '.gif')) {
    return true;
  }
  if (_.endsWith(filename, '.png')) {
    return true;
  }
  if (_.endsWith(filename, '.png')) {
    return true;
  }
  if (_.endsWith(filename, '.ico')) {
    return true;
  }
  if (_.endsWith(filename, '.bmp')) {
    return true;
  }
  if (_.endsWith(filename, '.webp')) {
    return true;
  }
  return false;
}

// eslint-disable-next-line no-unused-vars
function updateFiles(eventType = '', filename = '') {
  debouncedReadDir(path.join(__dirname, '..', 'static', 'slides'), {}, (err, files) => {
    if (err) {
      console.log('debouncedReadDir ERROR: ', err);
      return;
    }
    const imageFiles = files.filter(file => isValidImage(file));
    updateStore(imageFiles, filename);
  });
}

module.exports = updateFiles;
