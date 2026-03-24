#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@bpbd.go.id", "password":"admin123"}' | jq -r .data.token)

echo "Token: $TOKEN"

curl -s -X GET http://localhost:5000/api/v1/master-data -H "Authorization: Bearer $TOKEN"
