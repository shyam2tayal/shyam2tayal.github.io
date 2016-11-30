#!/usr/bin/env bash

commitMessage=$1
: ${commitMessage:='.'}

gulp clean build

git add --all .
git commit -m "${commitMessage}"

git branch -D gh-pages
git branch gh-pages

git push -u origin master gh-pages

sudo npm publish
