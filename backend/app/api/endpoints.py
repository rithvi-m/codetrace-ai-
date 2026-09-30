from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db, Base, engine
from app.db.models import Assignment, Student, Submission, NormalizedCode, CodeFeatures, SimilarityResult, SystemConfig
from app.core.normalization import normalize_code_pipeline
from app.core.token_similarity import compute_token_similarity
from app.core.ast_analysis import extract_ast_features, compare_ast_structures
from app.core.semantic_similarity import compute_semantic_similarity
from app.core.risk_engine import calculate_multi_signal_risk, compute_behavioral_score, DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS
from app.core.evaluation import evaluate_benchmark_suite
from app.core.synthetic_dataset import SYNTHETIC_BENCHMARK_CASES

router = APIRouter()

# Initialize DB tables
Base.metadata.create_all(bind=engine)

def analyze_and_store_pair(db: Session, sub_a: Submission, sub_b: Submission) -> SimilarityResult:
    """Computes full multi-signal similarity between two stored submissions and saves result."""
    norm_a = sub_a.normalized
    norm_b = sub_b.normalized
    feat_a = sub_a.features
    feat_b = sub_b.features

    tok_sim = compute_token_similarity(norm_a.tokens_json, norm_b.tokens_json)
    ast_sim = compare_ast_structures(feat_a.ast_tree_json, feat_b.ast_tree_json)
    sem_sim = compute_semantic_similarity(norm_a.normalized_code, norm_b.normalized_code)
    beh_info = compute_behavioral_score(sub_a.submitted_at, sub_b.submitted_at, sub_a.attempt_number, sub_b.attempt_number)

    risk_res = calculate_multi_signal_risk(tok_sim, ast_sim, sem_sim, beh_info)

    sim_rec = SimilarityResult(
        submission_a_id=sub_a.id,
        submission_b_id=sub_b.id,
        token_score=risk_res["token_score"],
        structural_score=risk_res["structural_score"],
        semantic_score=risk_res["semantic_score"],
        logic_score=risk_res["logic_score"],
        behavioral_score=risk_res["behavioral_score"],
        overall_score=risk_res["overall_score"],
        risk_level=risk_res["risk_level"],
        evidence_json=risk_res["evidence"],
        status="New"
    )
    db.add(sim_rec)
    db.commit()
    db.refresh(sim_rec)
    return sim_rec

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Overview dashboard analytics."""
    total_submissions = db.query(Submission).count()
    students_count = db.query(Student).count()
    pairs_count = db.query(SimilarityResult).count()

    high_pairs = db.query(SimilarityResult).filter(SimilarityResult.risk_level.in_(["High Similarity", "Manual Review Recommended"])).count()
    med_pairs = db.query(SimilarityResult).filter(SimilarityResult.risk_level == "Moderate Similarity").count()
    low_pairs = db.query(SimilarityResult).filter(SimilarityResult.risk_level == "Low Similarity").count()
    pending_reviews = db.query(SimilarityResult).filter(SimilarityResult.status.in_(["New", "Under Review"])).count()

    results = db.query(SimilarityResult).all()
    avg_sim = round(sum(r.overall_score for r in results) / len(results), 1) if results else 0.0

    # Risk Distribution for pie chart
    risk_dist = [
        {"name": "Low Similarity (0-29%)", "value": low_pairs, "color": "#10B981"},
        {"name": "Moderate Similarity (30-59%)", "value": med_pairs, "color": "#F59E0B"},
        {"name": "High Similarity (60-79%)", "value": db.query(SimilarityResult).filter(SimilarityResult.risk_level == "High Similarity").count(), "color": "#EF4444"},
        {"name": "Review Needed (80-100%)", "value": db.query(SimilarityResult).filter(SimilarityResult.risk_level == "Manual Review Recommended").count(), "color": "#8B5CF6"}
    ]

    # Top suspicious pairs
    top_pairs_db = db.query(SimilarityResult).order_by(SimilarityResult.overall_score.desc()).limit(5).all()
    top_pairs = []
    for p in top_pairs_db:
        sub_a = db.query(Submission).get(p.submission_a_id)
        sub_b = db.query(Submission).get(p.submission_b_id)
        if sub_a and sub_b:
            top_pairs.append({
                "id": p.id,
                "student_a": sub_a.student.name,
                "student_b": sub_b.student.name,
                "assignment": sub_a.assignment.title,
                "overall_score": p.overall_score,
                "risk_level": p.risk_level,
                "status": p.status,
                "token_score": p.token_score,
                "structural_score": p.structural_score,
                "semantic_score": p.semantic_score
            })

    return {
        "total_submissions": total_submissions,
        "students_analyzed": students_count,
        "submission_pairs_analyzed": pairs_count,
        "high_similarity_pairs": high_pairs,
        "medium_similarity_pairs": med_pairs,
        "low_similarity_pairs": low_pairs,
        "pending_reviews": pending_reviews,
        "average_similarity_score": avg_sim,
        "risk_distribution": risk_dist,
        "top_suspicious_pairs": top_pairs
    }

@router.post("/demo-seed")
def seed_hackathon_demo_data(db: Session = Depends(get_db)):
    """
    Hackathon Demo Mode Trigger!
    Clears existing DB and populates 15+ student submissions across multiple assignments,
    runs pairwise analysis, and builds complete demo dashboard.
    """
    db.query(SimilarityResult).delete()
    db.query(CodeFeatures).delete()
    db.query(NormalizedCode).delete()
    db.query(Submission).delete()
    db.query(Student).delete()
    db.query(Assignment).delete()
    db.commit()

    # Create Demo Assignment
    assign1 = Assignment(
        title="CS101 — Homework 3: Algorithm Optimization",
        language="python",
        description="Implement optimal solution for algorithmic processing with minimum complexity.",
        starter_code="""# CS101 Homework Starter Code
