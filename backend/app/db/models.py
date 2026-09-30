from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    language = Column(String(50), default="python")
    description = Column(Text, nullable=True)
    starter_code = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="assignment")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id_str = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=True)

    submissions = relationship("Submission", back_populates="student")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    attempt_number = Column(Integer, default=1)
    file_name = Column(String(150), nullable=False)
    raw_code = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")
    normalized = relationship("NormalizedCode", back_populates="submission", uselist=False)
    features = relationship("CodeFeatures", back_populates="submission", uselist=False)

class NormalizedCode(Base):
    __tablename__ = "normalized_code"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    normalized_code = Column(Text, nullable=False)
    tokens_json = Column(JSON, nullable=False)
    canonical_hash = Column(String(64), nullable=False)

    submission = relationship("Submission", back_populates="normalized")

class CodeFeatures(Base):
    __tablename__ = "code_features"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    total_lines = Column(Integer, default=0)
    function_count = Column(Integer, default=0)
    loop_count = Column(Integer, default=0)
    conditional_count = Column(Integer, default=0)
    max_ast_depth = Column(Integer, default=0)
    ast_tree_json = Column(JSON, nullable=True)
    feature_vector = Column(JSON, nullable=True)

    submission = relationship("Submission", back_populates="features")

class SimilarityResult(Base):
    __tablename__ = "similarity_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_a_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    submission_b_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    token_score = Column(Float, default=0.0)
    structural_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    logic_score = Column(Float, default=0.0)
    behavioral_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default="Low Similarity")
    evidence_json = Column(JSON, nullable=True)
    status = Column(String(50), default="New")  # New, Under Review, Reviewed, Dismissed, Confirmed
    tutor_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True)
    value_json = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
