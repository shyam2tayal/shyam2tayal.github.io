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
