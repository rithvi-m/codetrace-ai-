import unittest
from app.core.normalization import normalize_code_pipeline
from app.core.token_similarity import compute_token_similarity
from app.core.ast_analysis import extract_ast_features, compare_ast_structures
from app.core.semantic_similarity import compute_semantic_similarity
from app.core.risk_engine import calculate_multi_signal_risk, compute_behavioral_score
from app.core.evaluation import evaluate_benchmark_suite

class TestCodeTraceCore(unittest.TestCase):
    def test_normalization_renaming(self):
        code_a = "total = price + tax\nprint(total)"
        code_b = "amount = cost + gst\nprint(amount)"

        norm_a, tokens_a, hash_a = normalize_code_pipeline(code_a, "python")
        norm_b, tokens_b, hash_b = normalize_code_pipeline(code_b, "python")

        # Normalized code should match after variable renaming
        self.assertEqual(norm_a, norm_b)
        self.assertEqual(hash_a, hash_b)

    def test_ast_feature_extraction(self):
        code = """def two_sum(nums, target):
    seen = {}
    for idx, val in enumerate(nums):
        if (target - val) in seen:
            return [seen[target - val], idx]
        seen[val] = idx
    return []
"""
        feats = extract_ast_features(code, "python")
        self.assertEqual(feats["functions"], 1)
        self.assertEqual(feats["loops"], 1)
        self.assertEqual(feats["conditionals"], 1)
        self.assertEqual(feats["returns"], 2)

    def test_evaluation_benchmark_suite(self):
        res = evaluate_benchmark_suite()
        self.assertIn("codetrace_ai", res)
        self.assertIn("naive_text_matching", res)
        self.assertGreater(res["codetrace_ai"]["metrics"]["accuracy"], res["naive_text_matching"]["metrics"]["accuracy"])

if __name__ == "__main__":
    unittest.main()

