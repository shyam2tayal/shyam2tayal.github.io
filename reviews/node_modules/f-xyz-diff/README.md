# list-difference

[![Build Status](https://travis-ci.org/fantasticMrFox/list-difference.svg?branch=master)](https://travis-ci.org/fantasticMrFox/list-difference)

Calculates difference between two arrays.

```javascript
/**
 * Calculates difference between two arrays.
 * Returns array of { item: T, state: int }.
 * Where state means: 0 - not modified, 1 - created, -1 - deleted.
 * @param {Array} newList
 * @param {Array} oldList
 * @param {string} primaryKey item's unique index field name
 */
function diff(newList, oldList, primaryKey);
```

## How to use
```javascript
var a = { x: 1 };
var b = { x: 2 };
var c = { x: 3 };

// created
diff([a], [], 'x').should.eql([
    { item: a, state: diff.CREATED, oldIndex: -1, newIndex: 0 }
]);

// deleted
diff([], [a], 'x').should.eql([
    { item: a, state: diff.DELETED, oldIndex: 0, newIndex: -1 }
]);

// not modified
diff([a], [a], 'x').should.eql([
    { item: a, state: diff.NOT_MODIFIED, oldIndex: 0, newIndex: 0 }
]);

// replaced
diff([b], [a], 'x').should.eql([
    { item: b, state: diff.CREATED, oldIndex: -1, newIndex: 0 },
    { item: a, state: diff.DELETED, oldIndex: 0, newIndex: -1 }
]);

// moved
diff([c, b, a], [a, b, c], 'x').should.eql([
    { item: c, state: diff.MOVED, oldIndex: 2, newIndex: 0 },
    { item: b, state: diff.NOT_MODIFIED, oldIndex: 1, newIndex: 1 },
    { item: a, state: diff.MOVED, oldIndex: 0, newIndex: 2 }
]);

```

## Available states

| State             | Value |
|-------------------|-------|
| diff.NOT_MODIFIED | 0     |
| diff.CREATED      | 1     |
| diff.MOVED        | 2     |
| diff.DELETED      | -1    |
