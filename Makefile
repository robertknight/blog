app_srcs=$(wildcard *.ts) $(wildcard views/*.ts) $(wildcard components/*.ts)

all: demo

build/cli.js: $(app_srcs)
	tsc --noImplicitAny -m commonjs --outDir build $(app_srcs)

build/theme.css: build/cli.js theme/base.css
	./node_modules/.bin/ts-style $(wildcard build/views/*.js) > build/app-theme.css
	cat theme/base.css >> build/theme.css
	cat build/app-theme.css >> build/theme.css

demo: build/cli.js build/theme.css
	node build/cli.js test-blog

clean:
	rm -rf build
