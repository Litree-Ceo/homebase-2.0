# Cooking AI Agent

A comprehensive interactive cooking AI assistant powered by Microsoft Agent Framework and GitHub Models.

## Features

✨ **Recipe Search & Discovery**

- Search recipes by name or ingredients
- Browse available recipes in the database
- Get detailed ingredient lists and instructions

🧑‍🍳 **Ingredient Extraction**

- Parse recipe text and extract ingredients
- Organize ingredients with quantities and units
- Handle various ingredient formats

📚 **Cooking Knowledge**

- Detailed recipe instructions with timing
- Cooking tips for different techniques (pasta, stir-fry, baking)
- Professional cooking advice

💬 **Interactive Console**

- Multi-turn conversation support
- Natural language understanding
- Helpful suggestions and guidance

## Quick Start

### 1. Installation

```bash
# Navigate to the project directory
cd python-agents/cooking-agent

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies with --pre flag (required for Agent Framework)
pip install -r requirements.txt

# Note: If pip install fails, install the main package separately:
# pip install agent-framework-azure-ai --pre
```

### 2. Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your GitHub token:
# GITHUB_TOKEN=your_github_token_here
```

**Getting a GitHub Token:**

1. Visit: https://github.com/settings/tokens?type=beta
2. Click "Generate new token (beta)"
3. Give it a descriptive name
4. Select appropriate permissions (at minimum, access to GitHub Models)
5. Copy the token and paste it in your `.env` file

### 3. Run the Agent

```bash
python main.py
```

## Usage Examples

### Search for Recipes

```
You: search for pasta recipes
Assistant: Found 1 recipe(s):
📖 **Pasta Carbonara**
   ⏱️ Prep: 10 minutes, Cook: 20 minutes
   🍽️ Servings: 4
```

### Get Recipe Details

```
You: show me the carbonara recipe
Assistant: ## Pasta Carbonara

⏱️ Prep Time: 10 minutes
🔥 Cook Time: 20 minutes
🍽️ Servings: 4

### Ingredients:
- 400g spaghetti
- 200g guanciale or bacon
- 4 large eggs
...
```

### Extract Ingredients

```
You: extract ingredients from "2 cups flour, 1 tsp baking soda, 1/2 cup butter"
Assistant: Extracted ingredients:
- 2 cups flour
- 1 tsp baking soda
- 1/2 cup butter
```

### Get Cooking Tips

```
You: give me pasta cooking tips
Assistant: ### Cooking Tips for Pasta:
💡 Salt your pasta water generously - it should taste like sea water
💡 Save pasta water for finishing sauces - starch helps emulsify
...
```

### List All Recipes

```
You: what recipes do you have?
Assistant: Available recipes in database:
• Pasta Carbonara
• Vegetable Stir Fry
• Chocolate Chip Cookies

Total: 3 recipes
```

## Command Reference

| Command             | Example                                  |
| ------------------- | ---------------------------------------- |
| Search recipes      | `search for [ingredient/dish name]`      |
| Get recipe          | `show me the [recipe name] recipe`       |
| Extract ingredients | `extract ingredients from [recipe text]` |
| List recipes        | `what recipes do you have?`              |
| Cooking tips        | `[topic] cooking tips`                   |
| Help                | `help`                                   |
| Quit                | `quit` or `exit`                         |

## Architecture

### Components

**main.py** - Main agent application

- `CookingAIAgent`: Main agent class
- Handles conversation flow and tool calling
- Manages conversation history

**cooking_tools.py** - Cooking functionality

- `CookingToolbox`: Core cooking features
- `RecipeDatabase`: Recipe storage and search
- `IngredientExtractor`: Ingredient parsing

**requirements.txt** - Python dependencies

- `agent-framework-azure-ai`: Microsoft Agent Framework
- `python-dotenv`: Environment variable management

### Data Flow

```
User Input
    ↓
[Conversation Parser]
    ↓
[Tool Selection Logic]
    ↓
[Execute Tool]
    ↓
[Format Response]
    ↓
User Output
```

## Sample Recipes Included

1. **Pasta Carbonara** - Classic Italian pasta
   - Prep: 10 min | Cook: 20 min | Serves: 4

2. **Vegetable Stir Fry** - Quick and healthy
   - Prep: 15 min | Cook: 10 min | Serves: 2

3. **Chocolate Chip Cookies** - Classic dessert
   - Prep: 15 min | Cook: 12 min | Serves: 24

## Extending the Agent

### Add New Recipes

Edit `cooking_tools.py` and add recipes to the `_load_sample_recipes()` method:

```python
"new_recipe": Recipe(
    name="Recipe Name",
    ingredients=[...],
    instructions=[...],
    prep_time="X minutes",
    cook_time="Y minutes",
    servings=4
)
```

### Add New Tools

1. Create a new method in `CookingToolbox`
2. Add tool schema in `CookingAIAgent.setup_tools()`
3. Handle the tool call in `process_tool_call()`

### Connect to Real LLM

To use the full Microsoft Agent Framework capabilities with GitHub Models:

```python
from azure.ai.agent import Agent
from azure.ai.projects import AIProjectClient

# Create agent with GitHub Models
agent = Agent(
    name="Cooking Assistant",
    model="gpt-4o-mini",
    api_key=github_token,
    api_base="https://models.inference.ai.azure.com"
)
```

## Troubleshooting

### "Agent Framework not installed"

```bash
pip install agent-framework-azure-ai --pre
```

Note: The `--pre` flag is required as it's in preview.

### "GitHub token not configured"

1. Check your `.env` file has `GITHUB_TOKEN` set
2. Verify token is valid and has appropriate permissions
3. Visit: https://github.com/settings/tokens?type=beta

### Import errors

```bash
# Clear pip cache and reinstall
pip install --upgrade --force-reinstall agent-framework-azure-ai --pre
```

## Future Enhancements

- 🔄 Multi-turn conversation with context awareness
- 🌐 Integration with real recipe APIs
- 👥 User preferences and dietary restrictions
- 📊 Nutrition calculation
- 🛒 Shopping list generation
- 🎥 Video recipe links
- ⭐ Recipe ratings and reviews
- 🔄 Recipe scaling by servings

## License

Part of Labs-Ai project

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the sample recipes and examples
3. Check GitHub Issues in the main Labs-Ai repo
