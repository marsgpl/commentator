#!/bin/zsh

SSH_USERNAME="commentator"
SERVICE="$1"

echo "Restarting ${SERVICE} ..."
    ssh "${SSH_USERNAME}@marsgpl" "docker-compose up -d --build --force-recreate ${SERVICE}" || exit 1
echo "OK"
