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
