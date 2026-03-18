
export interface ConsumerMetrics {
  processed: number;
  failed: number;
  retried: number;
  dlq: number;
  errors_by_phase: Record<string, number>;
  errors_by_type: Record<string, number>;
}
