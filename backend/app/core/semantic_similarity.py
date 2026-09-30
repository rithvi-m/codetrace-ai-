import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any

def compute_semantic_similarity(norm_code_a: str, norm_code_b: str) -> Dict[str, Any]:
    """
    Computes semantic similarity using local TF-IDF character & word n-gram vectorization with cosine distance.
    Guaranteed to run 100% offline deterministically without paid API keys.
    """
    if not norm_code_a.strip() or not norm_code_b.strip():
        return {"score": 0.0, "method": "local_tfidf_cosine", "cosine_sim": 0.0}

    # Word-level TF-IDF (1-2 grams)
    vectorizer_word = TfidfVectorizer(ngram_range=(1, 2), analyzer='word')
    try:
        tfidf_word = vectorizer_word.fit_transform([norm_code_a, norm_code_b])
        cos_word = cosine_similarity(tfidf_word[0:1], tfidf_word[1:2])[0][0]
    except Exception:
        cos_word = 0.0

    # Char-level TF-IDF (3-5 grams) to capture structural patterns & expression semantics
    vectorizer_char = TfidfVectorizer(ngram_range=(3, 5), analyzer='char')
    try:
        tfidf_char = vectorizer_char.fit_transform([norm_code_a, norm_code_b])
        cos_char = cosine_similarity(tfidf_char[0:1], tfidf_char[1:2])[0][0]
    except Exception:
        cos_char = 0.0

    # Composite semantic metric
    composite_cos = (cos_word * 0.40) + (cos_char * 0.60)
    score_100 = round(float(composite_cos) * 100, 2)

    return {
        "score": max(0.0, min(100.0, score_100)),
        "method": "local_tfidf_vectorizer (Offline Fallback)",
        "word_cosine": round(float(cos_word) * 100, 2),
        "char_cosine": round(float(cos_char) * 100, 2)
    }
