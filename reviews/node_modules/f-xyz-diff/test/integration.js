require('chai').should();
var diff = require('../index');

describe('integration tests on big random arrays', function () {
    var n = 1e4;
    var list = [];
    var prev = [];
    var created = [];
    var deleted = [];
    var notModified = [];

    for (var i = 0; list.length < n || prev.length < n; ++i) {

        var addToList = Math.random() >= 0.5 && list.length < n;
        var addToPrev = Math.random() >= 0.5 && prev.length < n;

        var x = { x: i };
        if (addToList) list.push(x);
        if (addToPrev) prev.push(x);

        if      ( addToList &&  addToPrev) notModified.push(x);
        else if ( addToList && !addToPrev) created.push(x);
        else if (!addToList &&  addToPrev) deleted.push(x);
    }

    var number = list.length + prev.length;
    var timeStart = Date.now();
    var result = diff(list, prev, 'x');
    var duration = Date.now() - timeStart;

    it('comparing of ' + number + ' elements took ' + duration + ' ms', function () { });

    it('should determine not modified elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.NOT_MODIFIED })
                .map(function (x) { return x.item })
                .should.eql(notModified);
        } catch (exc) {
            console.log('NOT MODIFIED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });

    it('should determine created elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.CREATED })
                .map(function (x) { return x.item })
                .should.eql(created);
        } catch (exc) {
            console.log('CREATED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });

    it('should determine deleted elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.DELETED })
                .map(function (x) { return x.item })
                .should.eql(deleted);
        } catch (exc) {
            console.log('DELETED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });
});
