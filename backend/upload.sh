#!/bin/zsh

SSH_USERNAME="commentator"

echo "Uploading files to prod ..."
    rsync -rv upload/home "${SSH_USERNAME}@marsgpl":/ || exit 1
echo "OK"
