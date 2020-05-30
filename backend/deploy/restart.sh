#!/bin/zsh

SERVICE="$1"

echo "docker recreate $SERVICE ..."
    ssh commentator@marsgpl "docker-compose up -d --force-recreate $SERVICE" || exit 1
echo "OK"
