#!/usr/bin/env bash

spec=$1
: ${spec:='spec'}

mocha --watch --compilers coffee:coffee-script/register test/index.js -R ${spec}
