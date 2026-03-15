# Cooking AI Agent - Development Guide

## Project Structure

```
python-agents/cooking-agent/
├── main.py                    # Main agent application
├── cooking_tools.py          # Cooking functionality and tools
├── test_cooking_agent.py     # Unit tests
├── setup.py                  # Setup and installation helper
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── .env                     # Your configuration (git-ignored)
├── README.md                # User guide
└── DEVELOPMENT.md           # This file
```

## Development Setup

### 1. Initial Setup

```bash
cd python-agents/cooking-agent

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run setup script
python setup.py

# Or install manually
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Add your GitHub token
# Get from: https://github.com/settings/tokens?type=beta
```

### 3. Run Tests

```bash
# Install test dependencies
pip install pytest

# Run tests
pytest test_cooking_agent.py -v

# Run specific test
pytest test_cooking_agent.py::TestRecipeDatabase::test_search_by_name -v
```

## Code Structure

### main.py - Agent Application

**Key Classes:**

- `CookingAIAgent`: Main agent orchestrator
  - `__init__()`: Initialize with tools and configuration
  - `chat()`: Process user messages
  - `run_interactive()`: Run console interface
  - `_init_agent()`: Set up GitHub Models connection
  - `_get_agent_response()`: Generate responses

**Key Methods:**

- `setup_tools()`: Define available tools for agent
- `process_tool_call()`: Execute tool calls
- `_generate_default_response()`: Fallback responses

### cooking_tools.py - Core Functionality

**Classes:**

1. **Recipe**
   - Data structure for recipes
   - Properties: name, ingredients, instructions, timing, servings

2. **RecipeDatabase**
   - In-memory recipe storage
   - Methods: `search_recipes()`, `get_recipe()`, `list_all_recipes()`
   - Extensible: add new recipes to `_load_sample_recipes()`

3. **IngredientInfo**
   - Data structure for ingredients
   - Properties: name, quantity, unit, notes

4. **IngredientExtractor**
   - Parse ingredient text
   - Methods: `extract_ingredients()`, `_parse_ingredient_line()`, `format_ingredients()`
   - Supports various units and formats

5. **CookingToolbox**
   - Main interface to cooking features
   - Methods:
     - `search_recipes(query)`: Search by name/ingredient
     - `get_recipe_details(name)`: Get full recipe
     - `extract_ingredients_from_text(text)`: Parse ingredients
     - `list_available_recipes()`: Show all recipes
     - `get_cooking_tips(topic)`: Get technique tips

## Adding Features

### Add a New Recipe

```python
# In cooking_tools.py, RecipeDatabase._load_sample_recipes()

"unique_id": Recipe(
    name="Recipe Name",
    ingredients=[
        "ingredient 1",
        "ingredient 2",
    ],
    instructions=[
        "Step 1",
        "Step 2",
    ],
    prep_time="X minutes",
    cook_time="Y minutes",
    servings=4
),
```

### Add a New Tool

1. **Add method to CookingToolbox**:

```python
def new_feature(self, param: str) -> str:
    """Docstring"""
    # Implementation
    return result
```

2. **Add tool schema in CookingAIAgent.setup_tools()**:

```python
{
    "name": "new_feature",
    "description": "What it does",
    "parameters": {
        "type": "object",
        "properties": {
            "param": {
                "type": "string",
                "description": "Parameter description"
            }
        },
        "required": ["param"]
    }
}
```

3. **Handle in process_tool_call()**:

```python
elif tool_name == "new_feature":
    return self.toolbox.new_feature(tool_input.get("param", ""))
```

### Add Cooking Tips

```python
# In CookingToolbox.get_cooking_tips()
tips = {
    "new_technique": [
        "Tip 1",
        "Tip 2",
    ],
    # ...
}
```

## Testing

### Run All Tests

```bash
pytest test_cooking_agent.py -v
```

### Run Specific Test Class

```bash
pytest test_cooking_agent.py::TestRecipeDatabase -v
```

### Run with Coverage

```bash
pip install pytest-cov
pytest test_cooking_agent.py --cov=. --cov-report=html
```

### Test Categories

1. **Unit Tests**
   - TestRecipeDatabase: Database operations
   - TestIngredientExtractor: Ingredient parsing
   - TestCookingToolbox: Tool functionality
   - TestRecipe: Data structures

2. **Integration Tests**
   - Full recipe lookup flow
   - Ingredient extraction flow

## GitHub Models Integration

### Current Implementation

- Uses simplified tool-calling approach
- Rule-based response selection
- Fallback to CookingToolbox methods

### Future: Full Agent Framework Integration

```python
from azure.ai.agent import Agent

# Create agent
agent = Agent(
    name="Cooking Assistant",
    model="gpt-4o-mini",
    api_key=github_token,
    api_base="https://models.inference.ai.azure.com"
)

# Define tools for agent
agent.tools.append(...)

# Execute with proper agentic loop
result = agent.execute(user_message)
```

## Debugging

### Enable Debug Mode

Set in `.env`:

```
DEBUG=true
```

Or programmatically:

```python
agent = CookingAIAgent()
agent.debug = True
```

### Common Issues

1. **Import Error: No module named 'azure.ai.agent'**

   ```bash
   pip install agent-framework-azure-ai --pre
   ```

2. **GitHub Token Invalid**
   - Verify token at: https://github.com/settings/tokens?type=beta
   - Check .env file formatting
   - Ensure token is not expired

3. **Recipe Not Found**
   - Check recipe ID in database
   - Recipe names are case-sensitive
   - Use search() instead for flexible matching

## Performance Considerations

- **Recipe Database**: In-memory, fast searches
- **Ingredient Parsing**: Regex-based, handles common formats
- **Agent Responses**: Instant for tool-based queries

### Optimization Ideas

- Cache parsed ingredients
- Index recipes by ingredients
- Batch ingredient parsing
- Pre-compile regex patterns

## Extending to Production

### 1. Connect Real API

```python
# Replace in-memory database with API calls
class RecipeDatabaseAPI(RecipeDatabase):
    async def search_recipes(self, query: str):
        # Call external API
        pass
```

### 2. Add Persistence

```python
# Store recipes in database
# Add user preferences
# Cache results
```

### 3. Scale Agent

```python
# Use async/await for I/O
# Add request queuing
# Implement rate limiting
# Add monitoring/logging
```

### 4. Enhanced NLP

```python
# Use full Agent Framework
# Multi-turn conversations
# Context awareness
# Semantic search
```

## Contributing

When adding new features:

1. Write tests first
2. Implement functionality
3. Update documentation
4. Test with real examples
5. Consider edge cases

## Resources

- **Microsoft Agent Framework**: https://github.com/microsoft/agent-framework
- **GitHub Models**: https://github.com/marketplace/models
- **Python Best Practices**: https://pep8.org/
- **Async Programming**: https://docs.python.org/3/library/asyncio.html
