from typing import Dict, List, Any
from datetime import datetime

DEFAULT_WEIGHTS = {
    "token": 0.20,
    "structural": 0.30,
    "semantic": 0.30,
    "logic": 0.15,
    "behavioral": 0.05
}

DEFAULT_THRESHOLDS = {
    "low_max": 29.0,
    "moderate_max": 59.0,
    "high_max": 79.0
}

def classify_risk_level(score: float, thresholds: Dict[str, float] = None) -> str:
    """Classifies numerical score into non-accusatory risk label."""
    if thresholds is None:
        thresholds = DEFAULT_THRESHOLDS

    if score <= thresholds.get("low_max", 29.0):
        return "Low Similarity"
    elif score <= thresholds.get("moderate_max", 59.0):
        return "Moderate Similarity"
    elif score <= thresholds.get("high_max", 79.0):
        return "High Similarity"
    else:
        return "Manual Review Recommended"

def compute_behavioral_score(sub_a_time: datetime, sub_b_time: datetime, attempt_a: int, attempt_b: int) -> Dict[str, Any]:
    """Calculates behavioral timing similarity based on submission timestamps and attempt numbers."""
    if not sub_a_time or not sub_b_time:
        return {"score": 0.0, "time_diff_minutes": None}

    diff_seconds = abs((sub_a_time - sub_b_time).total_seconds())
    diff_minutes = diff_seconds / 60.0

    # If submitted within 5 minutes of each other -> 100% time proximity
    if diff_minutes <= 5.0:
        time_score = 100.0
    elif diff_minutes <= 30.0:
        time_score = 100.0 - ((diff_minutes - 5.0) / 25.0 * 50.0)
    elif diff_minutes <= 120.0:
        time_score = 50.0 - ((diff_minutes - 30.0) / 90.0 * 40.0)
    else:
        time_score = 10.0

    attempt_diff = abs(attempt_a - attempt_b)
    attempt_score = 100.0 if attempt_diff == 0 else max(0.0, 100.0 - (attempt_diff * 25.0))

    final_behavioral = (time_score * 0.7) + (attempt_score * 0.3)
    return {
        "score": round(final_behavioral, 2),
        "time_diff_minutes": round(diff_minutes, 1),
        "attempt_delta": attempt_diff
    }

def generate_explainable_evidence(
    token_sim: Dict[str, Any],
    ast_sim: Dict[str, Any],
    semantic_sim: Dict[str, Any],
    behavioral_info: Dict[str, Any],
    overall_score: float,
    starter_code_subtracted: bool = False
) -> List[Dict[str, str]]:
    """Generates dynamic natural language evidence cards explaining WHY submissions are flagged."""
    cards = []

    # 1. Structural Evidence
    struct_score = ast_sim.get("score", 0)
    cf_sim = ast_sim.get("control_flow_similarity", 0)
    if struct_score >= 60:
        cards.append({
            "type": "structural",
            "title": "Structural AST Pattern Alignment",
            "severity": "high" if struct_score >= 80 else "medium",
            "description": f"Both solutions exhibit an equivalent control-flow architecture ({cf_sim}% alignment). The nested loop, conditional branching, and function decomposition profiles match closely despite surface modifications."
        })
    elif struct_score >= 30:
        cards.append({
            "type": "structural",
            "title": "Moderate Structural Overlap",
            "severity": "low",
            "description": f"Submissions share standard algorithmic control statements ({cf_sim}% control-flow similarity), but differ in helper function decomposition."
        })

    # 2. Semantic Evidence
    sem_score = semantic_sim.get("score", 0)
    if sem_score >= 70:
        cards.append({
            "type": "semantic",
            "title": "Renamed Variable & Identical Logic Detection",
            "severity": "high" if sem_score >= 85 else "medium",
            "description": f"Variable and function identifiers differ, but after canonical AST normalization, the core statement execution vector yields {sem_score}% semantic overlap."
        })

    # 3. Token Evidence
    tok_score = token_sim.get("score", 0)
    j3 = token_sim.get("jaccard_3gram", 0)
    if tok_score >= 65:
        cards.append({
            "type": "token",
            "title": "High Lexical Token n-Gram Overlap",
            "severity": "high" if tok_score >= 80 else "medium",
            "description": f"After stripping comments and normalizing whitespace, 3-gram token sequence analysis detected {j3}% exact token chain matches."
        })

    # 4. Behavioral Evidence
    time_diff = behavioral_info.get("time_diff_minutes")
    if time_diff is not None and time_diff <= 15.0:
        cards.append({
            "type": "behavioral",
            "title": "Temporal Submission Proximity",
            "severity": "medium",
            "description": f"Submissions were uploaded within {time_diff} minutes of each other with identical attempt sequence numbers."
        })

    # 5. Starter Code Protection Note
    if starter_code_subtracted:
        cards.append({
            "type": "false_positive_guard",
            "title": "Instructor Starter Code Discounted",
            "severity": "info",
            "description": "Common boilerplate and instructor starter code lines were automatically excluded prior to scoring to prevent false positive flags."
        })

    if not cards:
        cards.append({
            "type": "summary",
            "title": "Independent Implementations",
            "severity": "low",
            "description": "Submissions demonstrate distinct logic, structural variations, and low overall lexical overlap."
        })

    return cards

def calculate_multi_signal_risk(
    token_sim: Dict[str, Any],
    ast_sim: Dict[str, Any],
    semantic_sim: Dict[str, Any],
    behavioral_info: Dict[str, Any],
    weights: Dict[str, float] = None,
    thresholds: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes overall weighted risk score, risk level, and explainable evidence cards.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    tok_score = token_sim.get("score", 0.0)
    struct_score = ast_sim.get("score", 0.0)
    sem_score = semantic_sim.get("score", 0.0)
    logic_score = ast_sim.get("control_flow_similarity", 0.0)
    beh_score = behavioral_info.get("score", 0.0)

    w_tok = weights.get("token", 0.20)
    w_struct = weights.get("structural", 0.30)
    w_sem = weights.get("semantic", 0.30)
    w_log = weights.get("logic", 0.15)
    w_beh = weights.get("behavioral", 0.05)

    overall_raw = (tok_score * w_tok) + (struct_score * w_struct) + (sem_score * w_sem) + (logic_score * w_log) + (beh_score * w_beh)
    overall_score = round(max(0.0, min(100.0, overall_raw)), 2)

    risk_level = classify_risk_level(overall_score, thresholds)
    evidence = generate_explainable_evidence(token_sim, ast_sim, semantic_sim, behavioral_info, overall_score)

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "token_score": tok_score,
        "structural_score": struct_score,
        "semantic_score": sem_score,
        "logic_score": logic_score,
        "behavioral_score": beh_score,
        "weights_used": {
            "token": w_tok,
            "structural": w_struct,
            "semantic": w_sem,
            "logic": w_log,
            "behavioral": w_beh
        },
        "evidence": evidence,
        "disclaimer": "This system identifies similarity patterns for human tutor review. It does not make automated misconduct determinations."
    }
