# CodeTrace AI — AI Code Integrity & Plagiarism Intelligence Platform

> **"Beyond Matching. Understand the Code."**

A complete, hackathon-ready, full-stack enterprise web application built for **RAMPeX Hackathon Problem Statement 05: "AI-Powered Code Integrity & Plagiarism Intelligence"**.

---

## 🌟 Key Features

1. **Multi-Signal Code Analysis Engine**:
   - **Code Normalization**: Strips comments, whitespace, and renames variables/functions canonically (`v_1`, `func_1`) using Python AST tree transformers.
   - **Token n-Gram Similarity**: 1-gram & 3-gram Jaccard index + sequence alignment.
   - **AST Structural Parser**: Control-flow tree depth, node count distribution, and structural pattern hashing.
   - **Semantic Similarity**: Vector space TF-IDF n-gram model with Cosine Distance calculation running **100% offline**.
   - **Behavioral Analysis**: Submission timestamp proximity and attempt revision deltas.
2. **Explainable Evidence Breakdown**: Generates natural language cards explaining *WHY* two submissions are similar (e.g. *"94% semantic similarity after AST identifier normalization"*).
3. **Side-by-Side Code Comparison**: Dual-pane editor comparing Student A vs Student B (Original vs AST Normalized views) with line highlighting and tutor decision logger.
4. **Cross-Student Similarity Matrix**: Interactive heatmap grid of all pairwise student scores.
5. **Similarity Network Graph**: Force-directed SVG visual cluster graph detecting multi-student collusion rings.
6. **Naive Text Benchmark & Evaluation**: Automated benchmark page comparing CodeTrace AI vs Naive Text Matching across 6 synthetic test cases (Accuracy, Precision, Recall, F1 Score).
7. **1-Click Hackathon Demo Mode**: Header button that populates 12 student submissions, runs pairwise analysis, and builds complete demo dashboard in 2 seconds!
8. **Tutor Governance & Responsible AI**: Non-accusatory terminology ("Requires Review", "Manual Review Recommended") keeping human instructors in full control.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Run Backend (FastAPI Engine)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`

### 2. Run Frontend (React Vite App)
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will be running at: `http://localhost:3000`

---

## 🎯 30-Second Hackathon Judge Demo Flow

1. Open `http://localhost:3000`.
2. Click the **"Hackathon Demo Mode"** button in the top navigation bar.
3. Observe **Dashboard**: KPIs update to 12 submissions, 66 pairwise comparisons, risk distribution pie chart, and top suspicious pairs.
4. Navigate to **Similarity Matrix**: Click any cell (e.g. 86% score cell) to jump directly to **Side-by-Side Comparison**.
5. In **Code Comparison**: Toggle between *Original Code* and *Normalized AST Code* to see how variable renaming was bypassed. Review explainable evidence cards.
6. Navigate to **Similarity Network Graph**: See visual cluster graph of student collusion nodes.
7. Navigate to **Benchmark & Evaluation**: View programmatic proof that CodeTrace AI outperforms Naive Text Matching.
8. Navigate to **Review Workflow**: Mark case as *Reviewed* with tutor notes.

---

## 📊 Bundled Synthetic Benchmark Dataset (N=6)

- **Case 1**: Genuinely Original Solutions (Two Sum Hash Map vs Brute Force) → *Expected: Low Similarity*
- **Case 2**: Variable Renaming (Identical logic, renamed identifiers) → *Expected: Review Recommended*
- **Case 3**: Formatting & Comments (Added docstrings & re-indentation) → *Expected: Review Recommended*
- **Case 4**: Statement Reordering (Independent variable assignment reordering) → *Expected: High Similarity*
- **Case 5**: Algorithm Variants (Recursive vs Iterative Factorial) → *Expected: Low Similarity*
- **Case 6**: Modified Copy with Camouflage Code (Copied loop + extra print statements) → *Expected: High Similarity*

---

## 🛡️ Responsible AI Statement

CodeTrace AI is designed exclusively as an explainable decision-support platform for human instructors. It provides empirical evidence, multi-signal scores, and structural analysis. Final academic integrity determinations remain strictly with the human tutor.
