#!/bin/bash

.PHONY: all
all:
	tsc
	cat index.html | sed s/{{VERSION}}/`cat VERSION`/ > build/index.html
	cp LICENSE build/LICENSE.txt
	cp COPYRIGHT build/COPYRIGHT.txt
	cp VERSION build/VERSION.txt

.PHONY: clean
clean:
	-rm -rf build/
