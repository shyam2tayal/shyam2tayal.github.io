.PHONY: test watch

all: test

test:
	mocha --compilers coffee:coffee-script/register -R spec
	istanbul cover _mocha

watch:
	mocha --compilers coffee:coffee-script/register -R spec --watch
