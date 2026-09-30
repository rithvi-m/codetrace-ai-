import difflib
from typing import List, Set, Dict, Any

def get_ngrams(tokens: List[str], n: int = 3) -> List[str]:
    """Generates n-grams from a list of tokens."""
    if len(tokens) < n:
        return [' '.join(tokens)]
    return [' '.join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Calculates Jaccard index between two token sets."""
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def compute_token_similarity(tokens_a: List[str], tokens_b: List[str]) -> Dict[str, Any]:
    """
    Calculates multi-granularity token similarity between two tokenized submissions.
    Returns score (0-100) and metric details.
    """
    if not tokens_a or not tokens_b:
        return {"score": 0.0, "jaccard_1gram": 0.0, "jaccard_3gram": 0.0, "sequence_ratio": 0.0}

    # 1-gram Jaccard
    jaccard_1 = jaccard_similarity(set(tokens_a), set(tokens_b))

    # 3-gram Jaccard
    ngrams_a = set(get_ngrams(tokens_a, 3))
    ngrams_b = set(get_ngrams(tokens_b, 3))
    jaccard_3 = jaccard_similarity(ngrams_a, ngrams_b)

    # Sequence Matcher ratio
    matcher = difflib.SequenceMatcher(None, tokens_a, tokens_b)
    seq_ratio = matcher.ratio()

    # Weighted composite score
    composite = (jaccard_1 * 0.25) + (jaccard_3 * 0.40) + (seq_ratio * 0.35)
    score_100 = round(composite * 100, 2)

    return {
        "score": score_100,
        "jaccard_1gram": round(jaccard_1 * 100, 2),
        "jaccard_3gram": round(jaccard_3 * 100, 2),
        "sequence_ratio": round(seq_ratio * 100, 2),
        "token_count_a": len(tokens_a),
        "token_count_b": len(tokens_b)
    }
