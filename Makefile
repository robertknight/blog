all: $(wildcard *.ts)
	tsc -m commonjs --outDir build $<

clean:
	rm -rf build
