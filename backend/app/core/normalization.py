import re
import ast
import hashlib
from typing import Dict, List, Tuple, Any

PYTHON_KEYWORDS = {
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
    'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
    'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
    'print', 'range', 'len', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple',
    'sum', 'max', 'min', 'abs', 'enumerate', 'zip', 'open', 'type', 'input', 'append'
}

JS_KEYWORDS = {
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'async', 'await', 'console', 'log', 'push', 'length', 'map', 'filter'
}

def remove_python_comments(code: str) -> str:
    """Removes comments and docstrings from Python code."""
    # Remove triply quoted strings (docstrings)
    code = re.sub(r'"""[\s\S]*?"""', '', code)
    code = re.sub(r"'''[\s\S]*?'''", '', code)
    # Remove single line comments
    lines = code.split('\n')
    cleaned_lines = []
    for line in lines:
        if '#' in line:
            # Avoid stripping # inside quotes if simple, otherwise strip after #
            line = line.split('#')[0]
        cleaned_lines.append(line.rstrip())
    return '\n'.join([l for l in cleaned_lines if l.strip()])

def remove_js_comments(code: str) -> str:
    """Removes comments from JS/C-style code."""
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    lines = code.split('\n')
    cleaned = []
    for line in lines:
        if '//' in line:
            line = line.split('//')[0]
        cleaned.append(line.rstrip())
    return '\n'.join([l for l in cleaned if l.strip()])

def normalize_python_ast(code: str) -> Tuple[str, List[str]]:
    """
    Parses Python code into AST, renames user variables/functions canonically,
    and unparses to normalized code and token sequence.
    """
    try:
        tree = ast.parse(code)
    except Exception:
        # Fallback to Regex normalization if AST parse fails
        return normalize_generic_regex(code, PYTHON_KEYWORDS)

    var_map: Dict[str, str] = {}
    var_counter = 1
    func_counter = 1

    class Renamer(ast.NodeTransformer):
        def visit_Name(self, node: ast.Name) -> ast.Name:
            nonlocal var_counter
            if node.id not in PYTHON_KEYWORDS and not node.id.startswith('__'):
                if node.id not in var_map:
                    var_map[node.id] = f"v_{var_counter}"
                    var_counter += 1
                node.id = var_map[node.id]
            return node

        def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.FunctionDef:
            nonlocal func_counter
            if node.name not in PYTHON_KEYWORDS and not node.name.startswith('__'):
                if node.name not in var_map:
                    var_map[node.name] = f"func_{func_counter}"
                    func_counter += 1
                node.name = var_map[node.name]
            self.generic_visit(node)
            return node

        def visit_arg(self, node: ast.arg) -> ast.arg:
            nonlocal var_counter
            if node.arg not in PYTHON_KEYWORDS:
                if node.arg not in var_map:
                    var_map[node.arg] = f"v_{var_counter}"
                    var_counter += 1
                node.arg = var_map[node.arg]
            return node

    transformed = Renamer().visit(tree)
    ast.fix_missing_locations(transformed)

    try:
        normalized_str = ast.unparse(transformed)
    except AttributeError:
        # Python < 3.9 compatibility or node unparse fallback
        normalized_str = ast.dump(transformed)

    tokens = extract_tokens(normalized_str)
    return normalized_str, tokens

def normalize_generic_regex(code: str, keywords: set) -> Tuple[str, List[str]]:
    """Generic regex-based identifier renamer for non-python or unparseable code."""
    # Find all words
    words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', code)
    var_map = {}
    counter = 1

    for word in words:
        if word not in keywords and not word.isdigit() and len(word) > 1:
            if word not in var_map:
                var_map[word] = f"v_{counter}"
                counter += 1

    # Replace identifiers safely using regex word boundaries
    def replace_ident(match):
        w = match.group(0)
        return var_map.get(w, w)

    normalized_code = re.sub(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', replace_ident, code)
    # Strip excess whitespace
    lines = [line.strip() for line in normalized_code.split('\n') if line.strip()]
    cleaned_code = '\n'.join(lines)
    tokens = extract_tokens(cleaned_code)
    return cleaned_code, tokens

def extract_tokens(code: str) -> List[str]:
    """Tokenizes normalized code into individual lexical units."""
    return re.findall(r'\b\w+\b|[^\w\s]', code)

def normalize_code_pipeline(raw_code: str, language: str = "python") -> Tuple[str, List[str], str]:
    """
    Main entry point for code normalization pipeline.
    Returns (normalized_code, tokens, canonical_sha256_hash).
    """
    lang = language.lower()
    if lang == "python" or lang == "py":
        code_no_comments = remove_python_comments(raw_code)
        norm_code, tokens = normalize_python_ast(code_no_comments)
    else:
        code_no_comments = remove_js_comments(raw_code)
        keywords = JS_KEYWORDS if lang in ["javascript", "js"] else PYTHON_KEYWORDS
        norm_code, tokens = normalize_generic_regex(code_no_comments, keywords)

    canonical_hash = hashlib.sha256(norm_code.encode('utf-8')).hexdigest()
    return norm_code, tokens, canonical_hash
