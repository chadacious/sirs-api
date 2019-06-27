SIRScale website api

## Docker build command
docker build -t chadicus/sirs-api:0.1.11.2 . --build-arg NPM_TOKEN=19b70e4a-92ba-4f6b-a711-b4684277af4f
docker push chadicus/sirs-api:0.1.11.2

kubectl set image deployment/sirs-api sirs-api=chadicus/sirs-api:0.1.11.2