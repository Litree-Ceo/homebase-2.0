"""
Cooking AI Agent using Microsoft Agent Framework
Interactive cooking assistant with recipe search and ingredient extraction
"""

import json
import re
from typing import Any
from dataclasses import dataclass


@dataclass
class Recipe:
    """Recipe data structure"""
    name: str
    ingredients: list[str]
    instructions: list[str]
    prep_time: str = "Unknown"
    cook_time: str = "Unknown"
    servings: int = 4


@dataclass
class IngredientInfo:
    """Ingredient information"""
    name: str
    quantity: str
    unit: str
    notes: str = ""


class RecipeDatabase:
    """In-memory recipe database with search capabilities"""
    
    def __init__(self):
        self.recipes = self._load_sample_recipes()
    
    def _load_sample_recipes(self) -> dict[str, Recipe]:
        """Load sample recipes for demonstration"""
        return {
            "pasta_carbonara": Recipe(
                name="Pasta Carbonara",
                ingredients=[
                    "400g spaghetti",
                    "200g guanciale or bacon",
                    "4 large eggs",
                    "100g Pecorino Romano cheese",
                    "Black pepper to taste",
                    "Salt for pasta water"
                ],
                instructions=[
                    "Bring a large pot of salted water to boil",
                    "Cut guanciale into small cubes and fry until crispy",
                    "Cook spaghetti according to package directions",
                    "Beat eggs with grated cheese and black pepper",
                    "Drain pasta, reserving 1 cup pasta water",
                    "Toss hot pasta with guanciale and fat",
                    "Remove from heat, add egg mixture, toss quickly",
                    "Add pasta water as needed for creamy consistency"
                ],
                prep_time="10 minutes",
                cook_time="20 minutes",
                servings=4
            ),
            "vegetable_stir_fry": Recipe(
                name="Vegetable Stir Fry",
                ingredients=[
                    "2 cups broccoli florets",
                    "1 bell pepper, sliced",
                    "2 carrots, julienned",
                    "1 cup mushrooms, sliced",
                    "3 cloves garlic, minced",
                    "2 tbsp soy sauce",
                    "1 tbsp sesame oil",
                    "1 tbsp cornstarch",
                    "2 tbsp vegetable oil",
                    "Ginger to taste"
                ],
                instructions=[
                    "Mix soy sauce, sesame oil, and cornstarch in a bowl",
                    "Heat wok or large pan over high heat",
                    "Add oil and heat until smoking",
                    "Stir-fry harder vegetables first (carrots, broccoli)",
                    "Add softer vegetables and garlic",
                    "Pour sauce mixture and toss to coat",
                    "Cook until vegetables are tender-crisp",
                    "Serve immediately over rice"
                ],
                prep_time="15 minutes",
                cook_time="10 minutes",
                servings=2
            ),
            "chocolate_chip_cookies": Recipe(
                name="Chocolate Chip Cookies",
                ingredients=[
                    "2 1/4 cups all-purpose flour",
                    "1 tsp baking soda",
                    "1 tsp salt",
                    "1 cup softened butter",
                    "3/4 cup granulated sugar",
                    "3/4 cup packed brown sugar",
                    "2 large eggs",
                    "2 tsp vanilla extract",
                    "2 cups chocolate chips"
                ],
                instructions=[
                    "Preheat oven to 375°F",
                    "Mix flour, baking soda, and salt",
                    "Beat butter and sugars until creamy",
                    "Add eggs and vanilla to butter mixture",
                    "Gradually blend in flour mixture",
                    "Stir in chocolate chips",
                    "Drop rounded tbsp onto ungreased cookie sheets",
                    "Bake 9-12 minutes or until golden brown"
                ],
                prep_time="15 minutes",
                cook_time="12 minutes",
                servings=24
            )
        }
    
    def search_recipes(self, query: str) -> list[Recipe]:
        """Search recipes by name or ingredients"""
        query = query.lower()
        results = []
        
        for recipe in self.recipes.values():
            # Search by recipe name
            if query in recipe.name.lower():
                results.append(recipe)
            # Search by ingredients
            elif any(query in ingredient.lower() for ingredient in recipe.ingredients):
                results.append(recipe)
        
        return results
    
    def get_recipe(self, recipe_id: str) -> Recipe | None:
        """Get a specific recipe by ID"""
        return self.recipes.get(recipe_id)
    
    def list_all_recipes(self) -> list[Recipe]:
        """List all available recipes"""
        return list(self.recipes.values())


