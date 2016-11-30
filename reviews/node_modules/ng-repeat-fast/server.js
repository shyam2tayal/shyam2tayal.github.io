#!/usr/bin/env node

var express = require('express');
var srv = express();
var colors = require('colors');
var argv = require('optimist').argv;

var port = argv.port || 5000;
var root = argv.root || __dirname;

srv.use(express.logger());
srv.use(express.directory(root));
srv.use(express.static(root));
srv.listen(port);

console.log('Static HTTP Server'.yellow.underline);
console.log('  --port='.white + port.toString().green);
console.log('  --root='.white + root.toString().green);
