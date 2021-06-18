#!/bin/bash

.PHONY: all
all:
	tsc
	cat index.html | sed s/{{VERSION}}/`cat VERSION`/ > build/index.html
	cp LICENSE build/LICENSE.TXT
	cp VERSION build/


.PHONY: clean
clean:
	-rm -rf build/
