"""
Test file to demonstrate OpenAI integration with VS Code.

Includes simple utilities that can be executed locally without any additional
setup so the integration can be exercised quickly.
"""

from statistics import mean, median, pvariance
from typing import Iterable, List


def calculate_fibonacci(n: int) -> List[int]:
    """Return the first n Fibonacci numbers starting with 0, 1."""
    if not isinstance(n, int):
        raise TypeError("n must be an integer")
    if n < 0:
        raise ValueError("n must be non-negative")
    if n == 0:
        return []
    if n ==
        return [0]

    sequence = [0, 1]
    for _ in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence


def analyze_data(data: Iterable[float]):
    """
    Produce simple summary statistics for a numeric iterable.

    Returns a dict with count, sum, mean, median, min, max, and variance.
    """
    values = list(data)
    if not values:
        raise ValueError("data must contain at least one numeric value")

    # Validate that all entries are numeric to avoid surprising failures later.
    for item in values:
        if not isinstance(item, (int, float)):
            raise TypeError("data must contain only int or float values")

    return {
        "count": len(values),
        "sum": sum(values),
        "mean": mean(values),
        "median": median(values),
        "min": min(values),
        "max": max(values),
        "variance": pvariance(values) if len(values) > 1 else 0.0,
    }


if __name__ == "__main__":
    print("Testing OpenAI integration...")
    print("First 10 Fibonacci numbers:", calculate_fibonacci(10))
    sample = [1, 5, 8, 10, 12]
    print("Sample data:", sample)
    print("Summary:", analyze_data(sample))
