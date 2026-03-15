import os

content = r'''"""
Unit tests for the Cooking AI Agent
Run with: python -m pytest test_cooking_agent.py
"""

import pytest
from cooking_tools import (
    Recipe, IngredientInfo, RecipeDatabase, 
    IngredientExtractor, CookingToolbox
)


class TestRecipeDatabase:
    """Test recipe database functionality"""
    
    def test_database_loads_samples(self):
        """Test that database loads sample recipes"""
        db = RecipeDatabase()
        recipes = db.list_all_recipes()
        assert len(recipes) >= 3
        assert any(r.name == "Pasta Carbonara" for r in recipes)
    
    def test_search_by_name(self):
        """Test searching recipes by name"""
        db = RecipeDatabase()
        results = db.search_recipes("carbonara")
        assert len(results) > 0
        assert any("Carbonara" in r.name for r in results)
    
    def test_search_by_ingredient(self):
        """Test searching recipes by ingredient"""
        db = RecipeDatabase()
        results = db.search_recipes("chocolate")
        assert len(results) > 0
    
    def test_search_no_results(self):
        """Test search with no results"""
        db = RecipeDatabase()
        results = db.search_recipes("nonexistent_dish_xyz")
        assert len(results) == 0
    
    def test_get_recipe(self):
        """Test retrieving specific recipe"""
        db = RecipeDatabase()
        recipe = db.get_recipe("pasta_carbonara")
        assert recipe is not None
        assert recipe.name == "Pasta Carbonara"


class TestIngredientExtractor:
    """Test ingredient extraction functionality"""
    
    def test_extract_simple_ingredients(self):
        """Test extracting simple ingredients"""
        text = "2 cups flour\n1 tsp salt\n3 eggs"
        ingredients = IngredientExtractor.extract_ingredients(text)
        assert len(ingredients) == 3
        assert any(i.name == "flour" for i in ingredients)
    
    def test_extract_with_units(self):
        """Test extracting ingredients with various units"""
        text = "2 cups flour\n100g butter\n5 tbsp sugar"
        ingredients = IngredientExtractor.extract_ingredients(text)
        assert len(ingredients) == 3
        assert any(i.unit == "g" for i in ingredients)
        assert any(i.unit == "tbsp" for i in ingredients)
    
    def test_extract_with_notes(self):
        """Test extracting ingredients with preparation notes"""
        text = "2 cups flour, sifted\n1 cup butter, softened"
        ingredients = IngredientExtractor.extract_ingredients(text)
        assert len(ingredients) == 2
        assert any("sifted" in i.notes for i in ingredients)
    
    def test_parse_ingredient_line(self):
        """Test parsing a single ingredient line"""
        line = "2 cups flour, sifted"
        ingredient = IngredientExtractor._parse_ingredient_line(line)
        assert ingredient.quantity == "2"
        assert ingredient.unit == "cups"
        assert ingredient.name == "flour"
        assert ingredient.notes == "sifted"
    
    def test_format_ingredients(self):
        """Test formatting ingredients for display"""
        ingredients = [
            IngredientInfo(name="flour", quantity="2", unit="cups"),
            IngredientInfo(name="butter", quantity="1", unit="cup", notes="softened")
        ]
        formatted = IngredientExtractor.format_ingredients(ingredients)
        assert "2 cups flour" in formatted
        assert "softened" in formatted


class TestCookingToolbox:
    """Test cooking toolbox functionality"""
    
    def test_search_recipes(self):
        """Test recipe search through toolbox"""
        toolbox = CookingToolbox()
        result = toolbox.search_recipes("pasta")
        assert "Found" in result or "recipe" in result.lower()

    def test_search_recipes_fallback_tag(self):
        """Test recipe search fallback on tag"""
        toolbox = CookingToolbox()
        # Assuming search_recipes handles tags as well
        result = toolbox.search_recipes("vegan")
        assert result
    
    def test_get_recipe_details(self):
        """Test getting recipe details"""
        toolbox = CookingToolbox()
        result = toolbox.get_recipe_details("Pasta Carbonara")
        assert "Pasta Carbonara" in result
        assert "Ingredients" in result
        assert "Instructions" in result
    
    def test_extract_ingredients(self):
        """Test extracting ingredients through toolbox"""
        toolbox = CookingToolbox()
        text = "2 cups flour\n1 tsp baking soda"
        result = toolbox.extract_ingredients_from_text(text)
        assert "flour" in result.lower()
        assert "baking soda" in result.lower()
    
    def test_list_available_recipes(self):
        """Test listing all recipes"""
        toolbox = CookingToolbox()
        result = toolbox.list_available_recipes()
        assert "Available recipes" in result
        assert "Carbonara" in result or "pasta" in result.lower()
    
    def test_cooking_tips_pasta(self):
        """Test getting cooking tips for pasta"""
        toolbox = CookingToolbox()
        result = toolbox.get_cooking_tips("pasta")
        assert "salt" in result.lower()
        assert "💡" in result
    
    def test_cooking_tips_default(self):
        """Test getting default cooking tips"""
        toolbox = CookingToolbox()
        result = toolbox.get_cooking_tips("unknown")
        assert "💡" in result

    def test_handle_request_help(self):
        """Test that unknown commands return help"""
        toolbox = CookingToolbox()
        if hasattr(toolbox, 'handle_request'):
            result = toolbox.handle_request("unknown command")
            assert "help" in str(result).lower()


class TestRecipe:
    """Test recipe data structure"""
    
    def test_recipe_creation(self):
        """Test creating a recipe object"""
        recipe = Recipe(
            name="Test Recipe",
            ingredients=["flour", "butter"],
            instructions=["Mix", "Bake"]
        )
        assert recipe.name == "Test Recipe"
        assert len(recipe.ingredients) == 2
        assert recipe.servings == 4  # Default
    
    def test_recipe_with_timing(self):
        """Test recipe with timing information"""
        recipe = Recipe(
            name="Quick Recipe",
            ingredients=["salt"],
            instructions=["Cook"],
            prep_time="5 minutes",
            cook_time="10 minutes"
        )
        assert recipe.prep_time == "5 minutes"
        assert recipe.cook_time == "10 minutes"


# Integration tests
class TestIntegration:
    """Integration tests for the agent"""
    
    def test_full_recipe_lookup_flow(self):
        """Test complete recipe lookup flow"""
        toolbox = CookingToolbox()
        
        # Search
        search_result = toolbox.search_recipes("carbonara")
        assert "Found" in search_result
        
        # Get details
        details = toolbox.get_recipe_details("Pasta Carbonara")
        assert "Carbonara" in details
        assert "guanciale" in details or "bacon" in details
    
    def test_ingredient_extraction_flow(self):
        """Test complete ingredient extraction flow"""
        toolbox = CookingToolbox()
        
        recipe_text = """
        Ingredients:
        - 2 cups flour
        - 1 tsp salt
        - 100g butter, melted
        """
        
        result = toolbox.extract_ingredients_from_text(recipe_text)
        assert "flour" in result.lower()
        assert "salt" in result.lower()
        assert "butter" in result.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
'''

with open('python-agents/cooking-agent/test_cooking_agent.py', 'w', encoding='utf-8') as f:
    f.write(content)
