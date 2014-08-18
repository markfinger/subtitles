var _ = require('lodash');
var fs = require('fs');

var arguments = process.argv.slice(2);

var fileName = arguments[0];

console.log('Processing: ' + fileName + '\n');

var character =     '                                     ';
var speech =        '                         ';
var openingText =   '                    ';
var description =   '               ';

fs.readFile(fileName, 'ascii', function (err, data) {
  if (err) throw err;

  // Process and categorise each line of text
  var lines = _.map(data.split('\n'), function(line) {
    var text = line;
    while(text[0] === ' ') {
      text = text.slice(1);
    }

    var obj = {
      text: text
    };

    if (line.slice(0, character.length) === character) {
      obj.type = 'character';
    } else if (line.slice(0, speech.length) === speech) {
      obj.type = 'speech';
    } else if (line.slice(0, openingText.length) === openingText) {
      obj.type = 'opening-text';
    } else if (line.slice(0, description.length) === description) {
      var firstThreeChars = line.slice(description.length, description.length + 3);
      if (firstThreeChars === 'EXT' || firstThreeChars === 'INT') {
        obj.type = 'scene-change';
      } else {
        obj.type = 'description';
      }
    } else if (line === '') {
      obj.type = 'empty';
    } else {
      obj.type = 'unknown';
    }

    return obj;
  });

  var compressedLines = [lines[0]];
  var current;
  var previous;
  for (var i=1; i<lines.length; i++) {
    current = lines[i];
    previous = _.last(compressedLines);
    if (current.type !== 'empty') {
      if (previous.type === current.type) {
          previous.text += ' ' + current.text;
      } else {
        compressedLines.push(current);
      }
    }
  }

  console.log('Total lines: ' + lines.length);
  console.log('Total summed lines: ' + compressedLines.length);
  console.log('Character lines: ' + _.where(compressedLines, { type:'character' }).length);
  console.log('Speech lines: ' + _.where(compressedLines, { type:'speech' }).length);
  console.log('Opening text: ' + _.where(compressedLines, { type:'opening-text' }).length);
  console.log('Scene changes: ' + _.where(compressedLines, { type:'scene-change' }).length);
  console.log('Description: ' + _.where(compressedLines, { type:'description' }).length);
  console.log('Empty: ' + _.where(compressedLines, { type:'empty' }).length);
  console.log('Unknown: ' + _.where(compressedLines, { type:'unknown' }).length);
  console.log();

  fs.writeFile(fileName + '.json', JSON.stringify(compressedLines, null, 2));
});
