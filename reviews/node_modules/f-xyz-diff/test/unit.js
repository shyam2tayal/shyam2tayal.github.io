require('chai').should();
var diff = require('../index');

var PK = 'x';
var a = { x: 1 };
var b = { x: 2 };
var c = { x: 3 };

describe('diff() tests', function () {

    describe('comparing with empty array', function () {

        it('both arrays are empty', function () {
            diff([], [], PK).should.eql([]);
        });

        it('created element', function () {
            diff([a], [], PK).should.eql([
                { item: a, state: diff.CREATED, oldIndex: -1, newIndex: 0 }
            ]);
        });

        it('deleted element', function () {
            diff([], [a], PK).should.eql([
                { item: a, state: diff.DELETED, oldIndex: 0, newIndex: -1 }
            ]);
        });
    });

    describe('comparing both non-empty arrays', function () {

        it('not modified elements', function () {
            diff([a], [a], PK).should.eql([
                { item: a, state: diff.NOT_MODIFIED, oldIndex: 0, newIndex: 0 }
            ]);
        });

        it('replaced elements', function () {
            diff([b], [a], PK).should.eql([
                { item: b, state: diff.CREATED, oldIndex: -1, newIndex: 0 },
                { item: a, state: diff.DELETED, oldIndex: 0, newIndex: -1 }
            ]);
        });

        it('created element with non-zero index', function () {
            diff([a, b], [b], PK).should.eql([
                { item: a, state: diff.CREATED, oldIndex: -1, newIndex: 0 },
                { item: b, state: diff.NOT_MODIFIED, oldIndex: 0, newIndex: 1 }
            ]);
        });

        it('deleted element with non-zero index', function () {
            diff([a], [a, b], PK).should.eql([
                { item: a, state: diff.NOT_MODIFIED, oldIndex: 0, newIndex: 0 },
                { item: b, state: diff.DELETED, oldIndex: 1, newIndex: -1 }
            ]);
        });
    });

    describe('moving items', function () {

        it('reverse list with even number of items', function () {
            diff([a, b], [b, a], PK).should.eql([
                { item: a, state: diff.MOVED, oldIndex: 1, newIndex: 0 },
                { item: b, state: diff.MOVED, oldIndex: 0, newIndex: 1 }
            ]);
        });

        it('reverse list with even number of items', function () {
            diff([c, b, a], [a, b, c], PK).should.eql([
                { item: c, state: diff.MOVED, oldIndex: 2, newIndex: 0 },
                { item: b, state: diff.NOT_MODIFIED, oldIndex: 1, newIndex: 1 },
                { item: a, state: diff.MOVED, oldIndex: 0, newIndex: 2 }
            ]);
        });
    });

    describe('works with strings', function () {

        it('treats string as list', function () {
            diff('abc', 'ab').should.eql([
                { item: 'a', state: diff.NOT_MODIFIED, oldIndex: 0, newIndex: 0 },
                { item: 'b', state: diff.NOT_MODIFIED, oldIndex: 1, newIndex: 1 },
                { item: 'c', state: diff.CREATED, oldIndex: -1, newIndex: 2 }
            ]);
        });
    });

    describe('getUniqueId() tests', function () {

        it('should return unique values', function () {
            var bulk = {};
            var duplicate = false;
            for (var i = 0; i < 100; ++i) {
                var hash = diff.getUniqueId();
                if (hash in bulk) {
                    duplicate = true;
                    break;
                }
                bulk[hash] = 0;
            }
            duplicate.should.eq(false);
        });
    });

    describe('buildHashToIndexMap() tests', function () {

        it('should make an object primaryKey => item index', function () {
            var list = [a, b, c];
            diff.buildHashToIndexMap(list, PK).should.eql({
                '1': 0,
                '2': 1,
                '3': 2
            });
        });
    });
});
