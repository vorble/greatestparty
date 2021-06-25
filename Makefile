#!/bin/bash

.PHONY: all
all:
	tsc
	cat index.html | sed s/{{VERSION}}/`cat VERSION`/ > build/index.html
	cp LICENSE build/LICENSE.txt
	cp COPYRIGHT build/COPYRIGHT.txt
	cp VERSION build/VERSION.txt
	grep -B 99999 '## Developer Guide' README.md | sed '$$ d' | sed '$$ d' > build/README.txt

.PHONY: clean
clean:
	-rm -rf build/
