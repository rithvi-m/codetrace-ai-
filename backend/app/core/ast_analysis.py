import ast
import re
import hashlib
from typing import Dict, List, Tuple, Any

class ASTVisitor(ast.NodeVisitor):
    def __init__(self):
        self.node_counts: Dict[str, int] = {}
        self.control_flow_sequence: List[str] = []
        self.max_depth = 0
        self.current_depth = 0
        self.function_signatures: List[str] = []

    def generic_visit(self, node: ast.AST):
        node_name = node.__class__.__name__
        self.node_counts[node_name] = self.node_counts.get(node_name, 0) + 1
        
        # Track control flow items
        if isinstance(node, (ast.For, ast.While, ast.If, ast.FunctionDef, ast.Return, ast.Try, ast.With, ast.ClassDef)):
            self.control_flow_sequence.append(node_name)

        if isinstance(node, ast.FunctionDef):
            arg_count = len(node.args.args)
            self.function_signatures.append(f"{node.name}({arg_count})")

        self.current_depth += 1
        if self.current_depth > self.max_depth:
            self.max_depth = self.current_depth

        super().generic_visit(node)
        self.current_depth -= 1

def extract_ast_features(raw_code: str, language: str = "python") -> Dict[str, Any]:
    """
    Extracts structural AST features from raw code.
    Works for Python via native `ast`, and falls back to block regex parser for other languages.
    """
    lang = language.lower()
    if lang in ["python", "py"]:
        try:
            tree = ast.parse(raw_code)
            visitor = ASTVisitor()
            visitor.visit(tree)

            counts = visitor.node_counts
            return {
                "total_nodes": sum(counts.values()),
                "max_depth": visitor.max_depth,
                "functions": counts.get("FunctionDef", 0),
                "loops": counts.get("For", 0) + counts.get("While", 0),
                "conditionals": counts.get("If", 0),
                "returns": counts.get("Return", 0),
                "calls": counts.get("Call", 0),
                "assigns": counts.get("Assign", 0) + counts.get("AugAssign", 0),
                "operators": counts.get("BinOp", 0) + counts.get("BoolOp", 0) + counts.get("Compare", 0),
                "control_flow_seq": visitor.control_flow_sequence,
                "function_signatures": visitor.function_signatures,
                "node_distribution": counts,
                "ast_tree_dump": ast.dump(tree) if len(raw_code) < 3000 else "tree_truncated"
            }
        except Exception:
            pass

    # Generic Fallback for unparseable code or non-Python languages
    lines = raw_code.split('\n')
    loops = sum(len(re.findall(r'\b(for|while)\b', line)) for line in lines)
    conditionals = sum(len(re.findall(r'\b(if|else if|elif|switch|case)\b', line)) for line in lines)
    functions = sum(len(re.findall(r'\b(def|function|class|const\s+\w+\s*=\s*\()\b', line)) for line in lines)
    returns = sum(len(re.findall(r'\b(return)\b', line)) for line in lines)

    cf_matches = re.findall(r'\b(function|def|class|for|while|if|elif|else|return|try|catch)\b', raw_code)

    return {
        "total_nodes": len(raw_code.split()),
        "max_depth": min(20, max(1, len(lines) // 3)),
        "functions": functions,
        "loops": loops,
        "conditionals": conditionals,
        "returns": returns,
        "calls": len(re.findall(r'\w+\(', raw_code)),
        "assigns": len(re.findall(r'=', raw_code)),
        "operators": len(re.findall(r'[\+\-\*/%><==!&\|]', raw_code)),
        "control_flow_seq": cf_matches,
        "function_signatures": [],
        "node_distribution": {},
        "ast_tree_dump": "generic_parser"
    }

def compare_ast_structures(features_a: Dict[str, Any], features_b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes structural similarity score (0-100) between two AST feature sets.
    Compares feature vector ratios and control flow sequence alignment.
    """
    keys = ["functions", "loops", "conditionals", "returns", "calls", "assigns", "operators"]
    vector_sims = []

    for k in keys:
        v1 = float(features_a.get(k, 0))
        v2 = float(features_b.get(k, 0))
        if v1 == 0 and v2 == 0:
            vector_sims.append(1.0)
        else:
            sim = 1.0 - (abs(v1 - v2) / (max(v1, v2) + 1e-5))
            vector_sims.append(max(0.0, sim))

    vector_score = sum(vector_sims) / len(vector_sims) if vector_sims else 1.0

    # Control Flow Sequence Similarity
    seq_a = features_a.get("control_flow_seq", [])
    seq_b = features_b.get("control_flow_seq", [])

    if not seq_a and not seq_b:
        cf_score = 1.0
    elif not seq_a or not seq_b:
        cf_score = 0.0
    else:
        # Match ratio
        matcher = re.compile(r'') # simple matcher fallback
        import difflib
        sm = difflib.SequenceMatcher(None, seq_a, seq_b)
        cf_score = sm.ratio()

    # Depth similarity
    d1 = float(features_a.get("max_depth", 1))
    d2 = float(features_b.get("max_depth", 1))
    depth_sim = 1.0 - (abs(d1 - d2) / max(d1, d2))

    total_struct_score = (vector_score * 0.45) + (cf_score * 0.40) + (depth_sim * 0.15)
    score_100 = round(max(0.0, min(100.0, total_struct_score * 100)), 2)

    return {
        "score": score_100,
        "vector_similarity": round(vector_score * 100, 2),
        "control_flow_similarity": round(cf_score * 100, 2),
        "depth_similarity": round(depth_sim * 100, 2),
        "seq_a": seq_a,
        "seq_b": seq_b
    }
