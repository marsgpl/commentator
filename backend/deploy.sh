#!/bin/zsh

SSH_USERNAME="commentator"
CMD="$1"
SKIP_BUILD="$2" # any value to skip build

if [[ "$CMD" == "mongo" ]]; then
    ./deploy/restart.sh mongo || exit 1
elif [[ "$CMD" == "api" ]]; then
    if [[ -z "$SKIP_BUILD" ]]; then
        ./deploy/build-dart.sh api || exit 1
    fi
    ./deploy/restart.sh api || exit 1
else
    echo "unknown command: $CMD" 1>&2
    exit 1
fi
