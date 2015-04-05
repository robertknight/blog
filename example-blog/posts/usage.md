---
title: Using this blog generator
date: 2015-02-28
tags: tutorials
---

The input to the blog generator is structured in a way
that is similar to the input of the [Jekyll](http://jekyllrb.com/)
blog generator.

The input is structured as follows:

<pre>
your-blog/
  config.yml 
  posts/
    first-post.md
	another-post.md
</pre>

The `config.yml` file contains global settings and defaults
for the site.

Posts are written in [markdown](http://daringfireball.net/projects/markdown/syntax)
with a section at the top known as ['Front Matter'](http://jekyllrb.com/docs/frontmatter/) which specifies the title,
author, tags, date and other metadata.

````
---
title: Using this blog generator
date: 2015-02-28
tags: tutorials
---

Markdown for your post goes here.
````

To generate the blog, run:

`generate your-blog`

This will generate the output in `your-blog/_site`.
Navigate to this directory and start a local web server to view it:

````
cd your-blog/_site
python -m SimpleHTTPServer 8000
open http://localhost:8000
````

## Components

In addition to normal Markdown syntax and HTML, blog posts may
use _components_, which are more complex widgets, such as images
and code viewers.

Components are specified with an HTML-like syntax, where the tag
name is the name of the component and begins with an upper-case letter.
Tags must either be self-closing (with a trailing `/>`) or have children.

Unlike `<iframe>` embeds in other blog generators, these components
are rendered to a static version when the page is generated but
can add interactive functionality once the client app has loaded.

For example:
````
<Image src="/assets/cat.jpg" width="200" />
````

Generates:

<Image src="/assets/cat.jpg" width="200" />

Currently provided components are:
 * Image
