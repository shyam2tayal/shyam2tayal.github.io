(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ngRepeatFast = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (factory) {
    /* istanbul ignore next */
    if (typeof require == 'function') {
        var diff = require('f-xyz-diff');
        factory(module.exports, diff);
    } else {
        factory(window, window.diff);
    }
})(function (exports, diff) {
    'use strict';

    ///////////////////////////////////////////////////////////////////////////

    exports.ngRepeatFast = angular
        .module('ngRepeatFast', [])
        .directive('ngRepeatFast', [
            '$parse', '$compile',
            ngRepeatFastFactory
        ]);

    function ngRepeatFastFactory($parse, $compile) {
        return {
            scope: true,
            restrict: 'A',
            priority: 1000,
            terminal: true,
            link: function ($scope, $element, $attrs) {
                ngRepeatFastLink($scope, $element, $attrs, $parse, $compile);
            }
        };
    }

    ///////////////////////////////////////////////////////////////////////////

    function ngRepeatFastLink($scope, $element, $attrs, $parse, $compile) {

        // todo - animations support
        // todo - garbage collection for DOM nodes (?) timer-based?

        var HASH_KEY = '$$hashKey';

        if ('ngInclude' in $attrs) {
            throw Error('ngRepeatFast: ngInclude on repeating ' +
                        'element is not supported. ' +
                        'Please create nested element with ng-include.');
        }

        // parse ng-repeat expression /////////////////////////////////////////

        var rx = /^\s*(\w+)\sin\s(.+?)(\strack by\s(.+?))?$/;
        var match = $attrs.ngRepeatFast.match(rx);
        if (!match) {
            throw Error('ngRepeatFast: expected ngRepeatFast in form of ' +
                        '`{item} in {array} [| filter, etc]` [track by \'{field}\'] ' +
                        'but got `' + $attrs.ngRepeatFast + '`');
        }

        var iteratorName = match[1];
        var expression = match[2];
        var trackBy = match[4] || HASH_KEY;
        var model = getModel();
        if (!Array.isArray(model)) {
            throw Error('ngRepeatFast: expected model `' + $attrs.ngRepeatFast + '` ' +
                        'to be an array but got: ' + model);
        }

        // build DOM //////////////////////////////////////////////////////////

        var itemHashToNodeMap = {};

        var elementNode = $element[0];
        var elementParentNode = elementNode.parentNode;
        var elementNodeIndex = getNodeIndex(elementNode, true);
        var templateNode = elementNode.cloneNode(true);
        templateNode.removeAttribute('ng-repeat-fast');

        var prevNode = elementNode;
        model.forEach(function (item) {
            var node = createNode(item);
            insertAfter(node, prevNode);
            prevNode = node;
            // store node
            if (trackBy === HASH_KEY) {
                item[trackBy] = diff.getUniqueId();
            }
            itemHashToNodeMap[item[trackBy]] = node;
        });
        hideNode(elementNode);

        // watch model for changes if it is not one-time binding
        var unwatchModel;
        if (!/^::/.test(expression)) {
            unwatchModel = $scope.$watchCollection(getModel, renderChanges);
        }

        ///////////////////////////////////////////////////////////////////

        function getModel() {
            return $parse(expression)($scope);
        }

        function renderChanges(list, prev) {
            if (list === prev) return;

            var difference = diff(list, prev, trackBy);

            syncDom(difference);
        }

        function syncDom(difference) {
            var prevNode = elementNode; // insert new node after me
            difference.forEach(function (diffEntry, i) {
                var item = diffEntry.item;
                var node = itemHashToNodeMap[item[trackBy]];
                var nodeIndex;

                switch (diffEntry.state) {

                    case diff.CREATED:
                        if (node) {
                            nodeIndex = getNodeIndex(node);
                            if (nodeIndex != i) {
                                insertAfter(node, prevNode);
                            }
                            showNode(node);
                        } else {
                            node = createNode(item);
                            insertAfter(node, prevNode);
                            var hashKey = diff.getUniqueId();
                            item[trackBy] = hashKey;
                            itemHashToNodeMap[hashKey] = node;
                        }
                        break;

                    case diff.MOVED:
                    case diff.NOT_MODIFIED:
                        nodeIndex = getNodeIndex(node);
                        if (nodeIndex != i) {
                            insertAfter(node, prevNode);
                        }
                        break;

                    case diff.DELETED:
                        hideNode(node);
                        //deleteNode(node);
                        //delete itemHashToNodeMap[item[trackBy]];
                        break;
                }
                prevNode = node;
            });
        }

        // DOM operations /////////////////////////////////////////////////

        function insertAfter(node, afterNode) {
            if (afterNode.nextSibling) {
                elementParentNode.insertBefore(node, afterNode.nextSibling);
            } else {
                elementParentNode.appendChild(node);
            }
        }

        function createNode(item) {
            var scope = $scope.$new();
            scope[iteratorName] = item;

            var node = templateNode.cloneNode(true);

            amendItemScope(scope, node);
            $compile(node)(scope);

            return node;
        }

        function amendItemScope(scope, node) {
            Object.defineProperties(scope, {
                $index: {
                    enumerable: true,
                    get: function () {
                        return getNodeIndex(node);
                    }
                },
                $first: {
                    enumerable: true,
                    get: function () {
                        return getNodeIndex(node) === 0;
                    }
                },
                $last: {
                    enumerable: true,
                    get: function () {
                        var length = getModel().length;
                        return getNodeIndex(node) === length-1;
                    }
                },
                $middle: {
                    enumerable: true,
                    get: function () {
                        return !this.$first && !this.$last;
                    }
                },
                $even: {
                    enumerable: true,
                    get: function () {
                        return this.$index % 2 === 0;
                    }
                },
                $odd: {
                    enumerable: true,
                    get: function () {
                        return this.$index % 2 === 1;
                    }
                }
            });
            return scope;
        }

        function showNode(node) {
            node.className = node.className.slice(0, -8);
        }

        function hideNode(node) {
            node.className += ' ng-hide';
        }

        function getNodeIndex(node, absolute) {
            var nodeList = elementParentNode.childNodes;
            var index = [].indexOf.call(nodeList, node);
            if (!absolute) {
                index = index - elementNodeIndex - 1;
            }
            return index;
        }

        ///////////////////////////////////////////////////////////////////////////

        $scope.$on('$destroy', function () {
            unwatchModel();
        });
    }

});

},{"f-xyz-diff":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZi14eXotZGlmZi9pbmRleC5qcyIsInNyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIERJRkZfTk9UX01PRElGSUVEID0gMDtcbnZhciBESUZGX0NSRUFURUQgPSAxO1xudmFyIERJRkZfTU9WRUQgPSAyO1xudmFyIERJRkZfREVMRVRFRCA9IC0xO1xuXG52YXIgbGFzdFVuaXF1ZUlkID0gMDtcblxuLyoqXG4gKiBSZXR1cm5zIGF1dG8gaW5jcmVtZW50YWwgdW5pcXVlIElEIGFzIGludGVnZXIuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBpbnRlZ2VycyBzdGFydGluZyBmcm9tIDBcbiAqL1xuZnVuY3Rpb24gZ2V0VW5pcXVlSWQoKSB7XG4gICAgcmV0dXJuIGxhc3RVbmlxdWVJZCsrO1xufVxuXG4vKipcbiAqIFJldHVybnMgeCBpZiBpdCBpcyBub3QgdW5kZWZpbmVkLCB5IG90aGVyd2lzZS5cbiAqIEBwYXJhbSB4XG4gKiBAcGFyYW0geVxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIG1heWJlKHgsIHkpIHtcbiAgICBpZiAoeCAhPT0gdW5kZWZpbmVkKSByZXR1cm4geDtcbiAgICByZXR1cm4geTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5fSBsaXN0XG4gKiBAcGFyYW0ge3N0cmluZ30gcHJpbWFyeUtleVxuICogQHJldHVybnMge3t9fVxuICovXG5mdW5jdGlvbiBidWlsZEhhc2hUb0luZGV4TWFwKGxpc3QsIHByaW1hcnlLZXkpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICAgICAgbWFwW2l0ZW1bcHJpbWFyeUtleV1dID0gaTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gYXJyYXlzLlxuICogUmV0dXJucyBhcnJheSBvZiB7IGl0ZW06IFQsIHN0YXRlOiBpbnQgfS5cbiAqIFdoZXJlIHN0YXRlIG1lYW5zOiAwIC0gbm90IG1vZGlmaWVkLCAxIC0gY3JlYXRlZCwgLTEgLSBkZWxldGVkLlxuICogQHBhcmFtIHtBcnJheX0gbmV3TGlzdFxuICogQHBhcmFtIHtBcnJheX0gb2xkTGlzdFxuICogQHBhcmFtIHtzdHJpbmd9IHByaW1hcnlLZXkgaXRlbSdzIHVuaXF1ZSBpbmRleCBmaWVsZCBuYW1lXG4gKi9cbmZ1bmN0aW9uIGRpZmYobmV3TGlzdCwgb2xkTGlzdCwgcHJpbWFyeUtleSkge1xuICAgIHZhciBkaWZmID0gW107XG4gICAgdmFyIG5ld0luZGV4ID0gMDtcbiAgICB2YXIgb2xkSW5kZXggPSAwO1xuXG4gICAgdmFyIG5ld0luZGV4TWFwID0gYnVpbGRIYXNoVG9JbmRleE1hcChuZXdMaXN0LCBwcmltYXJ5S2V5KTtcbiAgICB2YXIgb2xkSW5kZXhNYXAgPSBidWlsZEhhc2hUb0luZGV4TWFwKG9sZExpc3QsIHByaW1hcnlLZXkpO1xuXG4gICAgZnVuY3Rpb24gYWRkRW50cnkoaXRlbSwgc3RhdGUsIG5ld0luZGV4LCBwcmV2SW5kZXgpIHtcbiAgICAgICAgZGlmZi5wdXNoKHtcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICBvbGRJbmRleDogcHJldkluZGV4LFxuICAgICAgICAgICAgbmV3SW5kZXg6IG5ld0luZGV4XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAoOyBuZXdJbmRleCA8IG5ld0xpc3QubGVuZ3RoIHx8IG9sZEluZGV4IDwgb2xkTGlzdC5sZW5ndGg7KSB7XG4gICAgICAgIHZhciBuZXdJdGVtID0gbmV3TGlzdFtuZXdJbmRleF07XG4gICAgICAgIHZhciBvbGRJdGVtID0gb2xkTGlzdFtvbGRJbmRleF07XG5cbiAgICAgICAgaWYgKG5ld0luZGV4ID49IG5ld0xpc3QubGVuZ3RoKSB7XG5cbiAgICAgICAgICAgIGFkZEVudHJ5KG9sZEl0ZW0sIERJRkZfREVMRVRFRCwgLTEsIG9sZEluZGV4KTtcbiAgICAgICAgICAgICsrb2xkSW5kZXg7XG5cbiAgICAgICAgfSBlbHNlIGlmIChvbGRJbmRleCA+PSBvbGRMaXN0Lmxlbmd0aCkge1xuXG4gICAgICAgICAgICBhZGRFbnRyeShuZXdJdGVtLCBESUZGX0NSRUFURUQsIG5ld0luZGV4LCAtMSk7XG4gICAgICAgICAgICArK25ld0luZGV4O1xuXG4gICAgICAgIH0gZWxzZSBpZiAobmV3SXRlbSAhPT0gb2xkSXRlbSkge1xuXG4gICAgICAgICAgICB2YXIgaW5kZXhPZk5ld0l0ZW1Jbk9sZExpc3QgPVxuICAgICAgICAgICAgICAgIG1heWJlKG9sZEluZGV4TWFwW25ld0l0ZW1bcHJpbWFyeUtleV1dLCAtMSk7XG5cbiAgICAgICAgICAgIHZhciBpbmRleE9mT2xkSXRlbUluTmV3TGlzdCA9XG4gICAgICAgICAgICAgICAgbWF5YmUobmV3SW5kZXhNYXBbb2xkSXRlbVtwcmltYXJ5S2V5XV0sIC0xKTtcblxuICAgICAgICAgICAgdmFyIGlzQ3JlYXRlZCA9IGluZGV4T2ZOZXdJdGVtSW5PbGRMaXN0ID09PSAtMTtcbiAgICAgICAgICAgIHZhciBpc0RlbGV0ZWQgPSBpbmRleE9mT2xkSXRlbUluTmV3TGlzdCA9PT0gLTE7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZWRcbiAgICAgICAgICAgIGlmIChpc0NyZWF0ZWQpIHtcbiAgICAgICAgICAgICAgICBhZGRFbnRyeShuZXdJdGVtLCBESUZGX0NSRUFURUQsIG5ld0luZGV4LCAtMSk7XG4gICAgICAgICAgICAgICAgKytuZXdJbmRleDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbW92ZWRcbiAgICAgICAgICAgIGlmICghaXNDcmVhdGVkICYmICFpc0RlbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICBhZGRFbnRyeShuZXdJdGVtLCBESUZGX01PVkVELCBuZXdJbmRleCwgaW5kZXhPZk9sZEl0ZW1Jbk5ld0xpc3QpO1xuICAgICAgICAgICAgICAgICsrbmV3SW5kZXg7XG4gICAgICAgICAgICAgICAgKytvbGRJbmRleDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZGVsZXRlZFxuICAgICAgICAgICAgaWYgKGlzRGVsZXRlZCkge1xuICAgICAgICAgICAgICAgIGFkZEVudHJ5KG9sZEl0ZW0sIERJRkZfREVMRVRFRCwgLTEsIG9sZEluZGV4KTtcbiAgICAgICAgICAgICAgICArK29sZEluZGV4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRFbnRyeShvbGRJdGVtLCBESUZGX05PVF9NT0RJRklFRCwgbmV3SW5kZXgsIG9sZEluZGV4KTtcbiAgICAgICAgICAgICsrbmV3SW5kZXg7XG4gICAgICAgICAgICArK29sZEluZGV4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmY7XG59XG5cbi8vIGV4cG9ydHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5kaWZmLk5PVF9NT0RJRklFRCA9IERJRkZfTk9UX01PRElGSUVEO1xuZGlmZi5DUkVBVEVEID0gRElGRl9DUkVBVEVEO1xuZGlmZi5NT1ZFRCA9IERJRkZfTU9WRUQ7XG5kaWZmLkRFTEVURUQgPSBESUZGX0RFTEVURUQ7XG5kaWZmLmdldFVuaXF1ZUlkID0gZ2V0VW5pcXVlSWQ7XG5kaWZmLmJ1aWxkSGFzaFRvSW5kZXhNYXAgPSBidWlsZEhhc2hUb0luZGV4TWFwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmY7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgcmVxdWlyZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBkaWZmID0gcmVxdWlyZSgnZi14eXotZGlmZicpO1xuICAgICAgICBmYWN0b3J5KG1vZHVsZS5leHBvcnRzLCBkaWZmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KHdpbmRvdywgd2luZG93LmRpZmYpO1xuICAgIH1cbn0pKGZ1bmN0aW9uIChleHBvcnRzLCBkaWZmKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBleHBvcnRzLm5nUmVwZWF0RmFzdCA9IGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbmdSZXBlYXRGYXN0JywgW10pXG4gICAgICAgIC5kaXJlY3RpdmUoJ25nUmVwZWF0RmFzdCcsIFtcbiAgICAgICAgICAgICckcGFyc2UnLCAnJGNvbXBpbGUnLFxuICAgICAgICAgICAgbmdSZXBlYXRGYXN0RmFjdG9yeVxuICAgICAgICBdKTtcblxuICAgIGZ1bmN0aW9uIG5nUmVwZWF0RmFzdEZhY3RvcnkoJHBhcnNlLCAkY29tcGlsZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NvcGU6IHRydWUsXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgcHJpb3JpdHk6IDEwMDAsXG4gICAgICAgICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgICAgICAgICAgICBuZ1JlcGVhdEZhc3RMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkY29tcGlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBmdW5jdGlvbiBuZ1JlcGVhdEZhc3RMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkY29tcGlsZSkge1xuXG4gICAgICAgIC8vIHRvZG8gLSBhbmltYXRpb25zIHN1cHBvcnRcbiAgICAgICAgLy8gdG9kbyAtIGdhcmJhZ2UgY29sbGVjdGlvbiBmb3IgRE9NIG5vZGVzICg/KSB0aW1lci1iYXNlZD9cblxuICAgICAgICB2YXIgSEFTSF9LRVkgPSAnJCRoYXNoS2V5JztcblxuICAgICAgICBpZiAoJ25nSW5jbHVkZScgaW4gJGF0dHJzKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignbmdSZXBlYXRGYXN0OiBuZ0luY2x1ZGUgb24gcmVwZWF0aW5nICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2VsZW1lbnQgaXMgbm90IHN1cHBvcnRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGNyZWF0ZSBuZXN0ZWQgZWxlbWVudCB3aXRoIG5nLWluY2x1ZGUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXJzZSBuZy1yZXBlYXQgZXhwcmVzc2lvbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgIHZhciByeCA9IC9eXFxzKihcXHcrKVxcc2luXFxzKC4rPykoXFxzdHJhY2sgYnlcXHMoLis/KSk/JC87XG4gICAgICAgIHZhciBtYXRjaCA9ICRhdHRycy5uZ1JlcGVhdEZhc3QubWF0Y2gocngpO1xuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignbmdSZXBlYXRGYXN0OiBleHBlY3RlZCBuZ1JlcGVhdEZhc3QgaW4gZm9ybSBvZiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdge2l0ZW19IGluIHthcnJheX0gW3wgZmlsdGVyLCBldGNdYCBbdHJhY2sgYnkgXFwne2ZpZWxkfVxcJ10gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnYnV0IGdvdCBgJyArICRhdHRycy5uZ1JlcGVhdEZhc3QgKyAnYCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZXJhdG9yTmFtZSA9IG1hdGNoWzFdO1xuICAgICAgICB2YXIgZXhwcmVzc2lvbiA9IG1hdGNoWzJdO1xuICAgICAgICB2YXIgdHJhY2tCeSA9IG1hdGNoWzRdIHx8IEhBU0hfS0VZO1xuICAgICAgICB2YXIgbW9kZWwgPSBnZXRNb2RlbCgpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobW9kZWwpKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcignbmdSZXBlYXRGYXN0OiBleHBlY3RlZCBtb2RlbCBgJyArICRhdHRycy5uZ1JlcGVhdEZhc3QgKyAnYCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0byBiZSBhbiBhcnJheSBidXQgZ290OiAnICsgbW9kZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYnVpbGQgRE9NIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICB2YXIgaXRlbUhhc2hUb05vZGVNYXAgPSB7fTtcblxuICAgICAgICB2YXIgZWxlbWVudE5vZGUgPSAkZWxlbWVudFswXTtcbiAgICAgICAgdmFyIGVsZW1lbnRQYXJlbnROb2RlID0gZWxlbWVudE5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIGVsZW1lbnROb2RlSW5kZXggPSBnZXROb2RlSW5kZXgoZWxlbWVudE5vZGUsIHRydWUpO1xuICAgICAgICB2YXIgdGVtcGxhdGVOb2RlID0gZWxlbWVudE5vZGUuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICB0ZW1wbGF0ZU5vZGUucmVtb3ZlQXR0cmlidXRlKCduZy1yZXBlYXQtZmFzdCcpO1xuXG4gICAgICAgIHZhciBwcmV2Tm9kZSA9IGVsZW1lbnROb2RlO1xuICAgICAgICBtb2RlbC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IGNyZWF0ZU5vZGUoaXRlbSk7XG4gICAgICAgICAgICBpbnNlcnRBZnRlcihub2RlLCBwcmV2Tm9kZSk7XG4gICAgICAgICAgICBwcmV2Tm9kZSA9IG5vZGU7XG4gICAgICAgICAgICAvLyBzdG9yZSBub2RlXG4gICAgICAgICAgICBpZiAodHJhY2tCeSA9PT0gSEFTSF9LRVkpIHtcbiAgICAgICAgICAgICAgICBpdGVtW3RyYWNrQnldID0gZGlmZi5nZXRVbmlxdWVJZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbUhhc2hUb05vZGVNYXBbaXRlbVt0cmFja0J5XV0gPSBub2RlO1xuICAgICAgICB9KTtcbiAgICAgICAgaGlkZU5vZGUoZWxlbWVudE5vZGUpO1xuXG4gICAgICAgIC8vIHdhdGNoIG1vZGVsIGZvciBjaGFuZ2VzIGlmIGl0IGlzIG5vdCBvbmUtdGltZSBiaW5kaW5nXG4gICAgICAgIHZhciB1bndhdGNoTW9kZWw7XG4gICAgICAgIGlmICghL146Oi8udGVzdChleHByZXNzaW9uKSkge1xuICAgICAgICAgICAgdW53YXRjaE1vZGVsID0gJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oZ2V0TW9kZWwsIHJlbmRlckNoYW5nZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldE1vZGVsKCkge1xuICAgICAgICAgICAgcmV0dXJuICRwYXJzZShleHByZXNzaW9uKSgkc2NvcGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyQ2hhbmdlcyhsaXN0LCBwcmV2KSB7XG4gICAgICAgICAgICBpZiAobGlzdCA9PT0gcHJldikgcmV0dXJuO1xuXG4gICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IGRpZmYobGlzdCwgcHJldiwgdHJhY2tCeSk7XG5cbiAgICAgICAgICAgIHN5bmNEb20oZGlmZmVyZW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzeW5jRG9tKGRpZmZlcmVuY2UpIHtcbiAgICAgICAgICAgIHZhciBwcmV2Tm9kZSA9IGVsZW1lbnROb2RlOyAvLyBpbnNlcnQgbmV3IG5vZGUgYWZ0ZXIgbWVcbiAgICAgICAgICAgIGRpZmZlcmVuY2UuZm9yRWFjaChmdW5jdGlvbiAoZGlmZkVudHJ5LCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBkaWZmRW50cnkuaXRlbTtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IGl0ZW1IYXNoVG9Ob2RlTWFwW2l0ZW1bdHJhY2tCeV1dO1xuICAgICAgICAgICAgICAgIHZhciBub2RlSW5kZXg7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGRpZmZFbnRyeS5zdGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgZGlmZi5DUkVBVEVEOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXggPSBnZXROb2RlSW5kZXgobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVJbmRleCAhPSBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydEFmdGVyKG5vZGUsIHByZXZOb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd05vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgPSBjcmVhdGVOb2RlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydEFmdGVyKG5vZGUsIHByZXZOb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaEtleSA9IGRpZmYuZ2V0VW5pcXVlSWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtW3RyYWNrQnldID0gaGFzaEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtSGFzaFRvTm9kZU1hcFtoYXNoS2V5XSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlIGRpZmYuTU9WRUQ6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgZGlmZi5OT1RfTU9ESUZJRUQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXggPSBnZXROb2RlSW5kZXgobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZUluZGV4ICE9IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRBZnRlcihub2RlLCBwcmV2Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlIGRpZmYuREVMRVRFRDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZWxldGVOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbUhhc2hUb05vZGVNYXBbaXRlbVt0cmFja0J5XV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldk5vZGUgPSBub2RlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBET00gb3BlcmF0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIobm9kZSwgYWZ0ZXJOb2RlKSB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJOb2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudFBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGFmdGVyTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRQYXJlbnROb2RlLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlTm9kZShpdGVtKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSAkc2NvcGUuJG5ldygpO1xuICAgICAgICAgICAgc2NvcGVbaXRlcmF0b3JOYW1lXSA9IGl0ZW07XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gdGVtcGxhdGVOb2RlLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgYW1lbmRJdGVtU2NvcGUoc2NvcGUsIG5vZGUpO1xuICAgICAgICAgICAgJGNvbXBpbGUobm9kZSkoc2NvcGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFtZW5kSXRlbVNjb3BlKHNjb3BlLCBub2RlKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzY29wZSwge1xuICAgICAgICAgICAgICAgICRpbmRleDoge1xuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXROb2RlSW5kZXgobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICRmaXJzdDoge1xuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXROb2RlSW5kZXgobm9kZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICRsYXN0OiB7XG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGdldE1vZGVsKCkubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldE5vZGVJbmRleChub2RlKSA9PT0gbGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICRtaWRkbGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuJGZpcnN0ICYmICF0aGlzLiRsYXN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAkZXZlbjoge1xuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRpbmRleCAlIDIgPT09IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICRvZGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kaW5kZXggJSAyID09PSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzaG93Tm9kZShub2RlKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTmFtZSA9IG5vZGUuY2xhc3NOYW1lLnNsaWNlKDAsIC04KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhpZGVOb2RlKG5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NOYW1lICs9ICcgbmctaGlkZSc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXROb2RlSW5kZXgobm9kZSwgYWJzb2x1dGUpIHtcbiAgICAgICAgICAgIHZhciBub2RlTGlzdCA9IGVsZW1lbnRQYXJlbnROb2RlLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBbXS5pbmRleE9mLmNhbGwobm9kZUxpc3QsIG5vZGUpO1xuICAgICAgICAgICAgaWYgKCFhYnNvbHV0ZSkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaW5kZXggLSBlbGVtZW50Tm9kZUluZGV4IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdW53YXRjaE1vZGVsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG4iXX0=
