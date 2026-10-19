# Terms

This repository is a curated collection of icons for Microsoft products. It is
not published, endorsed or sponsored by Microsoft. The icons are collected here
so that software which refers to Microsoft products can show the product's own
icon rather than an approximation.

The files in this repository fall into three groups with different bases.

## 1. Microsoft product icons

Everything under `icons/` except the Fabric item icons listed in section 2.

These are Microsoft product logos. They are the property of Microsoft
Corporation and are used here to refer to the products they identify, in line
with the [Microsoft Trademark and Brand Guidelines][brand]. In particular they
are not altered beyond resizing and format conversion, they are not combined
with other marks, and nothing here suggests Microsoft's endorsement of this
repository or of any software that uses it.

If you use these icons, the same applies to you: use them to refer to the
Microsoft product, keep them as supplied, and read the guidelines before
relying on them. No licence to the marks themselves is granted or implied by
this repository.

The maintainer will remove any icon on request from Microsoft.

## 2. Microsoft Fabric item icons

The files under `icons/fabric/` other than `fabric.svg` and `fabric.png`.

These are the Fabric workspace item icons from the npm package
[`@fabric-msft/svg-icons`][pkg] (version 11.0.0), which Microsoft publishes
under the MIT licence for Fabric platform extension development. They were
converted to this repository's conventions by `scripts/add-fabric-items.mjs`
(resized, viewBox added, PNG rendered); the artwork is unchanged.

The MIT licence for those files:

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The MIT licence covers the icon files. Product names that appear in the file
names and descriptions remain Microsoft trademarks, as in section 1.

## 3. Everything else

`icons.json`, `index.html`, `README.md`, the scripts and the favicon are the
work of this repository's maintainers and are released under the MIT licence
above, with the copyright held by the contributors.

## Credit

This repository is a fork of [DamoBird365/microsoft-cloud-icons][upstream],
which assembled the original collection of product icons and the index.

## Additional permissions

Any permission obtained from Microsoft beyond the bases above will be
recorded here, with its date and scope, so that users of this repository can
see exactly what it rests on.

## Changes to these terms

This file describes the basis on which the icons are distributed as the
maintainers understand it. It is not legal advice. If Microsoft's guidelines
or the upstream package licence change, this file will be updated and the
change noted in the release that carries it.

[brand]: https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks
[pkg]: https://www.npmjs.com/package/@fabric-msft/svg-icons
[upstream]: https://github.com/DamoBird365/microsoft-cloud-icons
