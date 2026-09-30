# CodeTrace AI — System Architecture & Technical Specifications

**Product Identity**: CodeTrace AI  
**Tagline**: "Beyond Matching. Understand the Code."  
**Problem Statement**: RAMPeX Hackathon Problem Statement 05 — AI-Powered Code Integrity & Plagiarism Intelligence

---

## 1. High-Level Architecture Overview

CodeTrace AI is built as a decoupled, micro-service ready full-stack platform consisting of a high-performance Python FastAPI engine, a local deterministic AST/Token/Semantic analysis core, SQLite relational persistence, and an enterprise React 18 TypeScript frontend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT 18 FRONTEND                             │
│  (Dashboard, Side-by-Side Comparison, Matrix, Network Graph, Benchmark) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON / HTTP)
┌────────────────────────────────────▼────────────────────────────────────┐
│                           FASTAPI BACKEND ENGINE                        │
│                                                                         │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐   │
│  │  Normalizer & Tokens   │   │         AST Structural Parser        │   │
│  │  Comment Strip / AST   │   │   Python `ast` Node Counts / Depths  │   │
│  │  Canonical Identifier  │   │   Control Flow Hash Fingerprinting   │   │
│  └───────────┬───────────┘   └──────────────────┬───────────────────┘   │
│              │                                  │                       │
│              │        ┌─────────────────────────┴──────────────┐        │
│              └───────►│    TF-IDF Vector Semantic Model        │        │
│                       │   Local Offline Cosine Space Model     │        │
│                       └─────────────────────────┬──────────────┘        │
│                                                 │                       │
│                       ┌─────────────────────────▼──────────────┐        │
│                       │       Multi-Signal Risk Engine         │        │
│                       │ (Token 20% + AST 30% + Semantic 30%    │        │
│                       │  + Logic 15% + Behavioral 5%)          │        │
│                       └─────────────────────────┬──────────────┘        │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │ SQLAlchemy ORM
┌─────────────────────────────────────────▼───────────────────────────────┐
│                             SQLITE DATABASE                             │
│       (Assignments, Students, Submissions, NormalizedCode, Results)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Signal Analysis Pipeline

Traditional text-matching engines break when students perform simple surface obfuscations (renaming variables, adjusting whitespace, reordering independent statements). CodeTrace AI addresses this via a 5-layer analysis pipeline:

### Layer 1: Code Normalization Pipeline
- **Comment & Docstring Elimination**: Strips `#`, `//`, `/* */`, and Python `"""` docstrings.
- **AST Canonical Renaming**: Parses Python syntax into AST and rewrites user identifiers to canonical symbols (`v_1`, `v_2`, `func_1`, `func_2`) while preserving syntax keywords (`for`, `while`, `if`, `return`).
- **Whitespace & Indentation Normalization**: Formats canonical code into standard tokens and computes SHA-256 canonical hash.

### Layer 2: Token Sequence Matching
- Calculates 1-gram Jaccard Index, 3-gram Jaccard Index, and `difflib.SequenceMatcher` token sequence ratios over normalized tokens.

### Layer 3: AST Structural Parsing
- Native Python `ast` tree traversal extracting node count distribution (`FunctionDef`, `For`, `While`, `If`, `BinOp`, `Call`, `Return`).
- Control-flow sequence fingerprinting (sequence of control blocks e.g. `FunctionDef -> For -> If -> Return`).
- AST subtree depth profiling.

### Layer 4: Semantic Vector Space Model
- Local TF-IDF character (3-5 grams) and word (1-2 grams) vector space model with Cosine Distance calculation.
- Guaranteed 100% offline functionality without external paid API keys.

### Layer 5: Multi-Signal Risk Aggregator
Calculates the final overall risk score using configurable weights:
\[ \text{Overall Risk} = 0.20 \times \text{Token} + 0.30 \times \text{AST} + 0.30 \times \text{Semantic} + 0.15 \times \text{Logic} + 0.05 \times \text{Behavioral} \]

### Risk Classification Thresholds:
- **0 – 29%**: Low Similarity
- **30 – 59%**: Moderate Similarity
- **60 – 79%**: High Similarity
- **80 – 100%**: Manual Review Recommended

---

## 3. Database Schema

The database relies on a clean relational schema defined in SQLAlchemy:

```
Assignment (1) ───< Submission (N) ───< NormalizedCode (1)
                        │
Student (1) ────────────┤ ────────────< CodeFeatures (1)
                        │
                        └───< SimilarityResult (Pairwise N-to-N)
```

---

## 4. Responsible AI & Tutor Governance

1. **Non-Accusatory Classification**: Uses human-centric terminology ("Requires Review", "High Similarity") rather than absolute accusations.
2. **Human-in-the-Loop Review**: Tutors review side-by-side highlighted code, inspect evidence cards, and record decision notes (`Reviewed`, `Dismissed`, `Confirmed Action`).
3. **Starter Code Discounting**: Automatically filters instructor-provided boilerplate lines before scoring.