# Instructor: Dr. Evelyn Vance
def main():
    pass

if __name__ == '__main__':
    main()
"""
    )
    db.add(assign1)
    db.commit()
    db.refresh(assign1)

    created_submissions = []
    base_time = datetime.utcnow() - timedelta(hours=2)

    # Populate 12 Demo Students from Synthetic Cases
    for idx, case in enumerate(SYNTHETIC_BENCHMARK_CASES):
        sa = case["student_a"]
        sb = case["student_b"]

        stu1 = Student(student_id_str=sa["student_id"], name=sa["name"], email=f"{sa['name'].lower().replace(' ', '.')}@university.edu")
        stu2 = Student(student_id_str=sb["student_id"], name=sb["name"], email=f"{sb['name'].lower().replace(' ', '.')}@university.edu")
        db.add_all([stu1, stu2])
        db.commit()
        db.refresh(stu1)
        db.refresh(stu2)

        sub1 = Submission(
            student_id=stu1.id,
            assignment_id=assign1.id,
            attempt_number=1,
            file_name=f"solution_{stu1.student_id_str}.py",
            raw_code=sa["code"],
            submitted_at=base_time + timedelta(minutes=idx * 10)
        )
        sub2 = Submission(
            student_id=stu2.id,
            assignment_id=assign1.id,
            attempt_number=1,
            file_name=f"solution_{stu2.student_id_str}.py",
            raw_code=sb["code"],
            submitted_at=base_time + timedelta(minutes=idx * 10 + 3) # 3 min delay
        )
        db.add_all([sub1, sub2])
        db.commit()
        db.refresh(sub1)
        db.refresh(sub2)

        # Normalize and extract features
        for s in [sub1, sub2]:
            norm_code, tokens, chash = normalize_code_pipeline(s.raw_code, "python")
            ast_feat = extract_ast_features(s.raw_code, "python")

            norm_rec = NormalizedCode(submission_id=s.id, normalized_code=norm_code, tokens_json=tokens, canonical_hash=chash)
            feat_rec = CodeFeatures(
                submission_id=s.id,
                total_lines=len(s.raw_code.split('\n')),
                function_count=ast_feat["functions"],
                loop_count=ast_feat["loops"],
                conditional_count=ast_feat["conditionals"],
                max_ast_depth=ast_feat["max_depth"],
                ast_tree_json=ast_feat
            )
            db.add_all([norm_rec, feat_rec])
            db.commit()

        created_submissions.extend([sub1, sub2])

    # Run Pairwise Comparison for all submissions
    for i in range(len(created_submissions)):
        for j in range(i + 1, len(created_submissions)):
            sub_a = db.query(Submission).get(created_submissions[i].id)
            sub_b = db.query(Submission).get(created_submissions[j].id)
            analyze_and_store_pair(db, sub_a, sub_b)

    return {"message": "Hackathon Demo Mode activated! 12 submissions and 66 pairwise comparisons seeded successfully.", "total_submissions": len(created_submissions)}

@router.get("/submissions")
def get_submissions(db: Session = Depends(get_db)):
    """List all student submissions."""
    subs = db.query(Submission).all()
    out = []
    for s in subs:
        out.append({
            "id": s.id,
            "student_name": s.student.name,
            "student_id": s.student.student_id_str,
            "assignment_title": s.assignment.title,
            "file_name": s.file_name,
            "submitted_at": s.submitted_at.isoformat(),
            "lines": s.features.total_lines if s.features else 0,
            "attempt": s.attempt_number
        })
    return out

@router.post("/submissions/upload")
def upload_submission(
    student_name: str = Form(...),
    student_id_str: str = Form(...),
    assignment_title: str = Form(...),
    language: str = Form("python"),
    code: str = Form(...),
    file_name: str = Form("submission.py"),
    db: Session = Depends(get_db)
):
    """Allows uploading raw code or single submission."""
    student = db.query(Student).filter(Student.student_id_str == student_id_str).first()
    if not student:
        student = Student(student_id_str=student_id_str, name=student_name, email=f"{student_id_str.lower()}@university.edu")
        db.add(student)
        db.commit()
        db.refresh(student)

    assignment = db.query(Assignment).filter(Assignment.title == assignment_title).first()
    if not assignment:
        assignment = Assignment(title=assignment_title, language=language)
        db.add(assignment)
        db.commit()
        db.refresh(assignment)

    submission = Submission(
        student_id=student.id,
        assignment_id=assignment.id,
        attempt_number=1,
        file_name=file_name,
        raw_code=code,
        submitted_at=datetime.utcnow()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Normalize & extract features
    norm_code, tokens, chash = normalize_code_pipeline(code, language)
    ast_feat = extract_ast_features(code, language)

    norm_rec = NormalizedCode(submission_id=submission.id, normalized_code=norm_code, tokens_json=tokens, canonical_hash=chash)
    feat_rec = CodeFeatures(
        submission_id=submission.id,
        total_lines=len(code.split('\n')),
        function_count=ast_feat["functions"],
        loop_count=ast_feat["loops"],
        conditional_count=ast_feat["conditionals"],
        max_ast_depth=ast_feat["max_depth"],
        ast_tree_json=ast_feat
    )
    db.add_all([norm_rec, feat_rec])
    db.commit()

    # Compare against existing submissions
    existing = db.query(Submission).filter(Submission.id != submission.id, Submission.assignment_id == assignment.id).all()
    for prev in existing:
        analyze_and_store_pair(db, submission, prev)

    return {"message": "Submission processed and analyzed successfully!", "submission_id": submission.id}

@router.get("/similarity-matrix")
def get_similarity_matrix(db: Session = Depends(get_db)):
    """Generates cross-student similarity matrix grid data."""
    students = db.query(Student).all()
    student_list = [{"id": s.id, "name": s.name, "student_id": s.student_id_str} for s in students]

    results = db.query(SimilarityResult).all()
    matrix = {}

    for r in results:
        sub_a = db.query(Submission).get(r.submission_a_id)
        sub_b = db.query(Submission).get(r.submission_b_id)
        if sub_a and sub_b:
            key1 = f"{sub_a.student_id}_{sub_b.student_id}"
            key2 = f"{sub_b.student_id}_{sub_a.student_id}"
            matrix[key1] = {"pair_id": r.id, "score": r.overall_score, "risk_level": r.risk_level}
            matrix[key2] = {"pair_id": r.id, "score": r.overall_score, "risk_level": r.risk_level}

    return {"students": student_list, "matrix": matrix}

@router.get("/network-graph")
def get_network_graph(db: Session = Depends(get_db)):
    """Generates node and link payload for visual similarity network graph."""
    students = db.query(Student).all()
    nodes = [{"id": str(s.id), "name": s.name, "student_id": s.student_id_str} for s in students]

    results = db.query(SimilarityResult).filter(SimilarityResult.overall_score >= 30.0).all()
    links = []
    for r in results:
        sub_a = db.query(Submission).get(r.submission_a_id)
        sub_b = db.query(Submission).get(r.submission_b_id)
        if sub_a and sub_b:
            links.append({
                "source": str(sub_a.student_id),
                "target": str(sub_b.student_id),
                "value": r.overall_score,
                "risk_level": r.risk_level,
                "pair_id": r.id
            })

    return {"nodes": nodes, "links": links}

@router.get("/comparison/{pair_id}")
def get_code_comparison(pair_id: int, db: Session = Depends(get_db)):
    """Detailed side-by-side comparison payload between Student A and Student B."""
    rec = db.query(SimilarityResult).get(pair_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Similarity comparison pair not found")

    sub_a = db.query(Submission).get(rec.submission_a_id)
    sub_b = db.query(Submission).get(rec.submission_b_id)

    return {
        "pair_id": rec.id,
        "overall_score": rec.overall_score,
        "risk_level": rec.risk_level,
        "status": rec.status,
        "tutor_notes": rec.tutor_notes,
        "scores": {
            "token": rec.token_score,
            "structural": rec.structural_score,
            "semantic": rec.semantic_score,
            "logic": rec.logic_score,
            "behavioral": rec.behavioral_score
        },
        "evidence": rec.evidence_json,
        "student_a": {
            "name": sub_a.student.name,
            "student_id": sub_a.student.student_id_str,
            "submitted_at": sub_a.submitted_at.isoformat(),
            "attempt": sub_a.attempt_number,
            "raw_code": sub_a.raw_code,
            "normalized_code": sub_a.normalized.normalized_code if sub_a.normalized else "",
            "ast_tree": sub_a.features.ast_tree_json if sub_a.features else {}
        },
        "student_b": {
            "name": sub_b.student.name,
            "student_id": sub_b.student.student_id_str,
            "submitted_at": sub_b.submitted_at.isoformat(),
            "attempt": sub_b.attempt_number,
            "raw_code": sub_b.raw_code,
            "normalized_code": sub_b.normalized.normalized_code if sub_b.normalized else "",
            "ast_tree": sub_b.features.ast_tree_json if sub_b.features else {}
        }
    }

@router.get("/reviews")
def get_review_cases(status: Optional[str] = None, db: Session = Depends(get_db)):
    """List review cases for tutor workflow."""
    query = db.query(SimilarityResult).order_by(SimilarityResult.overall_score.desc())
    if status and status != "All":
        query = query.filter(SimilarityResult.status == status)

    results = query.all()
    cases = []
    for r in results:
        sub_a = db.query(Submission).get(r.submission_a_id)
        sub_b = db.query(Submission).get(r.submission_b_id)
        if sub_a and sub_b:
            cases.append({
                "id": r.id,
                "student_a": sub_a.student.name,
                "student_b": sub_b.student.name,
                "assignment": sub_a.assignment.title,
                "overall_score": r.overall_score,
                "risk_level": r.risk_level,
                "status": r.status,
                "tutor_notes": r.tutor_notes,
                "reviewed_by": r.reviewed_by,
                "computed_at": r.computed_at.isoformat()
            })
    return cases

@router.put("/reviews/{pair_id}")
def update_review_case(
    pair_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Updates tutor review decision, status, and instructor notes."""
    rec = db.query(SimilarityResult).get(pair_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Case not found")

    rec.status = payload.get("status", rec.status)
    rec.tutor_notes = payload.get("tutor_notes", rec.tutor_notes)
    rec.reviewed_by = payload.get("reviewed_by", "Tutor Admin")
    rec.reviewed_at = datetime.utcnow()

    db.commit()
    return {"message": "Review case updated successfully!"}

@router.get("/evaluation")
def get_evaluation_metrics():
    """Runs benchmark evaluation suite comparing CodeTrace AI vs Naive Text Matching."""
    return evaluate_benchmark_suite()

@router.get("/dataset")
def get_benchmark_dataset():
    """Returns the 6 synthetic benchmark cases for dataset browser page."""
    return SYNTHETIC_BENCHMARK_CASES

@router.get("/settings")
def get_admin_settings():
    """Returns default weights and risk thresholds."""
    return {
        "weights": DEFAULT_WEIGHTS,
        "thresholds": DEFAULT_THRESHOLDS,
        "fallback_mode": "Offline Local Deterministic Parser (Active)",
        "responsible_ai_disclaimer": "This system identifies similarity patterns and evidence for human review. It does not determine whether a student committed misconduct."
    }
