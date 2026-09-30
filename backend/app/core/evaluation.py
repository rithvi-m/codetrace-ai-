import difflib
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.core.normalization import normalize_code_pipeline
from app.core.token_similarity import compute_token_similarity
from app.core.ast_analysis import extract_ast_features, compare_ast_structures
from app.core.semantic_similarity import compute_semantic_similarity
from app.core.risk_engine import calculate_multi_signal_risk, compute_behavioral_score
from app.core.synthetic_dataset import SYNTHETIC_BENCHMARK_CASES

def run_naive_text_matching(code_a: str, code_b: str) -> float:
    """Calculates simple raw text sequence similarity ratio."""
    matcher = difflib.SequenceMatcher(None, code_a, code_b)
    return round(matcher.ratio() * 100, 2)

def run_codetrace_analysis(code_a: str, code_b: str, lang: str = "python") -> Dict[str, Any]:
    """Runs the full multi-signal CodeTrace AI analysis pipeline."""
    norm_a, tokens_a, hash_a = normalize_code_pipeline(code_a, lang)
    norm_b, tokens_b, hash_b = normalize_code_pipeline(code_b, lang)

    token_sim = compute_token_similarity(tokens_a, tokens_b)
    ast_feat_a = extract_ast_features(code_a, lang)
    ast_feat_b = extract_ast_features(code_b, lang)
    ast_sim = compare_ast_structures(ast_feat_a, ast_feat_b)
    semantic_sim = compute_semantic_similarity(norm_a, norm_b)
    
    # Synthetic behavioral timing (3 minutes apart)
    now = datetime.utcnow()
    beh_info = compute_behavioral_score(now, now - timedelta(minutes=3), 1, 1)

    risk_result = calculate_multi_signal_risk(token_sim, ast_sim, semantic_sim, beh_info)
    return {
        "norm_a": norm_a,
        "norm_b": norm_b,
        "tokens_a": tokens_a,
        "tokens_b": tokens_b,
        "token_sim": token_sim,
        "ast_sim": ast_sim,
        "semantic_sim": semantic_sim,
        "risk": risk_result
    }

def evaluate_benchmark_suite() -> Dict[str, Any]:
    """
    Executes programmatic benchmark evaluation comparing Naive Text Matching vs CodeTrace AI
    across all synthetic benchmark cases.
    """
    naive_results = []
    codetrace_results = []

    # Counters for Naive Text
    n_tp, n_fp, n_tn, n_fn = 0, 0, 0, 0
    # Counters for CodeTrace AI
    c_tp, c_fp, c_tn, c_fn = 0, 0, 0, 0

    threshold_flag = 60.0  # > 60 score considered "Flagged / High Similarity"

    for case in SYNTHETIC_BENCHMARK_CASES:
        code_a = case["student_a"]["code"]
        code_b = case["student_b"]["code"]
        is_truly_plagiarized = case["expected_flag"]

        # 1. Naive Text Matching
        naive_score = run_naive_text_matching(code_a, code_b)
        naive_flagged = naive_score >= threshold_flag

        if is_truly_plagiarized and naive_flagged:
            n_tp += 1
        elif not is_truly_plagiarized and naive_flagged:
            n_fp += 1
        elif not is_truly_plagiarized and not naive_flagged:
            n_tn += 1
        else:
            n_fn += 1

        naive_results.append({
            "case_id": case["id"],
            "case_title": case["title"],
            "score": naive_score,
            "flagged": naive_flagged,
            "expected_flag": is_truly_plagiarized,
            "correct": naive_flagged == is_truly_plagiarized
        })

        # 2. CodeTrace AI Analysis
        ct_analysis = run_codetrace_analysis(code_a, code_b)
        ct_score = ct_analysis["risk"]["overall_score"]
        ct_flagged = ct_score >= threshold_flag

        if is_truly_plagiarized and ct_flagged:
            c_tp += 1
        elif not is_truly_plagiarized and ct_flagged:
            c_fp += 1
        elif not is_truly_plagiarized and not ct_flagged:
            c_tn += 1
        else:
            c_fn += 1

        codetrace_results.append({
            "case_id": case["id"],
            "case_title": case["title"],
            "score": ct_score,
            "risk_level": ct_analysis["risk"]["risk_level"],
            "token_score": ct_analysis["risk"]["token_score"],
            "structural_score": ct_analysis["risk"]["structural_score"],
            "semantic_score": ct_analysis["risk"]["semantic_score"],
            "flagged": ct_flagged,
            "expected_flag": is_truly_plagiarized,
            "correct": ct_flagged == is_truly_plagiarized,
            "evidence": ct_analysis["risk"]["evidence"]
        })

    def calc_metrics(tp, fp, tn, fn):
        total = tp + fp + tn + fn
        acc = (tp + tn) / total if total > 0 else 0
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0
        det_rate = rec
        fp_rate = fp / (fp + tn) if (fp + tn) > 0 else 0

        return {
            "accuracy": round(acc * 100, 1),
            "precision": round(prec * 100, 1),
            "recall": round(rec * 100, 1),
            "f1_score": round(f1 * 100, 1),
            "detection_rate": round(det_rate * 100, 1),
            "false_positive_rate": round(fp_rate * 100, 1),
            "tp": tp, "fp": fp, "tn": tn, "fn": fn
        }

    naive_metrics = calc_metrics(n_tp, n_fp, n_tn, n_fn)
    codetrace_metrics = calc_metrics(c_tp, c_fp, c_tn, c_fn)

    return {
        "dataset_name": "Bundled Synthetic Benchmark Cases (N=6)",
        "timestamp": datetime.utcnow().isoformat(),
        "naive_text_matching": {
            "metrics": naive_metrics,
            "case_results": naive_results
        },
        "codetrace_ai": {
            "metrics": codetrace_metrics,
            "case_results": codetrace_results
        }
    }
