#!/usr/bin/env bash

spec=$1
: ${spec:='spec'}

gulp test-watch
