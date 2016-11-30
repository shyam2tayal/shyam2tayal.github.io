# ngRepeatFast
[![Build Status](https://travis-ci.org/f-xyz/ng-repeat-fast.svg?branch=master)](https://travis-ci.org/f-xyz/ng-repeat-fast)

[Demo](http://f-xyz.github.io/ng-repeat-fast/site/index.html) | 
[Tests](http://f-xyz.github.io/ng-repeat-fast/tests/index.html)

Incomplete but faster `ng-repeat` realization.
Never removes DOM nodes. It adds `ng-hide`
class on corresponding node when item was
removed instead.

* Supports `track by`.
* Supports `$first`, `$last`, `$middle`, `$index`, `$even` and `$odd`.
* Supports *arrays of objects* only. So
    * no arrays of primitive values.
    * no objects as model.
* Does not create comment nodes.
* Does not support ng-repeat-start & ng-repeat-end.
* Does not support ng-include on repeating element.
    * Workaround: use nested element `<div ng-include='...'></div>`.
* Animations. - planned.
    
## Basic Usage
```html
<div class="list-item" ng-repeat-fast="item in list | filter: search">
    {{ item.value }}
</div>
```

## Render just once
one-time binding
```html
<div class="list-item" ng-repeat-fast="item in ::list">
    {{ ::item.value }}
</div>
```

## With `ng-include`
```html
<div class="list-item" ng-repeat-fast="item in list | filter: search">
     <div ng-include="'item-template.html'"></div>
</div>
```

## License
MIT
