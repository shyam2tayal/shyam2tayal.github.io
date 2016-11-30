(function () {
    'use strict';

    chai.should();

    var $compile, $rootScope;
    var app = angular.module('app', ['ngRepeatFast']);
    var fastRepeatTemplate =
        '<div ng-repeat-fast="item in list">' +
            '{{ ::item.value }}' +
        '</div>';

    /**
     * @param {string?} customTemplate
     * @returns {jQuery}
     */
    function createElement(customTemplate) {
        var template = customTemplate || fastRepeatTemplate;
        var element = $compile(template)($rootScope);
        $rootScope.$digest();
        return $(element[0].parentNode); // documentFragment
    }

    /**
     * @param container
     * @param [includeHidden]
     * @returns {jQuery[]}
     */
    function getItems(container, includeHidden) {
        if (includeHidden) {
            return container.children();
        } else {
            return container.children(':not(.ng-hide)');
        }
    }

    beforeEach(function () {
        module('app');
        inject(function ($injector) {
            $compile = $injector.get('$compile', '');
            $rootScope = $injector.get('$rootScope', '');
        });
    });

    describe('common tests', function () {

        it('parses ng-repeat expression', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var templates = [
                '<div ng-repeat-fast="item in list"></div>',
                '<div ng-repeat-fast="item in list | filter: 1"></div>',
                '<div ng-repeat-fast="item in ::list"></div>',
                '<div ng-repeat-fast="item in ::list track by value"></div>'
            ];
            templates.forEach(function (template) {
                $compile(template)($rootScope);
            });
        });

        it('parses `track by` expression', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var template =
                '<div ng-repeat-fast="item in list track by value">' +
                    '{{ ::item.value }}' +
                '</div>';
            var container = createElement(template);

            $rootScope.list.forEach(function (x) {
                x.should.not.have.property('$$hashKey');
            });

            var items = getItems(container);
            items.length.should.eq(2);
            items.eq(0).text().should.eq('0');
            items.eq(1).text().should.eq('1');
        });

        it('throws if expression is invalid', function () {
            var template = '<div ng-repeat-fast="!@#"></div>';
            var action = function () {
                $compile(template)($rootScope);
            };
            action.should.throw();
        });

        it('throws if ng-include is set on repeated element', function () {
            $rootScope.list = [];
            var template = '<div ng-repeat-fast="list" ng-include></div>';
            var action = function () {
                $compile(template)($rootScope);
            };
            action.should.throw();
        });

        it('throws if model is not an array of objects', function () {
            var models = [{}, null, undefined, 123, 'lol'];
            models.forEach(function (model) {
                $rootScope.list = model;
                var action = function () {
                    $compile(fastRepeatTemplate)($rootScope);
                };
                action.should.throw();
            });
        });

        it('understands one-time binding ::', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var template =
                '<div ng-repeat-fast="item in ::list">' +
                    '{{ ::item.value }}' +
                '</div>';
            var container = createElement(template);

            $rootScope.list.push({ value: 2 });
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(2);
            items.eq(0).text().should.eq('0');
            items.eq(1).text().should.eq('1');
        });

        it('removes watchers when destroyed', function () {
            var unwatchCalledTimes = 0;

            var watchCollection = $rootScope.$watchCollection;
            $rootScope.$watchCollection = function () {
                var unwatch = watchCollection.apply($rootScope, arguments);
                return function () {
                    ++unwatchCalledTimes;
                    unwatch();
                };
            };

            $rootScope.list = [];
            createElement();

            $rootScope.$destroy();

            unwatchCalledTimes.should.eq(1);
        });
    });

    describe('DOM sync.', function () {

        it('creates nodes', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var container = createElement();

            $rootScope.list.push({ value: 2 });
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(3);
            items.eq(0).text().should.eq('0');
            items.eq(1).text().should.eq('1');
            items.eq(2).text().should.eq('2');

            [].some.call(items, function (x, i) {
                var scope = $(x).scope();
                scope.$index.should.eq(i);
                scope.$first.should.eq(i == 0);
                scope.$last.should.eq(i == 2);
                scope.$middle.should.eq(i == 1);
                scope.$even.should.eq(i % 2 == 0);
                scope.$odd.should.eq(i % 2 == 1);
            });
        });

        it('removes nodes', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var container = createElement();

            $rootScope.list = [];
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(0);
        });

        it('adds node to the begin', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var container = createElement();

            $rootScope.list.unshift({ value: -1 });
            $rootScope.$apply();

            var items = getItems(container);
            items.length.should.eq(3);
            items.eq(0).text().should.eq('-1');
            items.eq(1).text().should.eq('0');
            items.eq(2).text().should.eq('1');
        });

        it('adds node to the end', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var container = createElement();

            $rootScope.list.push({ value: 2 });
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(3);
            items.eq(0).text().should.eq('0');
            items.eq(1).text().should.eq('1');
            items.eq(2).text().should.eq('2');
        });

        [2, 3, 7].forEach(function (n) {
            it('reverses list of ' + n + ' nodes', function () {
                $rootScope.list = [{ value: 0 }, { value: 1 }];
                var container = createElement();

                $rootScope.list = [];
                $rootScope.$digest();

                for (var i = 0; i < n; ++i) {
                    $rootScope.list.push({ value: i });
                }
                $rootScope.$digest();

                $rootScope.list = $rootScope.list.reverse();
                $rootScope.$digest();

                var items = getItems(container);
                items.length.should.eq(n);
                [].forEach.call(items, function (x, i) {
                    x.textContent.should.eq(String(n-i-1));
                });
            }); // it
        }); // forEach

        it('does not affect sibling nodes', function () {
            $rootScope.list = [];
            var template =
                '<span>-----</span>' +
                    '<div ng-repeat-fast="item in list">' +
                        '{{ ::item.value }}' +
                    '</div>' +
                '<span>+++++</span>';
            var container = createElement(template);

            $rootScope.list.push({ value: 0 });
            $rootScope.list.push({ value: 1 });
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(4);
            items.eq(0).text().should.eq('-----');
            items.eq(1).text().should.eq('0');
            items.eq(2).text().should.eq('1');
            items.eq(3).text().should.eq('+++++');
        });

        it('reuses nodes after deletion and recreation', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var container = createElement();

            var listBackup = $rootScope.list;
            var itemsBackup = getItems(container);

            $rootScope.list = [];
            $rootScope.$digest();

            $rootScope.list = listBackup;
            $rootScope.$digest();

            var items = getItems(container);
            items.should.eql(itemsBackup);
        });

        it('corrects node indexes if they added again', function () {
            $rootScope.list = [{ value: 0 }, { value: 1 }];
            var template =
                '<div ng-repeat-fast="item in list track by value">' +
                    '{{ ::item.value }}' +
                '</div>';
            var container = createElement(template);

            $rootScope.list = [];
            $rootScope.$digest();

            $rootScope.list = [{ value: 1 }, { value: 0 }];
            $rootScope.$digest();

            var items = getItems(container);
            items.length.should.eq(2);
            items.eq(0).text().should.eq('1');
            items.eq(1).text().should.eq('0');
        });

    }); // describe 'DOM sync.'

})();
