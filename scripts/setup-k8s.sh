#!/bin/bash

echo "Setting up Faasock on Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create OpenWhisk auth secret
kubectl create secret generic openwhisk-auth  --from-literal=auth="23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP"  -n faasock

# Build and deploy WebSocket server
cd websocket-server
docker build -t faasock/websocket-server:latest .
docker tag faasock/websocket-server:latest localhost:5000/faasock/websocket-server:latest
docker push localhost:5000/faasock/websocket-server:latest

# Deploy to Kubernetes
kubectl apply -f ../k8s/websocket-deployment.yaml
kubectl apply -f ../k8s/websocket-service.yaml

echo "Faasock deployed to Kubernetes!"
echo "Check status with: kubectl get pods -n faasock"
