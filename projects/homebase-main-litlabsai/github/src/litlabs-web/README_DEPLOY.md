# Litlabs Web Deployment (Azure)

This project is now set up for Azure Static Web Apps and Azure Functions.

## Build & Deploy

1. Install dependencies:
   ```sh
   npm install
   ```
2. Build (if needed):
   ```sh
   npm run build
   ```
3. Deploy:
   - Use the Azure Static Web Apps workflow in the Azure Portal, or
   - Use the Azure CLI:
     ```sh
     az staticwebapp create ...
     ```

## Local Development

- Start local server:
  ```sh
  npm run dev
  ```

## Notes

- The `public/index.html` file is the main entry for hosting.
- Azure Functions are in the `api/` directory.
- Remove any remaining Firebase-specific files or configs if not needed.
