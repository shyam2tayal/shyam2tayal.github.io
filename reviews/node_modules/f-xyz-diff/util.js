var colors = require('colors');
var diff = require('./index');

var DIFF_NOT_MODIFIED = diff.NOT_MODIFIED;
var DIFF_CREATED = diff.CREATED;
var DIFF_MOVED = diff.MOVED;
var DIFF_DELETED = diff.DELETED;

function logDiff(list) {
    console.log('# log');
    list.forEach(function (x) {
        if (x.state === 2) {
            console.log(
                ' %s\t%s -> %s'.bold,
                colorByState(x.item, x.state),
                String(x.oldIndex).blue,
                String(x.newIndex).blue
            );
        } else {
            console.log(
                ' %s'.bold,
                colorByState(x.item, x.state)
            );
        }
    });
}

function colorByState(x, state) {
    if (state === DIFF_CREATED) {
        return colors.green(x);
    } else if (state === DIFF_MOVED) {
        return colors.blue(x);
    } else if (state === DIFF_DELETED) {
        return colors.red(x);
    } else {
        return x;
    }
}

module.exports = {
    logDiff: logDiff,
    colorByState: colorByState
};