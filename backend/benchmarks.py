from typing import List
from models import Benchmark

BENCHMARKS: List[Benchmark] = [
    Benchmark(
        id="fin_001",
        category="financial",
        query="What were total Q3 2024 revenue figures broken down by product line, filtered to North America?",
        ground_truth="Total Q3 2024 North America revenue was $142.3M split across: Enterprise ($89.1M), Mid-Market ($38.7M), SMB ($14.5M).",
        metadata_context="Table: revenue_quarterly. Columns: region, product_line, quarter, year, amount_usd. Governance: PII-free, finance-team access.",
        expected_sql="SELECT product_line, SUM(amount_usd) FROM revenue_quarterly WHERE region='North America' AND quarter='Q3' AND year=2024 GROUP BY product_line",
        difficulty="medium",
    ),
    Benchmark(
        id="fin_002",
        category="financial",
        query="Which customers had overdue invoices greater than 90 days as of last month?",
        ground_truth="14 customers had invoices overdue 90+ days as of March 2025, totaling $2.1M outstanding.",
        metadata_context="Table: invoices. Columns: customer_id, due_date, status, amount. Governance: restricted to finance and sales ops.",
        expected_sql="SELECT customer_id, amount FROM invoices WHERE status='overdue' AND DATEDIFF(NOW(), due_date) > 90",
        difficulty="medium",
    ),
    Benchmark(
        id="fin_003",
        category="financial",
        query="Show me year-over-year gross margin change for each business unit in 2023 vs 2024.",
        ground_truth="YoY gross margin: Cloud +4.2pp, On-Prem -1.8pp, Professional Services +0.9pp.",
        metadata_context="Table: financials_annual. Columns: business_unit, year, revenue, cogs, gross_margin_pct.",
        expected_sql="SELECT business_unit, year, gross_margin_pct FROM financials_annual WHERE year IN (2023, 2024) ORDER BY business_unit, year",
        difficulty="hard",
    ),
    Benchmark(
        id="ops_001",
        category="operational",
        query="What is the average time to resolve P1 support tickets by engineering team in 2024?",
        ground_truth="Average P1 resolution time 2024: Platform team 3.2h, Data team 4.7h, Integrations team 6.1h.",
        metadata_context="Table: support_tickets. Columns: ticket_id, priority, assigned_team, created_at, resolved_at.",
        expected_sql="SELECT assigned_team, AVG(DATEDIFF(resolved_at, created_at)*24) as avg_hours FROM support_tickets WHERE priority='P1' AND YEAR(created_at)=2024 GROUP BY assigned_team",
        difficulty="medium",
    ),
    Benchmark(
        id="ops_002",
        category="operational",
        query="Which data pipelines failed more than 3 times in the last 30 days?",
        ground_truth="7 pipelines exceeded 3 failures in the last 30 days: etl_customer_sync (12), bi_revenue_roll (8), ml_churn_features (5).",
        metadata_context="Table: pipeline_runs. Columns: pipeline_id, pipeline_name, status, run_date, error_message.",
        expected_sql="SELECT pipeline_name, COUNT(*) as failures FROM pipeline_runs WHERE status='failed' AND run_date >= NOW()-INTERVAL 30 DAY GROUP BY pipeline_name HAVING failures > 3",
        difficulty="medium",
    ),
    Benchmark(
        id="ops_003",
        category="operational",
        query="List all data assets that have not been accessed in the last 6 months but are still marked as certified.",
        ground_truth="43 certified assets have had zero access in 6+ months, representing stale governance burden.",
        metadata_context="Table: catalog_assets. Columns: asset_id, name, certification_status, last_accessed_at, owner_team.",
        expected_sql="SELECT name, owner_team, last_accessed_at FROM catalog_assets WHERE certification_status='certified' AND last_accessed_at < NOW()-INTERVAL 6 MONTH",
        difficulty="hard",
    ),
    Benchmark(
        id="gov_001",
        category="governance",
        query="Which datasets contain PII fields and have been accessed by users outside the data governance team in the past month?",
        ground_truth="9 PII datasets had external access: customer_profiles (22 users), employee_records (4 users), payment_methods (11 users).",
        metadata_context="Table: access_logs, data_classifications. Joins on asset_id. Governance: restricted query - governance team only.",
        expected_sql="SELECT d.asset_name, COUNT(DISTINCT a.user_id) FROM access_logs a JOIN data_classifications d ON a.asset_id=d.asset_id WHERE d.has_pii=TRUE AND a.user_team != 'governance' AND a.accessed_at >= NOW()-INTERVAL 1 MONTH GROUP BY d.asset_name",
        difficulty="hard",
    ),
    Benchmark(
        id="gov_002",
        category="governance",
        query="Show all policy violations where masked fields were queried without proper role assignment in Q1 2025.",
        ground_truth="37 policy violations recorded in Q1 2025 across 12 users, primarily on the ssn_hash and card_number_masked fields.",
        metadata_context="Table: policy_violations. Columns: violation_id, user_id, field_name, query_time, role_at_time.",
        expected_sql="SELECT field_name, COUNT(*) as violations, COUNT(DISTINCT user_id) as affected_users FROM policy_violations WHERE query_time BETWEEN '2025-01-01' AND '2025-03-31' GROUP BY field_name",
        difficulty="hard",
    ),
    Benchmark(
        id="ml_001",
        category="ml_features",
        query="What features were used in the customer churn model version 3.2 and what are their data sources?",
        ground_truth="Churn model v3.2 uses 14 features: 6 from CRM, 4 from usage_events, 3 from support_tickets, 1 from billing.",
        metadata_context="Table: ml_feature_registry. Columns: model_name, version, feature_name, source_table, last_updated.",
        expected_sql="SELECT feature_name, source_table FROM ml_feature_registry WHERE model_name='churn_model' AND version='3.2'",
        difficulty="medium",
    ),
    Benchmark(
        id="ml_002",
        category="ml_features",
        query="Which model features have upstream data quality issues flagged in the last 14 days?",
        ground_truth="3 feature sources have active quality flags: usage_events.session_duration (null rate 12%), billing.mrr (schema drift), crm.last_contact_date (staleness warning).",
        metadata_context="Table: data_quality_alerts, ml_feature_registry. Join on source_table.",
        expected_sql="SELECT f.feature_name, q.issue_type, q.flagged_at FROM ml_feature_registry f JOIN data_quality_alerts q ON f.source_table=q.table_name WHERE q.flagged_at >= NOW()-INTERVAL 14 DAY",
        difficulty="hard",
    ),
    Benchmark(
        id="comp_001",
        category="compliance",
        query="Generate a GDPR data lineage report for all EU customer records showing where data flows from ingestion to reporting.",
        ground_truth="EU customer data flows: Salesforce CRM -> raw_customers -> customers_clean -> eu_customer_profiles -> gdpr_reporting_view. 4 transformation steps, 2 masking operations.",
        metadata_context="Table: lineage_graph. Columns: source_asset, target_asset, transformation_type, region_scope.",
        expected_sql="SELECT source_asset, target_asset, transformation_type FROM lineage_graph WHERE region_scope='EU' ORDER BY lineage_step",
        difficulty="hard",
    ),
    Benchmark(
        id="comp_002",
        category="compliance",
        query="Which data stewards have not reviewed their assigned datasets in over 60 days?",
        ground_truth="11 stewards are overdue for review with combined dataset ownership of 234 assets.",
        metadata_context="Table: stewardship_assignments. Columns: steward_id, steward_name, asset_id, last_review_date.",
        expected_sql="SELECT steward_name, COUNT(asset_id) as overdue_assets FROM stewardship_assignments WHERE last_review_date < NOW()-INTERVAL 60 DAY GROUP BY steward_name",
        difficulty="easy",
    ),
]


def get_all_benchmarks() -> List[Benchmark]:
    return BENCHMARKS


def get_benchmark_by_id(benchmark_id: str) -> Benchmark:
    for b in BENCHMARKS:
        if b.id == benchmark_id:
            return b
    return None


def get_benchmarks_by_category(category: str) -> List[Benchmark]:
    return [b for b in BENCHMARKS if b.category == category]


CATEGORIES = list(set(b.category for b in BENCHMARKS))
