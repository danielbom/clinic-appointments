#!/usr/bin/env bash

set -euo pipefail

ARGS=(-t4 -c100 -d30s --latency)

echo "NodeJS /api/health/live"
wrk "${ARGS[@]}" http://localhost:3000/api/health/live
echo ""

echo "NodeJS /api/health/ready"
curl -s http://localhost:3000/api/health/ready > /dev/null
wrk "${ARGS[@]}" http://localhost:3000/api/health/ready
echo ""


echo "Bun /api/health/live"
wrk "${ARGS[@]}" http://localhost:4000/api/health/live
echo ""

echo "Bun /api/health/ready"
curl -s http://localhost:4000/api/health/ready > /dev/null
wrk "${ARGS[@]}" http://localhost:4000/api/health/ready
echo ""


echo "Golang /api/health/live"
wrk "${ARGS[@]}" http://localhost:8080/api/health/live
echo ""

echo "Golang /api/health/ready"
curl -s http://localhost:8080/api/health/ready > /dev/null
wrk "${ARGS[@]}" http://localhost:8080/api/health/ready
echo ""