class IngredientExtractor:
    """Extract and parse ingredient information from text"""
    
    # Common units of measurement
    UNITS = {
        'g', 'kg', 'mg', 'oz', 'lb', 'ml', 'l', 'tsp', 'tbsp',
        'cup', 'cups', 'pint', 'quart', 'gallon', 'pinch', 'dash',
        'clove', 'cloves', 'slice', 'slices', 'piece', 'pieces',
        'can', 'jar', 'package'
    }
    
    @classmethod
    def extract_ingredients(cls, text: str) -> list[IngredientInfo]:
        """Extract ingredients from recipe text"""
        ingredients = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try to parse ingredient line
            ingredient = cls._parse_ingredient_line(line)
            if ingredient:
                ingredients.append(ingredient)
        
        return ingredients
    
    @classmethod
    def _parse_ingredient_line(cls, line: str) -> IngredientInfo | None:
        """Parse a single ingredient line"""
        # Remove common prefixes
        line = re.sub(r'^[-•*]\s*', '', line).strip()
        
        # Try to match: quantity unit ingredient (notes)
        # Example: "2 cups flour, sifted"
        pattern = r'(\d+(?:\s*[/-]\s*\d+)?)\s*([a-z]*)\s+(.+?)(?:\s*,\s*(.+))?$'
        match = re.match(pattern, line, re.IGNORECASE)
        
        if match:
            quantity = match.group(1)
            unit = match.group(2).lower() if match.group(2) else ""
            name = match.group(3).strip()
            notes = match.group(4).strip() if match.group(4) else ""
            
            return IngredientInfo(
                name=name,
                quantity=quantity,
                unit=unit,
                notes=notes
            )
        
        # Fallback: treat entire line as ingredient name
        return IngredientInfo(
            name=line,
            quantity="1",
            unit="",
            notes=""
        )
    
    @classmethod
    def format_ingredients(cls, ingredients: list[IngredientInfo]) -> str:
        """Format ingredients for display"""
        lines = []
        for ing in ingredients:
            parts = [ing.quantity]
            if ing.unit:
                parts.append(ing.unit)
            parts.append(ing.name)
            if ing.notes:
                parts.append(f"({ing.notes})")
            lines.append(" ".join(parts))
        return "\n".join(lines)


class CookingToolbox:
    """Tools for the cooking AI agent"""
    
    def __init__(self):
        self.recipe_db = RecipeDatabase()
        self.extractor = IngredientExtractor()
    
    def search_recipes(self, query: str) -> str:
        """Search for recipes"""
        recipes = self.recipe_db.search_recipes(query)
        
        if not recipes:
            return f"No recipes found for '{query}'. Try searching for common ingredients or dish names."
        
        result = f"Found {len(recipes)} recipe(s):\n\n"
        for recipe in recipes:
            result += f"📖 **{recipe.name}**\n"
            result += f"   ⏱️  Prep: {recipe.prep_time}, Cook: {recipe.cook_time}\n"
            result += f"   🍽️  Servings: {recipe.servings}\n\n"
        
        return result
    
    def get_recipe_details(self, recipe_name: str) -> str:
        """Get full recipe details"""
        # Find recipe by name
        for recipe in self.recipe_db.list_all_recipes():
            if recipe_name.lower() in recipe.name.lower():
                return self._format_recipe(recipe)
        
        return f"Recipe '{recipe_name}' not found."
    
    def _format_recipe(self, recipe: Recipe) -> str:
        """Format recipe for display"""
        result = f"## {recipe.name}\n\n"
        result += f"⏱️  Prep Time: {recipe.prep_time}\n"
        result += f"🔥 Cook Time: {recipe.cook_time}\n"
        result += f"🍽️  Servings: {recipe.servings}\n\n"
        
        result += "### Ingredients:\n"
        for ingredient in recipe.ingredients:
            result += f"- {ingredient}\n"
        
        result += "\n### Instructions:\n"
        for i, instruction in enumerate(recipe.instructions, 1):
            result += f"{i}. {instruction}\n"
        
        return result
    
    def extract_ingredients_from_text(self, text: str) -> str:
        """Extract ingredients from provided text"""
        ingredients = self.extractor.extract_ingredients(text)
        
        if not ingredients:
            return "Could not extract any ingredients from the provided text."
        
        result = "Extracted ingredients:\n\n"
        result += self.extractor.format_ingredients(ingredients)
        return result
    
    def list_available_recipes(self) -> str:
        """List all available recipes"""
        recipes = self.recipe_db.list_all_recipes()
        
        result = "Available recipes in database:\n\n"
        for recipe in recipes:
            result += f"• {recipe.name}\n"
        
        result += f"\nTotal: {len(recipes)} recipes"
        return result
    
    def get_cooking_tips(self, topic: str) -> str:
        """Provide cooking tips based on topic"""
        tips = {
            "pasta": [
                "Salt your pasta water generously - it should taste like sea water",
                "Save pasta water for finishing sauces - starch helps emulsify",
                "Don't rinse pasta after cooking unless making a cold salad",
                "Add pasta to boiling water, not cold water",
                "Cook to al dente for best texture"
            ],
            "stir-fry": [
                "Prepare all ingredients before heating the pan",
                "Use high heat to cook vegetables quickly",
                "Don't overcrowd the pan - cook in batches if needed",
                "Start with harder vegetables, add softer ones later",
                "Keep constant movement to prevent burning"
            ],
            "baking": [
                "Room temperature ingredients mix better",
                "Don't overmix batter once flour is added",
                "Measure dry ingredients by weight for accuracy",
                "Preheat your oven for at least 15 minutes",
                "Use oven thermometer to verify temperature"
            ],
            "general": [
                "Mise en place: prepare and measure everything before cooking",
                "Taste as you cook and adjust seasonings",
                "Use sharp knives for safer, cleaner cuts",
                "Let meat rest after cooking",
                "Don't open oven door frequently - affects temperature"
            ]
        }
        
        topic = topic.lower()
        topic_tips = tips.get(topic, tips["general"])
        
        result = f"### Cooking Tips for {topic.title()}:\n\n"
        for tip in topic_tips:
            result += f"💡 {tip}\n"
        
        return result
