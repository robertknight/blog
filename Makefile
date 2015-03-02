app_srcs=$(wildcard *.ts)
component_srcs=$(wildcard components/*.ts)

all: app build/theme.css

app: $(app_srcs) $(component_srcs)
	tsc --noImplicitAny -m commonjs --outDir build $?

build/theme.css: app
	./node_modules/.bin/ts-style $(wildcard build/views/*.js) > $@

demo:
	node build/cli.js test-blog

clean:
	rm -rf build
