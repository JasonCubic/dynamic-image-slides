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
        lastShown: path.basename(file) === path.basename(changedFilename) ? -1 : 0,
        url: `${slideUrlPrefix}${encodeURIComponent(_.toLower(file))}`,
      };
    }
    return oldFiles[filesOldIndex];
  });
  console.log('newFiles: ', newFiles);
  // store.set('oldFiles', oldFiles);
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
  if (_.endsWith(filename, '.svg')) {
    return true;
  }
  return false;
}

// eslint-disable-next-line no-unused-vars
function updateFiles(eventType = '', filename = '') {
  console.log('eventType: ', eventType);
  console.log('filename: ', filename);
  debouncedReadDir(path.join(__dirname, '..', 'static', 'slides'), {}, (err, files) => {
    if (err) {
      console.log('debouncedReadDir ERROR: ', err);
      return;
    }
    const imageFiles = files.filter(file => isValidImage(file));
    const hotFiles = imageFiles.filter(file => _.startsWith(file, '!'));
    if (hotFiles.length > 0) {
      updateStore(hotFiles, filename);
      return;
    }
    const normalFiles = imageFiles.filter(file => !_.startsWith(file, '!') && !_.startsWith(file, '_'));
    if (normalFiles.length > 0) {
      updateStore(normalFiles, filename);
      return;
    }
    const defaultFiles = imageFiles.filter(file => _.startsWith(file, '_'));
    updateStore(defaultFiles, filename);
  });
}

module.exports = updateFiles;
