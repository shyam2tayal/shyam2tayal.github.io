(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var DIFF_NOT_MODIFIED = 0;
var DIFF_CREATED = 1;
var DIFF_MOVED = 2;
var DIFF_DELETED = -1;

var lastUniqueId = 0;

/**
 * Returns auto incremental unique ID as integer.
 * @returns {number} integers starting from 0
 */
function getUniqueId() {
    return lastUniqueId++;
}

/**
 * Returns x if it is not undefined, y otherwise.
 * @param x
 * @param y
 * @returns {*}
 */
function maybe(x, y) {
    if (x !== undefined) return x;
    return y;
}

/**
 * @param {Array} list
 * @param {string} primaryKey
 * @returns {{}}
 */
function buildHashToIndexMap(list, primaryKey) {
    var map = {};
    for (var i = 0; i < list.length; ++i) {
        var item = list[i];
        map[item[primaryKey]] = i;
    }
    return map;
}

/**
 * Calculates difference between two arrays.
 * Returns array of { item: T, state: int }.
 * Where state means: 0 - not modified, 1 - created, -1 - deleted.
 * @param {Array} newList
 * @param {Array} oldList
 * @param {string} primaryKey item's unique index field name
 */
function diff(newList, oldList, primaryKey) {
    var diff = [];
    var newIndex = 0;
    var oldIndex = 0;

    var newIndexMap = buildHashToIndexMap(newList, primaryKey);
    var oldIndexMap = buildHashToIndexMap(oldList, primaryKey);

    function addEntry(item, state, newIndex, prevIndex) {
        diff.push({
            item: item,
            state: state,
            oldIndex: prevIndex,
            newIndex: newIndex
        });
    }

    for (; newIndex < newList.length || oldIndex < oldList.length;) {
        var newItem = newList[newIndex];
        var oldItem = oldList[oldIndex];

        if (newIndex >= newList.length) {

            addEntry(oldItem, DIFF_DELETED, -1, oldIndex);
            ++oldIndex;

        } else if (oldIndex >= oldList.length) {

            addEntry(newItem, DIFF_CREATED, newIndex, -1);
            ++newIndex;

        } else if (newItem !== oldItem) {

            var indexOfNewItemInOldList =
                maybe(oldIndexMap[newItem[primaryKey]], -1);

            var indexOfOldItemInNewList =
                maybe(newIndexMap[oldItem[primaryKey]], -1);

            var isCreated = indexOfNewItemInOldList === -1;
            var isDeleted = indexOfOldItemInNewList === -1;

            // created
            if (isCreated) {
                addEntry(newItem, DIFF_CREATED, newIndex, -1);
                ++newIndex;
            }

            // moved
            if (!isCreated && !isDeleted) {
                addEntry(newItem, DIFF_MOVED, newIndex, indexOfOldItemInNewList);
                ++newIndex;
                ++oldIndex;
            }

            // deleted
            if (isDeleted) {
                addEntry(oldItem, DIFF_DELETED, -1, oldIndex);
                ++oldIndex;
            }

        } else {
            addEntry(oldItem, DIFF_NOT_MODIFIED, newIndex, oldIndex);
            ++newIndex;
            ++oldIndex;
        }
    }

    return diff;
}

// exports ////////////////////////////////////////////////////////////////

diff.NOT_MODIFIED = DIFF_NOT_MODIFIED;
diff.CREATED = DIFF_CREATED;
diff.MOVED = DIFF_MOVED;
diff.DELETED = DIFF_DELETED;
diff.getUniqueId = getUniqueId;
diff.buildHashToIndexMap = buildHashToIndexMap;

module.exports = diff;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBESUZGX05PVF9NT0RJRklFRCA9IDA7XG52YXIgRElGRl9DUkVBVEVEID0gMTtcbnZhciBESUZGX01PVkVEID0gMjtcbnZhciBESUZGX0RFTEVURUQgPSAtMTtcblxudmFyIGxhc3RVbmlxdWVJZCA9IDA7XG5cbi8qKlxuICogUmV0dXJucyBhdXRvIGluY3JlbWVudGFsIHVuaXF1ZSBJRCBhcyBpbnRlZ2VyLlxuICogQHJldHVybnMge251bWJlcn0gaW50ZWdlcnMgc3RhcnRpbmcgZnJvbSAwXG4gKi9cbmZ1bmN0aW9uIGdldFVuaXF1ZUlkKCkge1xuICAgIHJldHVybiBsYXN0VW5pcXVlSWQrKztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHggaWYgaXQgaXMgbm90IHVuZGVmaW5lZCwgeSBvdGhlcndpc2UuXG4gKiBAcGFyYW0geFxuICogQHBhcmFtIHlcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBtYXliZSh4LCB5KSB7XG4gICAgaWYgKHggIT09IHVuZGVmaW5lZCkgcmV0dXJuIHg7XG4gICAgcmV0dXJuIHk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtBcnJheX0gbGlzdFxuICogQHBhcmFtIHtzdHJpbmd9IHByaW1hcnlLZXlcbiAqIEByZXR1cm5zIHt7fX1cbiAqL1xuZnVuY3Rpb24gYnVpbGRIYXNoVG9JbmRleE1hcChsaXN0LCBwcmltYXJ5S2V5KSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgIG1hcFtpdGVtW3ByaW1hcnlLZXldXSA9IGk7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIGFycmF5cy5cbiAqIFJldHVybnMgYXJyYXkgb2YgeyBpdGVtOiBULCBzdGF0ZTogaW50IH0uXG4gKiBXaGVyZSBzdGF0ZSBtZWFuczogMCAtIG5vdCBtb2RpZmllZCwgMSAtIGNyZWF0ZWQsIC0xIC0gZGVsZXRlZC5cbiAqIEBwYXJhbSB7QXJyYXl9IG5ld0xpc3RcbiAqIEBwYXJhbSB7QXJyYXl9IG9sZExpc3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmltYXJ5S2V5IGl0ZW0ncyB1bmlxdWUgaW5kZXggZmllbGQgbmFtZVxuICovXG5mdW5jdGlvbiBkaWZmKG5ld0xpc3QsIG9sZExpc3QsIHByaW1hcnlLZXkpIHtcbiAgICB2YXIgZGlmZiA9IFtdO1xuICAgIHZhciBuZXdJbmRleCA9IDA7XG4gICAgdmFyIG9sZEluZGV4ID0gMDtcblxuICAgIHZhciBuZXdJbmRleE1hcCA9IGJ1aWxkSGFzaFRvSW5kZXhNYXAobmV3TGlzdCwgcHJpbWFyeUtleSk7XG4gICAgdmFyIG9sZEluZGV4TWFwID0gYnVpbGRIYXNoVG9JbmRleE1hcChvbGRMaXN0LCBwcmltYXJ5S2V5KTtcblxuICAgIGZ1bmN0aW9uIGFkZEVudHJ5KGl0ZW0sIHN0YXRlLCBuZXdJbmRleCwgcHJldkluZGV4KSB7XG4gICAgICAgIGRpZmYucHVzaCh7XG4gICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgb2xkSW5kZXg6IHByZXZJbmRleCxcbiAgICAgICAgICAgIG5ld0luZGV4OiBuZXdJbmRleFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKDsgbmV3SW5kZXggPCBuZXdMaXN0Lmxlbmd0aCB8fCBvbGRJbmRleCA8IG9sZExpc3QubGVuZ3RoOykge1xuICAgICAgICB2YXIgbmV3SXRlbSA9IG5ld0xpc3RbbmV3SW5kZXhdO1xuICAgICAgICB2YXIgb2xkSXRlbSA9IG9sZExpc3Rbb2xkSW5kZXhdO1xuXG4gICAgICAgIGlmIChuZXdJbmRleCA+PSBuZXdMaXN0Lmxlbmd0aCkge1xuXG4gICAgICAgICAgICBhZGRFbnRyeShvbGRJdGVtLCBESUZGX0RFTEVURUQsIC0xLCBvbGRJbmRleCk7XG4gICAgICAgICAgICArK29sZEluZGV4O1xuXG4gICAgICAgIH0gZWxzZSBpZiAob2xkSW5kZXggPj0gb2xkTGlzdC5sZW5ndGgpIHtcblxuICAgICAgICAgICAgYWRkRW50cnkobmV3SXRlbSwgRElGRl9DUkVBVEVELCBuZXdJbmRleCwgLTEpO1xuICAgICAgICAgICAgKytuZXdJbmRleDtcblxuICAgICAgICB9IGVsc2UgaWYgKG5ld0l0ZW0gIT09IG9sZEl0ZW0pIHtcblxuICAgICAgICAgICAgdmFyIGluZGV4T2ZOZXdJdGVtSW5PbGRMaXN0ID1cbiAgICAgICAgICAgICAgICBtYXliZShvbGRJbmRleE1hcFtuZXdJdGVtW3ByaW1hcnlLZXldXSwgLTEpO1xuXG4gICAgICAgICAgICB2YXIgaW5kZXhPZk9sZEl0ZW1Jbk5ld0xpc3QgPVxuICAgICAgICAgICAgICAgIG1heWJlKG5ld0luZGV4TWFwW29sZEl0ZW1bcHJpbWFyeUtleV1dLCAtMSk7XG5cbiAgICAgICAgICAgIHZhciBpc0NyZWF0ZWQgPSBpbmRleE9mTmV3SXRlbUluT2xkTGlzdCA9PT0gLTE7XG4gICAgICAgICAgICB2YXIgaXNEZWxldGVkID0gaW5kZXhPZk9sZEl0ZW1Jbk5ld0xpc3QgPT09IC0xO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGVkXG4gICAgICAgICAgICBpZiAoaXNDcmVhdGVkKSB7XG4gICAgICAgICAgICAgICAgYWRkRW50cnkobmV3SXRlbSwgRElGRl9DUkVBVEVELCBuZXdJbmRleCwgLTEpO1xuICAgICAgICAgICAgICAgICsrbmV3SW5kZXg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1vdmVkXG4gICAgICAgICAgICBpZiAoIWlzQ3JlYXRlZCAmJiAhaXNEZWxldGVkKSB7XG4gICAgICAgICAgICAgICAgYWRkRW50cnkobmV3SXRlbSwgRElGRl9NT1ZFRCwgbmV3SW5kZXgsIGluZGV4T2ZPbGRJdGVtSW5OZXdMaXN0KTtcbiAgICAgICAgICAgICAgICArK25ld0luZGV4O1xuICAgICAgICAgICAgICAgICsrb2xkSW5kZXg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRlbGV0ZWRcbiAgICAgICAgICAgIGlmIChpc0RlbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICBhZGRFbnRyeShvbGRJdGVtLCBESUZGX0RFTEVURUQsIC0xLCBvbGRJbmRleCk7XG4gICAgICAgICAgICAgICAgKytvbGRJbmRleDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkRW50cnkob2xkSXRlbSwgRElGRl9OT1RfTU9ESUZJRUQsIG5ld0luZGV4LCBvbGRJbmRleCk7XG4gICAgICAgICAgICArK25ld0luZGV4O1xuICAgICAgICAgICAgKytvbGRJbmRleDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmO1xufVxuXG4vLyBleHBvcnRzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZGlmZi5OT1RfTU9ESUZJRUQgPSBESUZGX05PVF9NT0RJRklFRDtcbmRpZmYuQ1JFQVRFRCA9IERJRkZfQ1JFQVRFRDtcbmRpZmYuTU9WRUQgPSBESUZGX01PVkVEO1xuZGlmZi5ERUxFVEVEID0gRElGRl9ERUxFVEVEO1xuZGlmZi5nZXRVbmlxdWVJZCA9IGdldFVuaXF1ZUlkO1xuZGlmZi5idWlsZEhhc2hUb0luZGV4TWFwID0gYnVpbGRIYXNoVG9JbmRleE1hcDtcblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmO1xuIl19
