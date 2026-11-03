#!/usr/bin/env bash

set -u

echo "===================================="
echo " DevOps Server Health Report"
echo "===================================="
date
echo

echo "---- CPU Load and Uptime ----"
uptime
echo

echo "---- Memory and Swap ----"
free -h
echo

echo "---- Root Disk Usage ----"
df -h /
echo

echo "---- Docker Containers ----"
docker ps --format 'table {{.Names}}\t{{.Status}}'
echo

echo "---- Container Resource Usage ----"
docker stats --no-stream
echo

echo "---- API Health ----"
if curl --max-time 5 -fsS http://127.0.0.1:3000/health; then
    echo
    echo "API_CHECK=PASS"
else
    echo "API_CHECK=FAIL"
fi

echo
echo "===================================="
echo " Health Report Complete"
echo "===================================="
