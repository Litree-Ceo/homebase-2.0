# Project Consolidation

I have been tasked with consolidating the project into a single folder. Due to security restrictions, I am unable to move the directories myself. However, I have updated the necessary configuration files to reflect the new structure.

Please follow the instructions below to complete the consolidation.

## 1. Move the directories

I have created a `src` directory to house the core application code. Please move the following directories into the `src` directory:

```bash
git mv api src/api
git mv apps src/apps
git mv functions src/functions
git mv infra src/infra
git mv packages src/packages
```

## 2. Review the changes

After moving the directories, the project structure will be as follows:

```
.
├── src
│   ├── api
│   ├── apps
│   ├── functions
│   ├── infra
│   └── packages
├── ... (other configuration files)
└── pnpm-workspace.yaml
```

I have already updated the `pnpm-workspace.yaml` to reflect this new structure.

## 3. Install dependencies

After moving the directories, you will need to reinstall the dependencies.

```bash
pnpm install
```

After these steps, your project will be consolidated and ready to use.
