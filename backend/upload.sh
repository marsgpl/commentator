#!/bin/zsh

echo "upload files to prod vds ..."
    rsync -rv upload/home commentator@marsgpl:/ || exit 1
echo "OK"
