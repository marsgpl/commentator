#!/bin/zsh

SERVICE="mongo"

echo "docker recreate $SERVICE ..."
    ssh commentator@marsgpl "docker-compose up -d --build --force-recreate $SERVICE" || exit 1
echo "OK"
