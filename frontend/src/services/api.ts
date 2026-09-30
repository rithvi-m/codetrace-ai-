import {
  DashboardData,
  SubmissionItem,
  CodeComparisonPayload,
  SimilarityMatrixData,
  NetworkGraphData,
  ReviewCase,
  EvaluationData
} from '../types';

const API_BASE_RELATIVE = '/api';
const API_BASE_FALLBACK = 'http://127.0.0.1:8000/api';

async function safeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_RELATIVE}${endpoint}`, options);
    if (res.ok) return res;
  } catch (e) {
    // Fallback if relative proxy fails
  }
  return fetch(`${API_BASE_FALLBACK}${endpoint}`, options);
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await safeFetch('/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function triggerDemoSeed(): Promise<any> {
  const res = await safeFetch('/demo-seed', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to activate Hackathon Demo Mode');
  return res.json();
}

export async function fetchSubmissions(): Promise<SubmissionItem[]> {
  const res = await safeFetch('/submissions');
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}

export async function uploadSubmission(formData: FormData): Promise<any> {
  const res = await safeFetch('/submissions/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload submission');
  return res.json();
}

export async function fetchSimilarityMatrix(): Promise<SimilarityMatrixData> {
  const res = await safeFetch('/similarity-matrix');
  if (!res.ok) throw new Error('Failed to fetch similarity matrix');
  return res.json();
}

export async function fetchNetworkGraph(): Promise<NetworkGraphData> {
  const res = await safeFetch('/network-graph');
  if (!res.ok) throw new Error('Failed to fetch network graph');
  return res.json();
}

export async function fetchComparison(pairId: number): Promise<CodeComparisonPayload> {
  const res = await safeFetch(`/comparison/${pairId}`);
  if (!res.ok) throw new Error('Failed to fetch comparison details');
  return res.json();
}

export async function fetchReviewCases(status?: string): Promise<ReviewCase[]> {
  const endpoint = status ? `/reviews?status=${encodeURIComponent(status)}` : '/reviews';
  const res = await safeFetch(endpoint);
  if (!res.ok) throw new Error('Failed to fetch review cases');
  return res.json();
}

export async function updateReviewCase(pairId: number, status: string, notes: string): Promise<any> {
  const res = await safeFetch(`/reviews/${pairId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, tutor_notes: notes, reviewed_by: 'Tutor Admin' })
  });
  if (!res.ok) throw new Error('Failed to update review case');
  return res.json();
}

export async function fetchEvaluationMetrics(): Promise<EvaluationData> {
  const res = await safeFetch('/evaluation');
  if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
  return res.json();
}

export async function fetchBenchmarkDataset(): Promise<any[]> {
  const res = await safeFetch('/dataset');
  if (!res.ok) throw new Error('Failed to fetch dataset');
  return res.json();
}

export async function fetchAdminSettings(): Promise<any> {
  const res = await safeFetch('/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}
