#!/bin/bash

echo "Deploying WhiskChat FaaS functions..."

cd faas-functions/clean-message
zip -r clean-message.zip .
wsk action create clean-message clean-message.zip --kind nodejs:default

cd ../analyze-sentiment
zip -r analyze-sentiment.zip .
wsk action create analyze-sentiment analyze-sentiment.zip --kind nodejs:default

echo "FaaS functions deployed successfully!"

# Test functions
echo "Testing functions..."
wsk action invoke clean-message --param message "You are an idiot" --result
wsk action invoke analyze-sentiment --param message "I love this app!" --result
