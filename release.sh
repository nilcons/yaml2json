#!/bin/bash

set -euo pipefail

# Hook for people who want to use pnpm or similar stuff.
NPM=${NPM:-npm}

git fetch --all

if git status --porcelain | grep . ; then
    echo >&2 Warning: git status not empty before doing a release
fi

if [[ "$(git rev-parse origin/master)" != "$(git rev-parse master)" ]]; then
    echo >&2 Warning: git branch not merged: origin/master != master
fi

if [[ "$(git rev-parse origin/self-contained)" != "$(git rev-parse self-contained)" ]]; then
    echo >&2 Warning: git branch not  merged: origin/self-contained != self-contained
fi

BUILDDIR=$(mktemp -d ./build-XXXXX)
echo Building in $BUILDDIR
cd $BUILDDIR
git clone -b master .. .
$NPM install
$NPM run build
cp public/code.js ..
cp public/style.css ..
<public/index.html sed s/VERZS/$(git rev-parse HEAD)/g >../index.html
cd ..
rm -rf $BUILDDIR
