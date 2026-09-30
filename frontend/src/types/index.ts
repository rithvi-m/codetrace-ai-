export interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface TopSuspiciousPair {
  id: number;
  student_a: string;
  student_b: string;
  assignment: string;
  overall_score: number;
  risk_level: string;
  status: string;
  token_score: number;
  structural_score: number;
  semantic_score: number;
}

export interface DashboardData {
  total_submissions: number;
  students_analyzed: number;
  submission_pairs_analyzed: number;
  high_similarity_pairs: number;
  medium_similarity_pairs: number;
  low_similarity_pairs: number;
  pending_reviews: number;
  average_similarity_score: number;
  risk_distribution: RiskDistributionItem[];
  top_suspicious_pairs: TopSuspiciousPair[];
}

export interface SubmissionItem {
  id: number;
  student_name: string;
  student_id: string;
  assignment_title: string;
  file_name: string;
  submitted_at: string;
  lines: number;
  attempt: number;
}

export interface EvidenceCard {
  type: string;
  title: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  description: string;
}

export interface ComparisonStudent {
  name: string;
  student_id: string;
  submitted_at: string;
  attempt: number;
  raw_code: string;
  normalized_code: string;
  ast_tree: any;
}

export interface CodeComparisonPayload {
  pair_id: number;
  overall_score: number;
  risk_level: string;
  status: string;
  tutor_notes: string | null;
  scores: {
    token: number;
    structural: number;
    semantic: number;
    logic: number;
    behavioral: number;
  };
  evidence: EvidenceCard[];
  student_a: ComparisonStudent;
  student_b: ComparisonStudent;
}

export interface StudentNode {
  id: string;
  name: string;
  student_id: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  risk_level: string;
  pair_id: number;
}

export interface NetworkGraphData {
  nodes: StudentNode[];
  links: GraphLink[];
}

export interface MatrixStudent {
  id: number;
  name: string;
  student_id: string;
}

export interface MatrixCell {
  pair_id: number;
  score: number;
  risk_level: string;
}

export interface SimilarityMatrixData {
  students: MatrixStudent[];
  matrix: Record<string, MatrixCell>;
}

export interface CaseMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  detection_rate: number;
  false_positive_rate: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface CaseResultItem {
  case_id: string;
  case_title: string;
  score: number;
  risk_level?: string;
  flagged: boolean;
  expected_flag: boolean;
  correct: boolean;
  evidence?: EvidenceCard[];
}

export interface EvaluationData {
  dataset_name: string;
  timestamp: string;
  naive_text_matching: {
    metrics: CaseMetrics;
    case_results: CaseResultItem[];
  };
  codetrace_ai: {
    metrics: CaseMetrics;
    case_results: CaseResultItem[];
  };
}

export interface ReviewCase {
  id: number;
  student_a: string;
  student_b: string;
  assignment: string;
  overall_score: number;
  risk_level: string;
  status: string;
  tutor_notes: string | null;
  reviewed_by: string | null;
  computed_at: string;
}
