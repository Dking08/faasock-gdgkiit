#!/bin/bash

set -e

echo "[1/6] Creating Kubernetes namespace..."

kubectl apply -f k8s/namespace.yaml

echo "[2/6] Creating OpenWhisk auth secret..."

kubectl create secret generic openwhisk-auth \
  --from-literal=auth="23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP" \
  -n faasock || echo "Secret already exists"

echo "[3/6] Building WebSocket server Docker image..."

cd websocket-server
docker build -t faasock/websocket-server:latest .

echo "[4/6] Tagging and pushing image to local registry..."

docker tag faasock/websocket-server:latest localhost:5000/faasock/websocket-server:latest
docker push localhost:5000/faasock/websocket-server:latest

echo "[5/6] Deploying WebSocket server to Kubernetes..."

cd ../
kubectl apply -f k8s/websocket-deployment.yaml
kubectl apply -f k8s/websocket-service.yaml

echo "[6/6] All done!"
echo "Use: kubectl get pods -n faasock"

