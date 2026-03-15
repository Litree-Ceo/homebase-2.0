# Hello GKE App

Simple "Hello GKE" web application deployed on Google Kubernetes Engine.

## Files

- `server.js` - Express web server
- `package.json` - Node.js dependencies
- `Dockerfile` - Container image definition
- `deployment.yaml` - Kubernetes deployment and service
- `deploy.ps1` - Automated deployment script

## Quick Deploy

```powershell
# From hello-gke-app directory
.\deploy.ps1
```

## Manual Deploy (Alternative)

If the script fails, use Cloud Build directly:

```bash
# Build and push image
gcloud builds submit --tag us-central1-docker.pkg.dev/studio-6082148059-d1fec/hello-repo/hello-gke:v1

# Get cluster credentials
gcloud container clusters get-credentials LiTrees-Cluster --zone us-central1-c

# Update deployment with your project ID and deploy
sed -i "s/PROJECT_ID/studio-6082148059-d1fec/g" deployment.yaml
kubectl apply -f deployment.yaml

# Check status
kubectl get service hello-gke-service
```

## Why Cloud Build?

This solution uses **Google Cloud Build** instead of local `docker push` to avoid the "connection refused" network issues you encountered. Cloud Build runs on Google's servers, so it has direct access to Artifact Registry.
