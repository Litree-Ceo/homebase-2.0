# Chapter 6: Coding Conventions

## 6.1. Python Conventions

- **Formatting**: All Python code must adhere to PEP 8, with a maximum line length of 120 characters.
- **Type Hinting**: Type annotations must be used for all function signatures and variable declarations where practical.
- **Docstrings**: All public modules, classes, and functions must have Google-style docstrings.
- **Imports**: Imports should be grouped in the following order: standard library, third-party, local application. They must be sorted alphabetically within each group.
- **Naming**:
  - `snake_case` for functions, variables, and modules.
  - `PascalCase` for classes.
  - `UPPER_CASE` for constants.

## 6.2. JavaScript Conventions

- **Style**: All JavaScript code should be written using ES6+ features where possible.
- **Formatting**: 4-space indentation is required.
- **Quotes**: Single quotes (`'`) are to be used for all strings.
- **Semicolons**: Semicolons are required at the end of all statements.
- **Naming**:
  - `camelCase` for variables and functions.
  - `PascalCase` for classes.
  - `UPPER_CASE` for constants.

## 6.3. CSS Conventions

- **Naming**: A BEM-like naming convention (`.component__element--modifier`) must be used for all CSS classes.
- **Organization**: Styles should be grouped by component, with properties ordered logically within each rule.
- **Variables**: CSS custom properties must be used for all theme-related values (colors, fonts, etc.).
