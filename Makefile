NODE_BIN=./node_modules/.bin
TS_OPTS=--noEmitOnError --noImplicitAny -m commonjs --target ES5

app_srcs=$(wildcard src/*.ts) $(wildcard src/views/*.ts) $(wildcard src/components/*.ts)
theme_srcs=$(wildcard src/theme/*)
client_bundle=build/client.bundle.js

all: demo

build/cli.js: $(app_srcs) $(theme_srcs)
	${NODE_BIN}/tsc ${TS_OPTS} --outDir build $(app_srcs)
	cp -R src/theme build/

$(client_bundle): build/cli.js webpack.config.js
	webpack

build/theme/theme.css: build/theme build/cli.js src/theme/base.css
	${NODE_BIN}/ts-style $(wildcard build/views/*.js) > build/app-theme.css
	cat src/theme/base.css > $@
	cat build/app-theme.css >> $@

demo: build/cli.js build/theme build/theme/theme.css $(client_bundle)
	node build/cli.js example-blog

clean:
	rm -rf build
