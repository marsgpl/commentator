#!/bin/zsh

SSH_USERNAME="commentator"

echo "Uploading files to prod ..."
    rsync -rv release/* root@marsgpl:/var/www/eki.one/cmnt/ || exit 1
    rsync -rv ogimg root@marsgpl:/var/www/eki.one/cmnt/ || exit 1
echo "OK"
