# robertknight.github.io Blog Generator

This is a static site blog engine for my blog.

Inspired by jlongster's [Most Over-Engineered Blog Ever](http://jlongster.com/Presenting-The-Most-Over-Engineered-Blog-Ever), this is essentially a playground for me to experiment with React and related web tech.

## Usage

The generator includes an example blog which shows the basic structure
of an input site and contains posts explaining how to use it.

From a GitHub checkout of this repository, generate and view the example blog
using:

```
npm install
make
./generate example-blog
cd example-blog/_site
python -m SimpleHTTPServer 8000
open http://localhost:8000
```

