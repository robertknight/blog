app_srcs=$(wildcard *.ts) $(wildcard views/*.ts) $(wildcard components/*.ts)
theme_srcs=$(wildcard theme/*)

all: demo

build/cli.js: $(app_srcs) $(theme_srcs)
	tsc --noEmitOnError --noImplicitAny -m commonjs --outDir build $(app_srcs)
	cp -R theme build/

build/theme/theme.css: build/theme build/cli.js theme/base.css
	./node_modules/.bin/ts-style $(wildcard build/views/*.js) > build/app-theme.css
	cat theme/base.css > $@
	cat build/app-theme.css >> $@

demo: build/cli.js build/theme build/theme/theme.css
	node build/cli.js test-blog

clean:
	rm -rf build
