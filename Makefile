#!/bin/bash

.PHONY: all
all:
	tsc
	cp index.html build/
	cp LICENSE build/

.PHONY: clean
clean:
	-rm -rf build/
