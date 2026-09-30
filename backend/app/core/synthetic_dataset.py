from typing import List, Dict, Any

SYNTHETIC_BENCHMARK_CASES = [
    {
        "id": "case_1",
        "title": "Case 1 — Genuinely Original Solutions",
        "description": "Two distinct algorithmic approaches to solve Two Sum (Hash map vs Brute Force).",
        "expected_risk": "Low Similarity",
        "expected_flag": False,
        "student_a": {
            "name": "Alice Chen",
            "student_id": "STU-1001",
            "code": """def two_sum(nums, target):
    # Hash map approach for O(N) lookup
    seen = {}
    for idx, val in enumerate(nums):
        diff = target - val
        if diff in seen:
            return [seen[diff], idx]
        seen[val] = idx
    return []
"""
        },
        "student_b": {
            "name": "Bob Smith",
            "student_id": "STU-1002",
            "code": """def two_sum(nums, target):
    # Brute force nested loop approach
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return None
"""
        }
    },
    {
        "id": "case_2",
        "title": "Case 2 — Variable Renaming (Subtle Copying)",
        "description": "Identical execution logic with renamed variables and parameters.",
        "expected_risk": "Manual Review Recommended",
        "expected_flag": True,
        "student_a": {
            "name": "Charlie Davis",
            "student_id": "STU-1003",
            "code": """def calculate_total_tax(items, tax_rate):
    subtotal = 0
    for item in items:
        subtotal += item['price'] * item['quantity']
    total_tax = subtotal * tax_rate
    final_amount = subtotal + total_tax
    return final_amount
"""
        },
        "student_b": {
            "name": "Diana Evans",
            "student_id": "STU-1004",
            "code": """def compute_final_price(cart, vat_ratio):
    accumulated_cost = 0
    for element in cart:
        accumulated_cost += element['price'] * element['quantity']
    tax_value = accumulated_cost * vat_ratio
    net_cost = accumulated_cost + tax_value
    return net_cost
"""
        }
    },
    {
        "id": "case_3",
        "title": "Case 3 — Formatting & Comment Manipulations",
        "description": "Same core solution with whitespace, added docstrings, and reindented code.",
        "expected_risk": "Manual Review Recommended",
        "expected_flag": True,
        "student_a": {
            "name": "Ethan Hunt",
            "student_id": "STU-1005",
            "code": """def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
"""
        },
        "student_b": {
            "name": "Fiona Gallagher",
            "student_id": "STU-1006",
            "code": """def is_palindrome(s):
    # Comprehensive string normalization method
    cleaned = ""
    for char in s:
        if char.isalnum():
            cleaned += char.lower()
    
    # Reverse string check
    reversed_str = cleaned[::-1]
    if cleaned == reversed_str:
        return True
    return False
"""
        }
    },
    {
        "id": "case_4",
        "title": "Case 4 — Independent Statement Reordering",
        "description": "Reordering independent assignments and variable initializations.",
        "expected_risk": "High Similarity",
        "expected_flag": True,
        "student_a": {
            "name": "George Clark",
            "student_id": "STU-1007",
            "code": """def process_user_data(user_dict):
    age = user_dict.get('age', 0)
    name = user_dict.get('name', 'Guest')
    email = user_dict.get('email', '')
    is_adult = age >= 18
    formatted_name = name.strip().title()
    return {'name': formatted_name, 'adult': is_adult, 'email': email}
"""
        },
        "student_b": {
            "name": "Hannah Abbott",
            "student_id": "STU-1008",
            "code": """def process_user_data(user_dict):
    email = user_dict.get('email', '')
    name = user_dict.get('name', 'Guest')
    formatted_name = name.strip().title()
    age = user_dict.get('age', 0)
    is_adult = age >= 18
    return {'name': formatted_name, 'adult': is_adult, 'email': email}
"""
        }
    },
    {
        "id": "case_5",
        "title": "Case 5 — Algorithm Variants (Iterative vs Recursive)",
        "description": "Recursive vs Iterative Factorial implementations.",
        "expected_risk": "Low Similarity",
        "expected_flag": False,
        "student_a": {
            "name": "Ian Malcolm",
            "student_id": "STU-1009",
            "code": """def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
        },
        "student_b": {
            "name": "Julia Roberts",
            "student_id": "STU-1010",
            "code": """def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
"""
        }
    },
    {
        "id": "case_6",
        "title": "Case 6 — Modified Copy with Camouflage Code",
        "description": "Copied core loop with added unused print statements and extra variables.",
        "expected_risk": "High Similarity",
        "expected_flag": True,
        "student_a": {
            "name": "Kevin Bacon",
            "student_id": "STU-1011",
            "code": """def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
"""
        },
        "student_b": {
            "name": "Laura Croft",
            "student_id": "STU-1012",
            "code": """def binary_search(arr, target):
    # Camouflage print statement
    print("Searching array of size:", len(arr))
    start_pos = 0
    end_pos = len(arr) - 1
    
    while start_pos <= end_pos:
        middle = (start_pos + end_pos) // 2
        val = arr[middle]
        if val == target:
            print("Found target!")
            return middle
        elif val < target:
            start_pos = middle + 1
        else:
            end_pos = middle - 1
    return -1
"""
        }
    }
]
