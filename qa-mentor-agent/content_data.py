"""Content data embedded as Python literals (not read from JSON files at
request time), so it is guaranteed to be included by Vercel's Python
build-time import tracing regardless of any static-asset bundling
behavior. Generated from data/roles/*.json, data/lessons/*.json, and
data/radar/items.json - those files remain the human-edited source; run
the generation script again after editing them.
"""

ROLES = {'cloud-platform': {'advantages': ['High-leverage work — good platform tooling multiplies the '
                                   'productivity of every other engineer',
                                   'Strong demand and compensation for deep cloud expertise',
                                   'Clear path toward Solutions Architect or Principal '
                                   'Engineer roles'],
                    'ai_impact': 'AI tools are speeding up first-draft Terraform/IaC and '
                                 'helping catch some misconfigurations, but judgment about '
                                 'security posture, cost tradeoffs, and blast radius still '
                                 "needs a human owner — this is TechOrbit's own assessment, "
                                 'not a cited industry statistic.',
                    'certifications': [{'issuer': 'AWS',
                                        'name': 'AWS Certified Cloud Practitioner',
                                        'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                                       {'issuer': 'AWS',
                                        'name': 'AWS Certified Solutions Architect — '
                                                'Associate',
                                        'url': 'https://aws.amazon.com/certification/certified-solutions-architect-associate'},
                                       {'issuer': 'HashiCorp',
                                        'name': 'HashiCorp Certified: Terraform Associate',
                                        'url': 'https://developer.hashicorp.com/certifications/infrastructure-automation'},
                                       {'issuer': 'CNCF / Linux Foundation',
                                        'name': 'Certified Kubernetes Administrator (CKA)',
                                        'url': 'https://www.cncf.io/training/certification/cka/'}],
                    'challenges': ['Multi-cloud/hybrid environments add real complexity '
                                   'beyond single-provider knowledge',
                                   'Easy to over-engineer a platform nobody asked for instead '
                                   'of solving the actual pain point',
                                   'Security and cost governance responsibilities carry real '
                                   'organizational risk if done poorly'],
                    'common_tools': ['Terraform',
                                     'Kubernetes',
                                     'AWS/Azure/GCP console',
                                     'Backstage',
                                     'Helm',
                                     'Vault'],
                    'daily_responsibilities': ['Design and provision cloud infrastructure '
                                               '(compute, networking, storage, identity)',
                                               'Build and maintain internal developer '
                                               'platform tooling and golden paths',
                                               'Manage cost, security, and access controls '
                                               'across cloud accounts',
                                               'Write infrastructure as code and review infra '
                                               'changes from other teams',
                                               'Support developers who are unblocking '
                                               'infrastructure issues',
                                               'Plan for multi-region, high-availability, and '
                                               'disaster-recovery scenarios'],
                    'definition': 'A Cloud/Platform Engineer builds and manages the cloud '
                                  'infrastructure and internal tooling other engineers rely '
                                  'on — provisioning cloud resources, and increasingly, '
                                  'building self-service "internal developer platforms" so '
                                  'product teams can ship without needing deep infrastructure '
                                  'expertise themselves.',
                    'example_progression': ['Junior Cloud Engineer',
                                            'Cloud/Platform Engineer',
                                            'Senior Platform Engineer',
                                            'Staff Engineer or Solutions Architect',
                                            'Principal Engineer / Head of Infrastructure'],
                    'expectations': {'advanced': 'Owns cloud/platform architecture strategy '
                                                 'across the org, builds self-service '
                                                 'developer platforms, mentors other '
                                                 'engineers.',
                                     'beginner': 'Provisions well-defined infrastructure with '
                                                 'guidance, understands the account/network '
                                                 'structure, fixes small platform issues.',
                                     'intermediate': 'Designs new infrastructure and platform '
                                                     'tooling independently, manages cost and '
                                                     "access for a team's cloud footprint."},
                    'fit_assessment': ['Do you enjoy designing systems that other engineers '
                                       'will build on top of, more than building user-facing '
                                       'features yourself?',
                                       'Are you comfortable owning security and cost '
                                       'tradeoffs, not just uptime?',
                                       'Do you like turning a repeated manual infrastructure '
                                       'request into a reusable, documented, self-service '
                                       'tool?'],
                    'future_outlook': 'Platform engineering (building internal developer '
                                      'platforms, not just raw cloud infra) is the clearest '
                                      'growth direction for this role as organizations try to '
                                      'reduce the cognitive load on product engineering teams '
                                      "— this is TechOrbit's own assessment, not a cited "
                                      'industry statistic.',
                    'governance': {'author': 'TechOrbit content team',
                                   'last_reviewed': '2026-09-22',
                                   'next_review': None,
                                   'reviewer': None,
                                   'sources': ['Written from general, well-established '
                                               'cloud/platform engineering practice; '
                                               'certification names/URLs verified via web '
                                               'search on 2026-09-22.'],
                                   'version': '0.1'},
                    'interview_topics': ['Design the cloud network architecture for a given '
                                         'scenario',
                                         'How would you structure IAM/access for multiple '
                                         'teams sharing a cloud account?',
                                         'Infrastructure as code review: spot the risk in '
                                         'this Terraform change',
                                         'What makes a good internal developer platform vs. '
                                         'just a pile of scripts?'],
                    'labs': ['Coming soon: cloud/Kubernetes simulations and a CI/CD pipeline '
                             'builder.',
                             'For now, practice on a free-tier cloud account: provision real '
                             'infrastructure with Terraform and tear it down cleanly.'],
                    'market_info': {'as_of_date': None,
                                    'location': None,
                                    'source_url': None,
                                    'status': 'not_yet_sourced',
                                    'summary': 'Salary and demand figures are intentionally '
                                               'left blank until a specific, dated, citable '
                                               'source is attached — the blueprint requires '
                                               'location/date context, and this page '
                                               "shouldn't guess."},
                    'portfolio_expectations': ['A public repo of real Terraform modules '
                                               'provisioning actual infrastructure, not a '
                                               'tutorial copy',
                                               'Documentation showing your reasoning for a '
                                               'network/security design, not just the end '
                                               'result',
                                               'A golden-path template or internal tool with '
                                               'a clear README explaining the problem it '
                                               'solves',
                                               'Evidence of cost-awareness — e.g. a note on '
                                               "how you'd keep a given setup within a budget"],
                    'projects': [{'description': 'Stand up a small real environment (network, '
                                                 'compute, database) on a free-tier cloud '
                                                 'account, fully as code.',
                                  'id': 'provision-environment-terraform',
                                  'level': 'guided',
                                  'steps': ['Pick a free-tier cloud account (AWS, GCP, or '
                                            'Azure) and set up billing alerts before writing '
                                            'any code',
                                            'Write Terraform for a VPC/network with public '
                                            'and private subnets',
                                            'Provision a small compute instance and a managed '
                                            'database in the private subnet',
                                            'Add remote state (S3/GCS bucket + lock table) '
                                            'instead of local state',
                                            'Run terraform plan and apply from a clean '
                                            "checkout to prove it's fully reproducible"],
                                  'stretch_goals': ['Add a terraform destroy check to CI so '
                                                    "environments don't leak cost",
                                                    'Split the config into reusable modules '
                                                    '(network, compute, database)'],
                                  'tech_stack': ['Terraform', 'AWS, GCP, or Azure', 'Git'],
                                  'title': 'Provision a real environment with Terraform'},
                                 {'description': 'Create a reusable, documented template '
                                                 '(e.g. Terraform module or Helm chart) '
                                                 'another team could self-serve with.',
                                  'id': 'build-golden-path-template',
                                  'level': 'independent',
                                  'steps': ['Pick one recurring need (e.g. "a service with a '
                                            'database and a queue") and design its ideal '
                                            'shape',
                                            'Build it as a Terraform module or Helm chart '
                                            'with sane, overridable defaults',
                                            'Write a README a stranger could follow with zero '
                                            'extra context',
                                            'Provision a real environment from the template '
                                            'to prove it actually works end-to-end',
                                            'Get a teammate or study-group peer to use it '
                                            'without your help and fix whatever confused '
                                            'them'],
                                  'stretch_goals': ['Add automated validation (terraform '
                                                    'validate / helm lint) in CI',
                                                    'Publish it to a private module registry '
                                                    'or internal Git repo with versioned '
                                                    'releases'],
                                  'tech_stack': ['Terraform or Helm',
                                                 'Git',
                                                 'a free-tier cloud account'],
                                  'title': 'Build a golden-path template'},
                                 {'description': 'Document (and where possible provision) a '
                                                 'realistic multi-account cloud structure '
                                                 'with clear security and cost boundaries.',
                                  'id': 'multi-account-multi-region-setup',
                                  'level': 'advanced-capstone',
                                  'steps': ['Design an account/project structure separating '
                                            'prod, staging, and shared tooling',
                                            'Document IAM boundaries: who can do what, in '
                                            'which account',
                                            'Provision at least two accounts/regions and a '
                                            'way to deploy to both from one pipeline',
                                            'Add a cost-boundary story: budgets, tagging, and '
                                            'alerts per account',
                                            'Write a one-page architecture doc explaining the '
                                            'tradeoffs you chose'],
                                  'stretch_goals': ['Add automated drift detection between '
                                                    'the documented design and actual '
                                                    'infrastructure',
                                                    'Simulate a region failure and document '
                                                    'the failover plan'],
                                  'tech_stack': ['Terraform',
                                                 'AWS Organizations or GCP folders',
                                                 'IAM'],
                                  'title': 'Design a multi-account/multi-region setup'}],
                    'recommended_languages': ['Python', 'Go', 'Bash'],
                    'related_roles': ['DevOps Engineer',
                                      'Site Reliability Engineer',
                                      'Cloud Engineer',
                                      'Solutions Architect',
                                      'Infrastructure Engineer'],
                    'required_nontechnical_skills': ['Designing tools and workflows other '
                                                     'engineers will actually want to use',
                                                     'Balancing security/governance '
                                                     'requirements against developer velocity',
                                                     'Clear documentation — a platform is '
                                                     'only as good as its onboarding docs'],
                    'required_technical_skills': ['Deep knowledge of at least one cloud '
                                                  'provider (AWS, Azure, or GCP)',
                                                  'Infrastructure as code (Terraform or a '
                                                  'cloud-native equivalent)',
                                                  'Networking fundamentals (VPCs, subnets, '
                                                  'load balancers, DNS)',
                                                  'Identity and access management '
                                                  '(least-privilege design)',
                                                  'Kubernetes or a managed container platform',
                                                  'Cost management and monitoring for cloud '
                                                  'spend'],
                    'resources': [{'title': 'Terraform official docs',
                                   'url': 'https://developer.hashicorp.com/terraform/docs'},
                                  {'title': 'AWS Well-Architected Framework',
                                   'url': 'https://aws.amazon.com/architecture/well-architected/'},
                                  {'title': 'TechOrbit Resources page', 'url': '/resources'}],
                    'roadmap': {'link': None,
                                'stages': [{'duration': '3-4 weeks',
                                            'name': 'Cloud fundamentals',
                                            'topics': ['Compute, storage, networking basics '
                                                       'on one cloud provider',
                                                       'IAM and least-privilege design']},
                                           {'duration': '2-3 weeks',
                                            'name': 'Networking deep dive',
                                            'topics': ['VPCs, subnets, routing, load '
                                                       'balancers',
                                                       'DNS and TLS basics']},
                                           {'duration': '3-4 weeks',
                                            'name': 'Infrastructure as code',
                                            'topics': ['Terraform modules and state '
                                                       'management',
                                                       'Reviewing infra changes safely']},
                                           {'duration': '4 weeks',
                                            'name': 'Containers & Kubernetes',
                                            'topics': ['Running workloads on a managed '
                                                       'Kubernetes service',
                                                       'Helm charts and cluster operations']},
                                           {'duration': '2 weeks',
                                            'name': 'Cost & security governance',
                                            'topics': ['Cost monitoring and budgets',
                                                       'Security baselines and guardrails']},
                                           {'duration': '3-4 weeks',
                                            'name': 'Platform engineering',
                                            'topics': ['Building a self-service golden path '
                                                       'for a common task',
                                                       'Internal developer platform concepts '
                                                       '(e.g. Backstage)']}],
                                'summary': 'A path from core cloud fundamentals through '
                                           'infrastructure as code into platform engineering '
                                           '— building tools other engineers use. Follow the '
                                           'stages below — a dedicated interactive roadmap '
                                           'page for this track is coming soon.'},
                    'slug': 'cloud-platform',
                    'status': 'Growing',
                    'title': 'Cloud / Platform Engineer',
                    'transition_paths': ['DevOps Engineer → Platform Engineer',
                                         'Cloud Engineer → Solutions Architect',
                                         'Backend Developer → Cloud/Platform Engineer']},
 'data-ai': {'advantages': ["Sits at the center of a company's decision-making — data work "
                            'has broad, visible impact',
                            'Fast-growing demand as more products add AI/ML features',
                            'Skills split cleanly into deeper specializations (Data Engineer, '
                            'ML Engineer, AI Engineer) as you grow'],
             'ai_impact': 'This role is being reshaped by AI faster than most — LLMs are now '
                          'a standard building block for features, not just a research topic, '
                          'and demand for people who can integrate them reliably (not just '
                          "call an API) is growing fast — this is TechOrbit's own assessment, "
                          'not a cited industry statistic.',
             'certifications': [{'issuer': 'Google Cloud',
                                 'name': 'Google Cloud Professional Data Engineer',
                                 'url': 'https://cloud.google.com/learn/certification/data-engineer'},
                                {'issuer': 'Databricks',
                                 'name': 'Databricks Certified Data Engineer Associate',
                                 'url': 'https://www.databricks.com/learn/certification/data-engineer-associate'},
                                {'issuer': 'AWS',
                                 'name': 'AWS Certified Machine Learning Engineer — Associate',
                                 'url': 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/'}],
             'challenges': ['Breadth is real — data engineering, ML, and AI integration are '
                            'each deep fields on their own',
                            "Data quality problems are often someone else's mess to clean up, "
                            'which can be thankless',
                            "Fast-moving AI tooling means constantly re-evaluating what's "
                            'worth learning deeply vs. lightly'],
             'common_tools': ['Airflow',
                              'dbt',
                              'Snowflake',
                              'BigQuery',
                              'Spark',
                              'Kafka',
                              'Jupyter'],
             'daily_responsibilities': ['Build and maintain data pipelines (ETL/ELT) that '
                                        'move data reliably between systems',
                                        'Design data models and warehouse/lakehouse schemas',
                                        'Prepare, clean, and validate data for analytics or '
                                        'ML use',
                                        'Build, evaluate, and deploy ML models or integrate '
                                        'LLM-powered features',
                                        'Monitor data quality and pipeline health, and fix '
                                        'breakages',
                                        'Work with analysts/data scientists on what data and '
                                        'features they need'],
             'definition': 'A Data & AI Engineer builds the pipelines that move and shape '
                           'data, and the systems that turn it into machine learning or '
                           'AI-powered features — a hybrid role common at small-to-mid-size '
                           "companies before they're large enough to split it into separate "
                           'Data Engineer, ML Engineer, and AI Engineer roles.',
             'example_progression': ['Junior Data Engineer',
                                     'Data Engineer',
                                     'Senior Data/AI Engineer',
                                     'Staff Engineer or ML/AI Lead',
                                     'Principal Engineer / Head of Data'],
             'expectations': {'advanced': 'Owns data platform architecture, leads ML/AI '
                                          'feature integration end to end, mentors others on '
                                          'data quality practices.',
                              'beginner': 'Builds and maintains existing pipelines with '
                                          'guidance, writes solid SQL, understands the data '
                                          'model.',
                              'intermediate': 'Designs new pipelines and data models '
                                              'independently, builds and evaluates basic ML '
                                              'models.'},
             'fit_assessment': ['Do you enjoy tracing a data quality issue back through a '
                                'pipeline to find the real root cause?',
                                'Are you comfortable moving between SQL, Python, and '
                                'higher-level ML/AI concepts in the same week?',
                                'Do you care about whether a model or AI feature is actually '
                                'reliable, not just whether it demoed well once?'],
             'future_outlook': 'As companies scale, this combined role commonly splits into '
                               'Data Engineer, ML Engineer, and AI Engineer specializations — '
                               'starting here is a reasonable way to discover which of those '
                               "you actually enjoy — this is TechOrbit's own assessment, not "
                               'a cited industry statistic.',
             'governance': {'author': 'TechOrbit content team',
                            'last_reviewed': '2026-09-22',
                            'next_review': None,
                            'reviewer': None,
                            'sources': ['Written from general, well-established data/ML '
                                        'engineering practice; certification names/URLs '
                                        'verified via web search on 2026-09-22.'],
                            'version': '0.1'},
             'interview_topics': ['SQL problem-solving (joins, window functions, query '
                                  'optimization)',
                                  'Designing a data pipeline for a given scenario (batch vs. '
                                  'streaming, failure handling)',
                                  'ML fundamentals: overfitting, train/test splits, '
                                  'evaluation metrics',
                                  'How would you evaluate whether an LLM-powered feature is '
                                  'working well?'],
             'labs': ['Coming soon: a SQL playground with sample databases and a pipeline '
                      'builder.',
                      'For now, practice by building a small ETL pipeline locally with a free '
                      'sample dataset and Airflow or a simple Python script.'],
             'market_info': {'as_of_date': None,
                             'location': None,
                             'source_url': None,
                             'status': 'not_yet_sourced',
                             'summary': 'Salary and demand figures are intentionally left '
                                        'blank until a specific, dated, citable source is '
                                        'attached — the blueprint requires location/date '
                                        "context, and this page shouldn't guess."},
             'portfolio_expectations': ['A public repo with a real, working data pipeline '
                                        '(not just a tutorial copy), including data-quality '
                                        'checks',
                                        'A trained model with a documented evaluation — '
                                        "accuracy alone isn't enough, show you understand the "
                                        'metric choice',
                                        'An LLM-integrated feature with a written note on how '
                                        'you evaluated whether it actually works',
                                        'Clear documentation of data sources, assumptions, '
                                        'and known limitations'],
             'projects': [{'description': 'Pull data from a public API, clean and load it '
                                          'into a database on a schedule, with basic '
                                          'data-quality checks.',
                           'id': 'build-etl-pipeline',
                           'level': 'guided',
                           'steps': ['Pick a free public API with enough data to be '
                                     'interesting (weather, finance, transit, etc.)',
                                     'Write an extract step that pulls data on a schedule and '
                                     'handles failures gracefully',
                                     'Write transform logic that cleans, validates, and '
                                     'reshapes the data',
                                     'Load it into a real database (Postgres/SQLite) with a '
                                     'sensible schema',
                                     'Add data-quality checks that fail loudly when the '
                                     'source data looks wrong'],
                           'stretch_goals': ['Add incremental loads instead of full refreshes',
                                             "Visualize the pipeline's output in a small "
                                             'dashboard'],
                           'tech_stack': ['Python',
                                          'Pandas',
                                          'a scheduler (cron/Airflow)',
                                          'PostgreSQL or SQLite'],
                           'title': 'Build an ETL pipeline'},
                          {'description': 'Train a model on a public dataset, evaluate it '
                                          'properly, and serve predictions via a small API.',
                           'id': 'train-deploy-ml-model',
                           'level': 'independent',
                           'steps': ['Choose a public dataset and a clearly-scoped prediction '
                                     'task',
                                     'Split data properly (train/validation/test) and '
                                     'establish a baseline',
                                     'Train a model, tune it, and evaluate with metrics '
                                     'appropriate to the task',
                                     'Wrap the trained model in a small API that returns '
                                     'predictions',
                                     "Document the model's limitations and where it's likely "
                                     'to fail'],
                           'stretch_goals': ['Add model versioning and a simple retraining '
                                             'script',
                                             'Monitor prediction drift once the API is live'],
                           'tech_stack': ['Python',
                                          'scikit-learn or PyTorch',
                                          'FastAPI or Flask'],
                           'title': 'Train and deploy a simple ML model'},
                          {'description': 'Combine a data pipeline with an LLM API call to '
                                          'build something like a summarization or '
                                          'classification feature, with basic evaluation.',
                           'id': 'llm-powered-feature-real-data',
                           'level': 'advanced-capstone',
                           'steps': ['Pick a concrete task (summarization, classification, '
                                     'extraction) grounded in real data',
                                     'Build a small pipeline that feeds real records into an '
                                     'LLM API with a well-scoped prompt',
                                     'Add basic evaluation: a labeled sample set and a '
                                     'scoring method, not just eyeballing outputs',
                                     'Handle failure modes (rate limits, malformed output, '
                                     'hallucinated fields)',
                                     'Write up what the evaluation showed, including where '
                                     'the feature is unreliable'],
                           'stretch_goals': ['Add automated regression evaluation that runs '
                                             'on every prompt change',
                                             'Compare two different prompts or models against '
                                             'the same eval set'],
                           'tech_stack': ['Python', 'an LLM API', 'a data source or database'],
                           'title': 'Build an LLM-powered feature with real data'}],
             'recommended_languages': ['Python', 'SQL'],
             'related_roles': ['Data Engineer',
                               'Machine Learning Engineer',
                               'AI Engineer',
                               'Analytics Engineer',
                               'Data Scientist'],
             'required_nontechnical_skills': ['Translating vague business questions into '
                                              'concrete data requirements',
                                              'Communicating data quality issues and their '
                                              'impact clearly to non-technical stakeholders',
                                              'Judgment about when a simple pipeline is '
                                              'enough vs. when real ML is warranted'],
             'required_technical_skills': ['Strong SQL and a programming language (Python)',
                                           'ETL/ELT tools and orchestration (Airflow or '
                                           'similar)',
                                           'Data warehousing concepts (Snowflake, BigQuery, '
                                           'or a similar platform)',
                                           'Basics of machine learning workflows: training, '
                                           'evaluation, deployment',
                                           'Working with APIs to integrate LLM-based features',
                                           'Data modeling and understanding of batch vs. '
                                           'streaming pipelines'],
             'resources': [{'title': 'dbt official docs', 'url': 'https://docs.getdbt.com/'},
                           {'title': 'Apache Airflow official docs',
                            'url': 'https://airflow.apache.org/docs/'},
                           {'title': 'TechOrbit Resources page', 'url': '/resources'}],
             'roadmap': {'link': None,
                         'stages': [{'duration': '3-4 weeks',
                                     'name': 'SQL & data modeling fundamentals',
                                     'topics': ['Joins, window functions, aggregations',
                                                'Star schema and dimensional modeling '
                                                'basics']},
                                    {'duration': '3-4 weeks',
                                     'name': 'Python for data engineering',
                                     'topics': ['pandas, data validation',
                                                'Writing testable, production-quality data '
                                                'code']},
                                    {'duration': '4 weeks',
                                     'name': 'ETL/ELT & orchestration',
                                     'topics': ['Airflow DAGs',
                                                'Incremental loads, backfills, idempotency']},
                                    {'duration': '2-3 weeks',
                                     'name': 'Data warehousing',
                                     'topics': ['Snowflake or BigQuery basics',
                                                'Partitioning and cost-aware query design']},
                                    {'duration': '4-6 weeks',
                                     'name': 'Applied ML fundamentals',
                                     'topics': ['Training/evaluating a basic model',
                                                'Feature engineering basics']},
                                    {'duration': '2-3 weeks',
                                     'name': 'AI feature integration',
                                     'topics': ['Calling an LLM API for a real feature',
                                                'Basic prompt engineering and evaluation']}],
                         'summary': 'A path from SQL and data fundamentals through pipeline '
                                    'engineering into applied ML/AI integration. Follow the '
                                    'stages below — a dedicated interactive roadmap page for '
                                    'this track is coming soon.'},
             'slug': 'data-ai',
             'status': 'Growing',
             'title': 'Data & AI Engineer',
             'transition_paths': ['Data Analyst → Data Engineer',
                                  'Backend Developer → AI Engineer',
                                  'Data Engineer → Machine Learning Engineer']},
 'developer': {'advantages': ['Broad skill set makes you useful on small teams and startups '
                              'where one person wears many hats',
                              'High demand across nearly every industry, not just tech '
                              'companies',
                              'Strong foundation for later specializing into frontend, '
                              'backend, mobile, DevOps, or AI engineering'],
               'ai_impact': 'AI coding assistants are speeding up boilerplate and first-draft '
                            'code, but understanding the system well enough to review, debug, '
                            'and own that code is becoming more valuable, not less — this is '
                            "TechOrbit's own assessment, not a cited industry statistic.",
               'certifications': [{'issuer': 'AWS',
                                   'name': 'AWS Certified Developer — Associate',
                                   'url': 'https://aws.amazon.com/certification/certified-developer-associate'},
                                  {'issuer': 'Meta (via Coursera)',
                                   'name': 'Meta Front-End Developer Professional Certificate',
                                   'url': 'https://www.coursera.org/professional-certificates/meta-front-end-developer'},
                                  {'issuer': 'freeCodeCamp (free)',
                                   'name': 'Full Stack Developer Certification',
                                   'url': 'https://www.freecodecamp.org/learn/full-stack-developer-v9'},
                                  {'issuer': 'Oracle',
                                   'name': 'Oracle Certified Professional: Java SE Developer',
                                   'url': 'https://education.oracle.com/oracle-certification-path/pFamily_48'}],
               'challenges': ["Breadth can come at the cost of depth — easy to be 'okay' at "
                              'everything and expert at nothing without deliberate focus',
                              'The tooling and framework landscape changes quickly and '
                              'requires continuous learning',
                              'Context-switching between frontend and backend concerns in the '
                              'same day can be mentally taxing'],
               'common_tools': ['Git/GitHub',
                                'VS Code',
                                'Docker',
                                'Postman',
                                'npm/pip/Maven',
                                'GitHub Actions or Jenkins',
                                'A cloud console (AWS/Azure/GCP)'],
               'daily_responsibilities': ['Build and maintain UI components and the '
                                          'APIs/services that back them',
                                          'Design and query databases, and reason about data '
                                          'models',
                                          'Write and review pull requests, including tests '
                                          'for new code',
                                          'Debug issues across the stack — from a UI glitch '
                                          'down to a slow database query',
                                          'Collaborate with product/design on feasibility and '
                                          'with QA/SDET on testability'],
               'definition': 'A full-stack developer builds both the parts of an application '
                             'users see (frontend) and the parts that power it behind the '
                             'scenes (backend, APIs, databases) — able to work across the '
                             'whole stack rather than specializing in only one layer.',
               'example_progression': ['Junior Developer',
                                       'Developer',
                                       'Senior Developer',
                                       'Tech Lead or Staff Engineer',
                                       'Engineering Manager or Principal Engineer'],
               'expectations': {'advanced': 'Makes architecture decisions, mentors other '
                                            'developers, and owns quality and performance for '
                                            'a service or product area.',
                                'beginner': 'Can implement well-defined features and fix bugs '
                                            'with guidance, understands the existing '
                                            "codebase's patterns.",
                                'intermediate': 'Designs and ships features independently '
                                                'across the stack, writes solid tests, '
                                                'participates meaningfully in code review.'},
               'fit_assessment': ["Do you enjoy going from 'nothing exists' to 'a real "
                                  "feature works end to end,' even when that means touching "
                                  'unfamiliar parts of the stack?',
                                  'Are you comfortable being a generalist, picking up new '
                                  'frameworks and languages as a project needs them?',
                                  'Do you like reasoning about both what the user sees and '
                                  'how the data behind it is structured?'],
               'future_outlook': 'Full-stack skills remain a strong general-purpose '
                                 'foundation that specializations (AI engineering, platform '
                                 'engineering, mobile) are typically built on top of, rather '
                                 "than a path being replaced by them — this is TechOrbit's "
                                 'own assessment, not a cited industry statistic.',
               'governance': {'author': 'TechOrbit content team',
                              'last_reviewed': '2026-09-22',
                              'next_review': None,
                              'reviewer': None,
                              'sources': ['Written from general, well-established software '
                                          'development practice; certification names/URLs '
                                          'verified via web search on 2026-09-22.'],
                              'version': '0.1'},
               'interview_topics': ['Data structures & algorithms (arrays, hash maps, trees, '
                                    'basic complexity analysis)',
                                    'System design fundamentals (for intermediate+: designing '
                                    'a simple API or service at a high level)',
                                    'Language/framework-specific questions for your stack',
                                    'Debugging and code-review scenarios'],
               'labs': ['Coming soon: a browser-based coding playground and a web '
                        '(HTML/CSS/JS) playground with live preview.',
                        'For now, practice by building the projects below locally and pushing '
                        'them to GitHub.'],
               'market_info': {'as_of_date': None,
                               'location': None,
                               'source_url': None,
                               'status': 'not_yet_sourced',
                               'summary': 'Salary and demand figures are intentionally left '
                                          'blank until a specific, dated, citable source is '
                                          'attached — the blueprint requires location/date '
                                          "context, and this page shouldn't guess."},
               'portfolio_expectations': ['A deployed full-stack project with a public URL, '
                                          'not just source code',
                                          'A REST or GraphQL API you designed yourself, with '
                                          'tests',
                                          'A clear README on every repo: what it does, how to '
                                          'run it, and why you made key technical decisions',
                                          'At least one merged pull request to a project that '
                                          "wasn't solely yours (open source or a group "
                                          'project)'],
               'projects': [{'description': 'A backend API (e.g. a task list or notes app) '
                                            'with signup/login and full '
                                            'create/read/update/delete endpoints.',
                             'id': 'crud-rest-api-with-auth',
                             'level': 'guided',
                             'steps': ['Design the data model for a small domain (tasks, '
                                       'notes, etc.)',
                                       'Build signup/login with hashed passwords and session '
                                       'or token auth',
                                       'Implement full create/read/update/delete endpoints '
                                       'with input validation',
                                       'Add authorization so users can only touch their own '
                                       'data',
                                       'Write tests covering the happy path and key failure '
                                       'cases (bad auth, bad input)'],
                             'stretch_goals': ['Add rate limiting and pagination',
                                               'Document the API with OpenAPI/Swagger'],
                             'tech_stack': ['Node.js or Python',
                                            'a web framework (Express/FastAPI)',
                                            'PostgreSQL or SQLite'],
                             'title': 'Build a CRUD REST API with authentication'},
                            {'description': 'Connect a frontend framework to your own API and '
                                            "a real database; deploy it so it's live at a "
                                            'public URL.',
                             'id': 'full-stack-app-with-database',
                             'level': 'independent',
                             'steps': ['Design a small but real feature set, not a todo-list '
                                       'clone',
                                       'Build the API and connect it to a real database',
                                       'Build the frontend and wire it to the API, handling '
                                       'loading/error states',
                                       'Deploy both frontend and backend so the app is live '
                                       'at a public URL',
                                       'Fix at least one bug that only shows up in the '
                                       'deployed environment'],
                             'stretch_goals': ['Add automated deploys on push (CI/CD)',
                                               'Add basic monitoring/error tracking to the '
                                               'live app'],
                             'tech_stack': ['a frontend framework (React/Vue)',
                                            'a backend API',
                                            'a hosting provider'],
                             'title': 'Build a full-stack app with a database'},
                            {'description': "Find a 'good first issue' on a real open-source "
                                            'repo, fix it, and get a pull request merged.',
                             'id': 'contribute-open-source-project',
                             'level': 'advanced-capstone',
                             'steps': ['Find an active repo and read its CONTRIBUTING guide '
                                       'before doing anything else',
                                       'Pick a "good first issue" that\'s scoped small enough '
                                       'to finish',
                                       'Set up the project locally and reproduce the issue',
                                       "Write a fix with tests, following the project's style "
                                       'and PR conventions',
                                       'Open the PR, respond to review feedback, and get it '
                                       'merged'],
                             'stretch_goals': ['Take on a second, slightly harder issue in '
                                               'the same repo',
                                               "Help review someone else's PR on the same "
                                               'project'],
                             'tech_stack': ['Git',
                                            'GitHub',
                                            'whatever stack the project uses'],
                             'title': 'Contribute to an open-source project'}],
               'recommended_languages': ['JavaScript/TypeScript', 'Python', 'Java'],
               'related_roles': ['Frontend Developer',
                                 'Backend Developer',
                                 'Mobile Developer',
                                 'DevOps Engineer',
                                 'AI Engineer'],
               'required_nontechnical_skills': ['Breaking ambiguous requirements into '
                                                'concrete, buildable tasks',
                                                'Clear technical communication in code '
                                                'reviews, PRs, and design docs',
                                                'Time and scope estimation, and flagging risk '
                                                'early rather than late'],
               'required_technical_skills': ['A frontend framework (React, Vue, or Angular) '
                                             'and core HTML/CSS/JavaScript',
                                             'A backend language and framework '
                                             '(Node.js/Express, Python/Django or FastAPI, or '
                                             'Java/Spring)',
                                             'Relational databases and SQL; comfort with at '
                                             'least one NoSQL store',
                                             'REST or GraphQL API design',
                                             'Git and collaborative version control workflows',
                                             'Basic cloud/deployment literacy (containers, a '
                                             "CI/CD pipeline, a cloud provider's core "
                                             'services)'],
               'resources': [{'title': 'MDN Web Docs (HTML/CSS/JavaScript)',
                              'url': 'https://developer.mozilla.org/'},
                             {'title': 'freeCodeCamp Full Stack curriculum (free)',
                              'url': 'https://www.freecodecamp.org/learn/full-stack-developer-v9'},
                             {'title': 'TechOrbit Resources page', 'url': '/resources'}],
               'roadmap': {'link': None,
                           'stages': [{'duration': '4-6 weeks',
                                       'name': 'Programming fundamentals',
                                       'topics': ['Variables, control flow, functions',
                                                  'Data structures: arrays, objects/maps, '
                                                  'basic algorithms']},
                                      {'duration': '4-6 weeks',
                                       'name': 'Frontend fundamentals',
                                       'topics': ['HTML/CSS layout and responsive design',
                                                  'JavaScript DOM manipulation, then a '
                                                  'framework (React)']},
                                      {'duration': '4-6 weeks',
                                       'name': 'Backend fundamentals',
                                       'topics': ['Building a REST API',
                                                  'Authentication basics, request validation, '
                                                  'error handling']},
                                      {'duration': '2-3 weeks',
                                       'name': 'Databases',
                                       'topics': ['Relational modeling and SQL',
                                                  'Connecting an API to a database, '
                                                  'migrations']},
                                      {'duration': '1-2 weeks',
                                       'name': 'Git & collaboration',
                                       'topics': ['Branching, pull requests, code review '
                                                  'etiquette']},
                                      {'duration': '2-3 weeks',
                                       'name': 'Deploy a full-stack project',
                                       'topics': ['Containerize the app',
                                                  'Deploy frontend + backend + database to a '
                                                  'cloud provider']}],
                           'summary': 'A learning path from programming fundamentals to a '
                                      'deployed full-stack application. Follow the stages '
                                      'below — a dedicated interactive roadmap page for this '
                                      'track is coming soon.'},
               'slug': 'developer',
               'status': 'Established',
               'title': 'Full-Stack Developer',
               'transition_paths': ['QA/SDET → Developer (via strong automation coding '
                                    'skills)',
                                    'Backend Developer → AI Engineer',
                                    'Full-Stack Developer → Platform/DevOps Engineer']},
 'devops': {'advantages': ['High demand — nearly every company running software at scale '
                           'needs this skill set',
                           'Sits at the intersection of development and operations, giving '
                           'broad system-level visibility',
                           'Strong foundation for later specializing into SRE, platform '
                           'engineering, or cloud architecture'],
            'ai_impact': 'AI tools are speeding up writing boilerplate IaC and CI/CD config, '
                         "and helping triage alerts, but judgment about what's actually safe "
                         'to automate and what needs a human in the loop is becoming more '
                         "valuable, not less — this is TechOrbit's own assessment, not a "
                         'cited industry statistic.',
            'certifications': [{'issuer': 'AWS',
                                'name': 'AWS Certified Cloud Practitioner',
                                'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                               {'issuer': 'CNCF / Linux Foundation',
                                'name': 'Certified Kubernetes Administrator (CKA)',
                                'url': 'https://www.cncf.io/training/certification/cka/'},
                               {'issuer': 'HashiCorp',
                                'name': 'HashiCorp Certified: Terraform Associate',
                                'url': 'https://developer.hashicorp.com/certifications/infrastructure-automation'},
                               {'issuer': 'AWS',
                                'name': 'AWS Certified DevOps Engineer — Professional',
                                'url': 'https://aws.amazon.com/certification/certified-devops-engineer-professional'}],
            'challenges': ['On-call and incident response can be stressful and unpredictable',
                           'Breadth of required knowledge (networking, security, multiple '
                           'clouds, containers) is genuinely large',
                           "Easy to end up as the team's default troubleshooter for anything "
                           'infrastructure-shaped, which can crowd out deeper project work'],
            'common_tools': ['Docker',
                             'Kubernetes',
                             'Terraform',
                             'GitHub Actions',
                             'Jenkins',
                             'Prometheus',
                             'Grafana',
                             'AWS/Azure/GCP console'],
            'daily_responsibilities': ['Build and maintain CI/CD pipelines so code gets '
                                       'tested and deployed safely',
                                       'Write and review infrastructure-as-code (Terraform, '
                                       'CloudFormation, etc.)',
                                       'Manage containerized workloads and their '
                                       'orchestration (Docker, Kubernetes)',
                                       'Set up and tune monitoring, logging, and alerting for '
                                       'production systems',
                                       'Respond to incidents, investigate root causes, and '
                                       'improve systems to prevent repeats',
                                       'Work with developers to make applications easier to '
                                       'deploy, configure, and observe'],
            'definition': 'A DevOps engineer builds and operates the systems that let teams '
                          'ship software quickly and reliably — CI/CD pipelines, '
                          'infrastructure as code, containers, and the monitoring that tells '
                          "you when something's wrong.",
            'example_progression': ['Junior DevOps Engineer',
                                    'DevOps Engineer',
                                    'Senior DevOps Engineer',
                                    'Platform Engineer or SRE Lead',
                                    'Principal Engineer / Head of Infrastructure'],
            'expectations': {'advanced': 'Owns reliability and infrastructure strategy for a '
                                         'team or org, mentors others, drives incident '
                                         'response process and tooling.',
                             'beginner': 'Can follow existing pipelines and infrastructure '
                                         'code, makes small well-scoped changes with review, '
                                         'learns the on-call rotation.',
                             'intermediate': 'Designs and builds new pipelines/infrastructure '
                                             'independently, participates in on-call, writes '
                                             'solid postmortems.'},
            'fit_assessment': ['Do you enjoy being the person who makes systems more reliable '
                               "and repeatable, even when it's invisible when done well?",
                               'Are you comfortable being paged for a production issue and '
                               'working through it methodically under pressure?',
                               'Do you like automating repetitive work rather than doing it '
                               'by hand each time?'],
            'future_outlook': 'As more of the DevOps toolchain becomes '
                              'managed/platform-provided, the role is shifting toward '
                              'platform engineering — building the internal tools other '
                              "engineers use — rather than disappearing; this is TechOrbit's "
                              'own assessment, not a cited industry statistic.',
            'governance': {'author': 'TechOrbit content team',
                           'last_reviewed': '2026-09-22',
                           'next_review': None,
                           'reviewer': None,
                           'sources': ['Written from general, well-established DevOps '
                                       'practice; certification names/URLs verified via web '
                                       'search on 2026-09-22.'],
                           'version': '0.1'},
            'interview_topics': ['CI/CD pipeline design and troubleshooting',
                                 'Kubernetes concepts (pods, deployments, services, '
                                 'networking basics)',
                                 'Infrastructure as code and why it matters (drift, '
                                 'reproducibility, review)',
                                 'Incident response: how would you debug a production '
                                 'outage?'],
            'labs': ['Coming soon: a Linux terminal playground, Docker/Kubernetes '
                     'simulations, and a CI/CD pipeline builder.',
                     'For now, practice locally: install Docker, run a multi-container app '
                     'with Compose, and write a Terraform config that provisions a real '
                     '(free-tier) cloud resource.'],
            'market_info': {'as_of_date': None,
                            'location': None,
                            'source_url': None,
                            'status': 'not_yet_sourced',
                            'summary': 'Salary and demand figures are intentionally left '
                                       'blank until a specific, dated, citable source is '
                                       'attached — the blueprint requires location/date '
                                       "context, and this page shouldn't guess."},
            'portfolio_expectations': ['A public repo with real Terraform/IaC code that '
                                       'provisions something, not just a tutorial copy',
                                       'A documented CI/CD pipeline (e.g. a GitHub Actions '
                                       'workflow) with a clear README explaining what it does',
                                       'Evidence of monitoring/observability work — a '
                                       'dashboard screenshot or a written incident postmortem '
                                       'for a practice scenario',
                                       'Clear documentation of what you built, why you made '
                                       "specific technical choices, and what you'd do "
                                       'differently'],
            'projects': [{'description': 'Dockerize an existing app, then deploy it with a '
                                         'CI/CD pipeline that runs tests before every deploy.',
                          'id': 'containerize-deploy-small-app',
                          'level': 'guided',
                          'steps': ['Write a Dockerfile for an existing app, keeping the '
                                    'image small and reproducible',
                                    'Run it locally and fix anything that only breaks inside '
                                    'the container',
                                    'Write a CI pipeline that builds the image and runs the '
                                    'test suite on every push',
                                    'Gate deploys on tests passing',
                                    'Deploy the container to a real host or platform'],
                          'stretch_goals': ['Add multi-stage builds to shrink the image '
                                            'further',
                                            'Add a rollback step if the deploy health check '
                                            'fails'],
                          'tech_stack': ['Docker',
                                         'GitHub Actions or GitLab CI',
                                         'a hosting platform'],
                          'title': 'Containerize and deploy a small app'},
                         {'description': 'Write Terraform to stand up a small real '
                                         'environment (e.g. a web server + database) on a '
                                         'free-tier cloud account, checked into version '
                                         'control.',
                          'id': 'provision-infrastructure-terraform',
                          'level': 'independent',
                          'steps': ['Pick a free-tier cloud account and define the '
                                    'environment you need (web server + database)',
                                    'Write Terraform for it, avoiding manual click-ops '
                                    'entirely',
                                    'Check the config into version control with a clear '
                                    'README',
                                    "Apply it from scratch to prove it's reproducible",
                                    'Add a way to safely tear it down (terraform destroy) '
                                    'without manual cleanup'],
                          'stretch_goals': ['Add remote state with locking',
                                            'Parameterize it for a second, similar '
                                            'environment (staging vs prod)'],
                          'tech_stack': ['Terraform', 'a cloud provider', 'Git'],
                          'title': 'Provision infrastructure with Terraform'},
                         {'description': 'Run an app on Kubernetes with Prometheus/Grafana '
                                         'monitoring and a documented runbook for what to do '
                                         'if it goes down.',
                          'id': 'deploy-monitored-kubernetes-app',
                          'level': 'advanced-capstone',
                          'steps': ['Get an app running on Kubernetes (a managed cluster or '
                                    'local like kind/minikube)',
                                    'Add Prometheus metrics and a Grafana dashboard for the '
                                    'key signals',
                                    'Define alerts for the failure modes that actually matter',
                                    'Write a runbook: what to check first, second, third, if '
                                    'it goes down',
                                    'Deliberately break it and follow your own runbook to '
                                    'recover it'],
                          'stretch_goals': ['Add autoscaling based on load',
                                            'Practice a full incident response and write a '
                                            'postmortem'],
                          'tech_stack': ['Kubernetes', 'Prometheus', 'Grafana'],
                          'title': 'Deploy a monitored Kubernetes app'}],
            'recommended_languages': ['Python', 'Go', 'Bash'],
            'related_roles': ['Site Reliability Engineer',
                              'Platform Engineer',
                              'Cloud Engineer',
                              'Full-Stack Developer',
                              'Security Engineer'],
            'required_nontechnical_skills': ['Staying calm and methodical during production '
                                             'incidents',
                                             'Writing clear runbooks and postmortems that '
                                             'others can actually follow',
                                             'Balancing reliability work against '
                                             'feature-delivery pressure'],
            'required_technical_skills': ['Linux fundamentals and shell scripting (Bash)',
                                          'A scripting/programming language for automation '
                                          '(Python or Go)',
                                          'Containers (Docker) and orchestration (Kubernetes)',
                                          'Infrastructure as code (Terraform, or a '
                                          'cloud-native equivalent)',
                                          'CI/CD tooling (GitHub Actions, Jenkins, or GitLab '
                                          'CI)',
                                          "A cloud provider's core services (AWS, Azure, or "
                                          'GCP)',
                                          'Monitoring/observability basics (metrics, logs, '
                                          'traces)'],
            'resources': [{'title': 'Kubernetes official docs',
                           'url': 'https://kubernetes.io/docs/home/'},
                          {'title': 'Terraform official docs',
                           'url': 'https://developer.hashicorp.com/terraform/docs'},
                          {'title': 'TechOrbit Resources page', 'url': '/resources'}],
            'roadmap': {'link': None,
                        'stages': [{'duration': '3-4 weeks',
                                    'name': 'Linux & scripting fundamentals',
                                    'topics': ['Filesystem, processes, permissions',
                                               'Bash scripting for automation']},
                                   {'duration': '2 weeks',
                                    'name': 'Git & CI/CD fundamentals',
                                    'topics': ['Branching workflows',
                                               'Build a pipeline that tests and deploys on '
                                               'every push']},
                                   {'duration': '3-4 weeks',
                                    'name': 'Containers',
                                    'topics': ['Docker images and containers',
                                               'Docker Compose for multi-service apps']},
                                   {'duration': '4-6 weeks',
                                    'name': 'Kubernetes',
                                    'topics': ['Pods, deployments, services',
                                               'ConfigMaps/secrets, basic troubleshooting']},
                                   {'duration': '3-4 weeks',
                                    'name': 'Infrastructure as code',
                                    'topics': ['Terraform basics: providers, resources, state',
                                               'Provision real cloud resources from code']},
                                   {'duration': '2-3 weeks',
                                    'name': 'Monitoring & incident response',
                                    'topics': ['Metrics/logs/traces basics',
                                               'Writing a runbook and a postmortem']}],
                        'summary': 'A learning path from Linux and scripting fundamentals '
                                   'through containers, CI/CD, infrastructure as code, and '
                                   'production monitoring. Follow the stages below — a '
                                   'dedicated interactive roadmap page for this track is '
                                   'coming soon.'},
            'slug': 'devops',
            'status': 'Established',
            'title': 'DevOps Engineer',
            'transition_paths': ['Linux Administrator → DevOps Engineer',
                                 'DevOps Engineer → SRE',
                                 'Full-Stack Developer → DevOps Engineer']},
 'product-ba': {'advantages': ['Highly transferable skills that work across industries, not '
                               'just tech',
                               'Direct, visible influence on what actually gets built',
                               'A common and well-trodden path into Product Management'],
                'ai_impact': 'AI tools can now draft first-pass user stories and summarize '
                             'stakeholder interviews, but judging whether requirements are '
                             'actually complete, unambiguous, and prioritized correctly is '
                             "still a human call — this is TechOrbit's own assessment, not a "
                             'cited industry statistic.',
                'certifications': [{'issuer': 'IIBA',
                                    'name': 'IIBA Entry Certificate in Business Analysis '
                                            '(ECBA)',
                                    'url': 'https://www.iiba.org/business-analysis-certifications/ecba/'},
                                   {'issuer': 'Scrum Alliance',
                                    'name': 'Certified Scrum Product Owner (CSPO)',
                                    'url': 'https://www.scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner'}],
                'challenges': ['Often caught between competing stakeholder demands with no '
                               'clean answer',
                               "Can be undervalued on teams that don't understand the "
                               "difference between 'writing tickets' and real requirements "
                               'work',
                               'Success is harder to measure directly than a shipped feature '
                               'or a closed bug'],
                'common_tools': ['Jira',
                                 'Confluence',
                                 'Figma (for reviewing designs)',
                                 'SQL client',
                                 'Miro',
                                 'Excel/Sheets'],
                'daily_responsibilities': ['Gather and clarify requirements from stakeholders',
                                           'Write clear user stories and acceptance criteria '
                                           'for the engineering team',
                                           'Run backlog refinement and help prioritize what '
                                           'gets built next',
                                           'Analyze data to support product or process '
                                           'decisions',
                                           'Facilitate communication between business '
                                           'stakeholders and engineers',
                                           'Support user acceptance testing (UAT) before '
                                           'release'],
                'definition': 'A Product/Business Analyst bridges business needs and '
                              'technical delivery — gathering and clarifying requirements, '
                              'writing user stories, and helping the team decide what to '
                              'build next. A common starting point before specializing into '
                              'Product Management or deeper Business Analysis.',
                'example_progression': ['Junior Business Analyst',
                                        'Business/Product Analyst',
                                        'Senior Analyst or Associate Product Manager',
                                        'Product Manager',
                                        'Senior/Group Product Manager'],
                'expectations': {'advanced': 'Sets product/process strategy for an area, '
                                             'mentors other analysts, drives cross-team '
                                             'alignment on priorities.',
                                 'beginner': 'Writes clear tickets from given requirements, '
                                             'runs basic stakeholder interviews with support, '
                                             'learns the product domain.',
                                 'intermediate': 'Owns requirements gathering for a feature '
                                                 'area independently, prioritizes a backlog, '
                                                 'presents findings to stakeholders.'},
                'fit_assessment': ["Do you enjoy turning a vague ask ('make this better') "
                                   'into something concrete and buildable?',
                                   'Are you comfortable being the person who has to say no to '
                                   "a stakeholder's favorite idea?",
                                   "Do you like understanding both the business 'why' and the "
                                   "technical 'how' of a feature?"],
                'future_outlook': 'As AI-assisted development lowers the cost of building the '
                                  'wrong thing quickly, the requirements/prioritization '
                                  'judgment this role provides becomes more valuable, not '
                                  "less — this is TechOrbit's own assessment, not a cited "
                                  'industry statistic.',
                'governance': {'author': 'TechOrbit content team',
                               'last_reviewed': '2026-09-22',
                               'next_review': None,
                               'reviewer': None,
                               'sources': ['Written from general, well-established business '
                                           'analysis/product practice; certification '
                                           'names/URLs verified via web search on '
                                           '2026-09-22.'],
                               'version': '0.1'},
                'interview_topics': ["Walk me through how you'd gather requirements for a new "
                                     'feature with vague initial input',
                                     'How do you handle conflicting priorities from two '
                                     'stakeholders?',
                                     'Write a user story and acceptance criteria for a given '
                                     'scenario',
                                     'How would you prioritize a backlog with limited '
                                     'engineering capacity?'],
                'labs': ['Coming soon: requirement-review and user-story-writing exercises '
                         'with feedback.',
                         'For now, practice by picking an app you use daily and writing a '
                         "full BRD + user stories for one improvement you'd make."],
                'market_info': {'as_of_date': None,
                                'location': None,
                                'source_url': None,
                                'status': 'not_yet_sourced',
                                'summary': 'Salary and demand figures are intentionally left '
                                           'blank until a specific, dated, citable source is '
                                           'attached — the blueprint requires location/date '
                                           "context, and this page shouldn't guess."},
                'portfolio_expectations': ['A sample requirements package (BRD + user stories '
                                           '+ acceptance criteria) for a self-chosen real '
                                           'product gap',
                                           'A documented prioritization exercise showing your '
                                           'reasoning, not just a ranked list',
                                           'A process map (BPMN or similar) for a real '
                                           'workflow, with a proposed improvement',
                                           'Clear, well-organized writing — this is the core '
                                           'deliverable of the role, so your portfolio should '
                                           'read like your actual work would'],
                'projects': [{'description': 'Pick a real product gap and write a full BRD, '
                                             'user stories, and acceptance criteria for it.',
                              'id': 'write-requirements-package',
                              'level': 'guided',
                              'steps': ['Pick a real gap in a product you use (or a sample '
                                        'app) worth solving',
                                        'Write a business requirements document explaining '
                                        'the problem and why it matters',
                                        'Break it into user stories with clear acceptance '
                                        'criteria',
                                        'Identify edge cases and open questions a developer '
                                        'would actually ask',
                                        'Get feedback from someone else and revise based on '
                                        'it'],
                              'stretch_goals': ['Turn the stories into a lightweight '
                                                'prototype or wireframe',
                                                'Estimate the work with a developer and '
                                                'adjust scope based on their feedback'],
                              'tech_stack': ['a doc tool (Notion/Confluence/Google Docs)',
                                             'a backlog tool (Jira/Trello)'],
                              'title': 'Write a requirements package'},
                             {'description': 'Take a list of 10+ feature ideas, apply a '
                                             'prioritization framework (RICE/MoSCoW), and '
                                             'document your reasoning.',
                              'id': 'mock-prioritization-exercise',
                              'level': 'independent',
                              'steps': ['Collect 10+ real or realistic feature ideas for a '
                                        'product',
                                        'Choose a prioritization framework (RICE, MoSCoW, or '
                                        'similar) and define its inputs clearly',
                                        'Score every idea consistently, not just the ones you '
                                        'like',
                                        'Rank them and write the reasoning behind the top 3 '
                                        'and bottom 3',
                                        'Present the ranking as if to a real stakeholder who '
                                        'might disagree'],
                              'stretch_goals': ['Run the same list through a second framework '
                                                'and compare the rankings',
                                                'Facilitate the exercise with actual peers '
                                                'and reconcile disagreements'],
                              'tech_stack': ['a spreadsheet tool',
                                             'a prioritization framework'],
                              'title': 'Run a mock prioritization exercise'},
                             {'description': 'Document a real (or realistic) business process '
                                             'with BPMN, identify a bottleneck, and propose a '
                                             'concrete fix.',
                              'id': 'map-improve-business-process',
                              'level': 'advanced-capstone',
                              'steps': ['Pick a real or realistic multi-step business process '
                                        'worth documenting',
                                        'Map it with BPMN, including decision points and '
                                        'handoffs between people/systems',
                                        'Identify the single biggest bottleneck in the '
                                        'process',
                                        'Propose a concrete, specific fix with an estimate of '
                                        'the impact',
                                        'Document the before/after so the improvement is easy '
                                        'to evaluate'],
                              'stretch_goals': ['Validate your proposed fix with someone who '
                                                'actually runs the process',
                                                'Model a second, alternative fix and compare '
                                                'tradeoffs'],
                              'tech_stack': ['a BPMN tool (Lucidchart/draw.io)', 'a doc tool'],
                              'title': 'Map and improve a business process'}],
                'recommended_languages': ['SQL'],
                'related_roles': ['Product Manager',
                                  'Product Owner',
                                  'Systems Analyst',
                                  'Data Analyst',
                                  'Scrum Master'],
                'required_nontechnical_skills': ['Active listening and stakeholder '
                                                 'interviewing',
                                                 'Clear written communication — specs get '
                                                 'read far more than they get discussed live',
                                                 'Prioritization judgment: saying no to good '
                                                 "ideas that aren't the right ones right now",
                                                 'Comfort navigating ambiguity and '
                                                 'conflicting stakeholder opinions'],
                'required_technical_skills': ['Requirements gathering and documentation '
                                              '(BRDs, functional specs)',
                                              'Writing user stories and acceptance criteria',
                                              'Basic data analysis (spreadsheets, SQL is a '
                                              'strong plus)',
                                              'Process/flow modeling (BPMN or simple '
                                              'flowcharts)',
                                              'Familiarity with agile ceremonies and a '
                                              'backlog tool (Jira or similar)'],
                'resources': [{'title': 'IIBA Business Analysis Body of Knowledge (BABOK) '
                                        'overview',
                               'url': 'https://www.iiba.org/knowledgehub/business-analysis-body-of-knowledge-babok-guide/'},
                              {'title': "Atlassian's guide to agile user stories",
                               'url': 'https://www.atlassian.com/agile/project-management/user-stories'},
                              {'title': 'TechOrbit Resources page', 'url': '/resources'}],
                'roadmap': {'link': None,
                            'stages': [{'duration': '2-3 weeks',
                                        'name': 'Requirements gathering fundamentals',
                                        'topics': ['Stakeholder interviewing techniques',
                                                   'Writing a clear BRD/functional spec']},
                                       {'duration': '2 weeks',
                                        'name': 'User stories & acceptance criteria',
                                        'topics': ['Story format and INVEST criteria',
                                                   'Writing testable acceptance criteria']},
                                       {'duration': '2 weeks',
                                        'name': 'Agile & Scrum fundamentals',
                                        'topics': ['Ceremonies, roles, backlog refinement',
                                                   'Estimation basics']},
                                       {'duration': '3-4 weeks',
                                        'name': 'Data analysis basics',
                                        'topics': ['Spreadsheet analysis',
                                                   'Basic SQL for pulling your own data']},
                                       {'duration': '1-2 weeks',
                                        'name': 'Process modeling',
                                        'topics': ['BPMN basics',
                                                   'Mapping a real business process end to '
                                                   'end']},
                                       {'duration': '2-3 weeks',
                                        'name': 'Prioritization & product thinking',
                                        'topics': ['Prioritization frameworks (RICE, MoSCoW)',
                                                   'Writing a simple PRD']}],
                            'summary': 'A path from requirements-gathering fundamentals '
                                       'through agile delivery practices into '
                                       'product-thinking and prioritization. Follow the '
                                       'stages below — a dedicated interactive roadmap page '
                                       'for this track is coming soon.'},
                'slug': 'product-ba',
                'status': 'Established',
                'title': 'Product / Business Analyst',
                'transition_paths': ['Business Analyst → Product Owner',
                                     'Product/Business Analyst → Product Manager',
                                     'Data Analyst → Product/Business Analyst']},
 'sdet': {'advantages': ['Strong demand — most product teams now expect some automated test '
                         'coverage',
                         'Sits close to both engineering and product, giving broad visibility '
                         'into how software actually gets built',
                         'Skills transfer well toward developer, DevOps, or AI-QA roles '
                         'later'],
          'ai_impact': 'AI tools are speeding up test-case generation and flaky-test triage, '
                       'but someone still has to judge whether an AI-suggested test is '
                       'actually meaningful — that judgment is becoming a bigger part of the '
                       "job, not a smaller one. This is TechOrbit's own assessment, not a "
                       'cited industry statistic.',
          'certifications': [{'issuer': 'ISTQB',
                              'name': 'ISTQB Foundation Level (CTFL)',
                              'url': 'https://www.istqb.org/certifications/certified-tester-foundation-level'},
                             {'issuer': 'ISTQB',
                              'name': 'ISTQB Advanced Level',
                              'url': 'https://www.istqb.org/certifications/advanced-level'},
                             {'issuer': 'ICAgile',
                              'name': 'ICAgile Certified Professional — Agile Testing',
                              'url': 'https://www.icagile.com/certifications/agile-testing'},
                             {'issuer': 'AWS',
                              'name': 'AWS Certified Cloud Practitioner',
                              'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                             {'issuer': 'Postman Academy',
                              'name': 'Postman API Fundamentals',
                              'url': 'https://academy.postman.com/'}],
          'challenges': ['Flaky tests and maintenance burden can dominate the job if '
                         'framework hygiene is neglected',
                         'Requires staying current on both testing practice and the '
                         'languages/tools your team uses',
                         "Can be perceived as 'a developer who only writes tests,' which "
                         'undersells the risk-analysis skill involved'],
          'common_tools': ['Selenium',
                           'Playwright',
                           'Cypress',
                           'Postman',
                           'REST Assured',
                           'JMeter',
                           'k6',
                           'Jira',
                           'GitHub Actions',
                           'Jenkins',
                           'Allure/Extent reports'],
          'daily_responsibilities': ['Design and maintain automated UI, API, and integration '
                                     'test suites',
                                     'Review pull requests for testability and add missing '
                                     'test coverage',
                                     'Investigate and triage test failures in CI, '
                                     'distinguishing real bugs from flaky tests',
                                     'Build and improve the test automation framework itself '
                                     '(page objects, fixtures, reporting)',
                                     'Pair with developers on hard-to-test features and edge '
                                     'cases'],
          'definition': 'An SDET writes code to test software rather than testing it purely '
                        'by hand — building and maintaining automated test suites, '
                        'frameworks, and CI/CD quality gates alongside the development team.',
          'example_progression': ['Junior QA Engineer',
                                  'QA Engineer / Manual Tester',
                                  'SDET',
                                  'Senior SDET',
                                  'Test Architect or Automation Lead'],
          'expectations': {'advanced': 'Owns framework architecture decisions, mentors other '
                                       'testers, drives quality strategy across a team or '
                                       'product area.',
                           'beginner': 'Can write and maintain existing automated tests, '
                                       "understands the framework's structure, needs guidance "
                                       'on new test design.',
                           'intermediate': 'Designs new test suites independently, debugs '
                                           'flaky tests, contributes to framework '
                                           'improvements.'},
          'fit_assessment': ['Do you enjoy finding the exact input that breaks something, '
                             'then writing code to make sure it never breaks that way again?',
                             'Are you comfortable reading and writing code daily, even if '
                             "you're not designing new features?",
                             'Do you like working closely with developers rather than testing '
                             'in isolation at the end of a cycle?'],
          'future_outlook': 'Testing AI-powered features (the AI-QA specialization) is a '
                            'fast-growing extension of this role rather than a separate job '
                            'market — most of the underlying skills carry over directly. This '
                            "is TechOrbit's own assessment, not a cited industry statistic.",
          'governance': {'author': 'TechOrbit content team',
                         'last_reviewed': '2026-09-22',
                         'next_review': None,
                         'reviewer': None,
                         'sources': ["Adapted from this app's existing Roadmaps 'Manual "
                                     "Tester → SDET' track and Career page "
                                     'certification/portfolio content.'],
                         'version': '0.1'},
          'interview_topics': ['Manual testing: test case design, bug reporting, SDLC/STLC '
                               'fundamentals',
                               'Automation: Selenium/Playwright, framework design, API '
                               'automation, coding questions',
                               'AI-QA: testing LLM features, evaluation strategies, '
                               'prompt/output quality'],
          'labs': ['Coming soon: browser-based coding, API, and Linux playgrounds with real '
                   'sandboxed execution.',
                   "For now, practice via the Practice page's SDET-tagged quiz questions and "
                   'AI-graded coding challenges.'],
          'market_info': {'as_of_date': None,
                          'location': None,
                          'source_url': None,
                          'status': 'not_yet_sourced',
                          'summary': 'Salary and demand figures are intentionally left blank '
                                     'until a specific, dated, citable source is attached — '
                                     'the blueprint requires location/date context, and this '
                                     "page shouldn't guess."},
          'portfolio_expectations': ['A public repo automating a real site end-to-end with '
                                     'the Page Object Model',
                                     'A REST API test suite wired into a CI pipeline',
                                     'A clear README on every repo: what it tests, how to run '
                                     'it, and a screenshot of a passing run'],
          'projects': [{'description': 'Use Playwright or Selenium with the Page Object Model '
                                       'against a free public demo site.',
                        'id': 'automate-public-demo-site',
                        'level': 'guided',
                        'steps': ['Pick a free public demo/practice site with realistic UI '
                                  'flows',
                                  'Set up a Page Object Model structure before writing any '
                                  'tests',
                                  'Automate a handful of key user journeys (login, search, '
                                  'checkout, etc.)',
                                  "Add explicit waits and stable locators so the suite isn't "
                                  'flaky',
                                  'Wire it into CI so it runs automatically and reports '
                                  'results'],
                        'stretch_goals': ['Add cross-browser runs (Chromium, Firefox, WebKit)',
                                          'Add visual regression checks for key pages'],
                        'tech_stack': ['Playwright or Selenium',
                                       'Python or Java',
                                       'GitHub Actions'],
                        'title': 'Automate a public demo site end-to-end'},
                       {'description': 'Postman or REST Assured against a free public API, '
                                       'wired into GitHub Actions.',
                        'id': 'build-rest-api-test-suite-ci',
                        'level': 'independent',
                        'steps': ['Pick a free public REST API with enough endpoints to be '
                                  'interesting',
                                  'Design a test plan covering happy paths, edge cases, and '
                                  'error responses',
                                  'Automate it with Postman/Newman or REST Assured',
                                  'Add schema/contract validation, not just status-code '
                                  'checks',
                                  'Wire the suite into GitHub Actions so it runs on every '
                                  'push'],
                        'stretch_goals': ['Add basic performance assertions (response time '
                                          'thresholds)',
                                          'Add data-driven tests that run the same checks '
                                          'across many inputs'],
                        'tech_stack': ['Postman/Newman or REST Assured', 'GitHub Actions'],
                        'title': 'Build a REST API test suite in CI'},
                       {'description': 'A golden dataset + scoring script for a sample prompt '
                                       '— a first step into AI-QA.',
                        'id': 'llm-evaluation-harness',
                        'level': 'intermediate',
                        'steps': ['Pick a concrete LLM task (e.g. classification, '
                                  'summarization) to evaluate',
                                  'Build a small golden dataset of inputs with '
                                  'expected/acceptable outputs',
                                  'Write a scoring script that grades responses against the '
                                  'golden set',
                                  'Run it against the model and report pass rate plus failure '
                                  'examples',
                                  'Re-run it after a prompt change and confirm the harness '
                                  'catches regressions'],
                        'stretch_goals': ['Add a human-review step for borderline scores',
                                          'Track score trends over time as the prompt '
                                          'evolves'],
                        'tech_stack': ['Python',
                                       'an LLM API',
                                       'a scoring/eval library or custom script'],
                        'title': 'Write an LLM evaluation harness'}],
          'recommended_languages': ['Java', 'Python', 'JavaScript/TypeScript'],
          'related_roles': ['Manual QA Engineer',
                            'Automation Engineer',
                            'Test Architect',
                            'Performance Engineer',
                            'AI Quality Engineer'],
          'required_nontechnical_skills': ['Clear written bug reports and documentation',
                                           'Comfort collaborating directly with developers, '
                                           'not just filing tickets',
                                           "Risk-based thinking — knowing what's worth "
                                           'testing deeply vs. lightly'],
          'required_technical_skills': ['A programming language (Java, Python, or '
                                        'JavaScript/TypeScript)',
                                        'A UI automation tool (Selenium, Playwright, or '
                                        'Cypress)',
                                        'API testing (Postman, REST Assured, or an HTTP '
                                        'client library)',
                                        'Git and version control workflows',
                                        'Basic SQL for data verification',
                                        'CI/CD fundamentals (running tests in a pipeline)'],
          'resources': [{'title': 'Selenium official docs',
                         'url': 'https://www.selenium.dev/documentation/'},
                        {'title': 'Playwright official docs',
                         'url': 'https://playwright.dev/docs/intro'},
                        {'title': 'TechOrbit Resources page', 'url': '/resources'}],
          'roadmap': {'link': '/roadmaps#manual-to-sdet',
                      'stages': [{'duration': '2-3 weeks',
                                  'name': 'Solidify manual testing fundamentals',
                                  'topics': ['SDLC/STLC, test case design techniques',
                                             'Bug lifecycle, exploratory testing']},
                                 {'duration': '4-6 weeks',
                                  'name': 'Learn a programming language',
                                  'topics': ['Java or Python fundamentals',
                                             'OOP, collections, exception handling']},
                                 {'duration': '4-6 weeks',
                                  'name': 'Web automation fundamentals',
                                  'topics': ['Selenium WebDriver, locators, waits',
                                             'Page Object Model, TestNG/JUnit or pytest']},
                                 {'duration': '2-3 weeks',
                                  'name': 'API testing & automation',
                                  'topics': ['REST concepts, Postman',
                                             'REST Assured or Python requests']},
                                 {'duration': '2 weeks',
                                  'name': 'CI/CD & reporting',
                                  'topics': ['Jenkins or GitHub Actions basics',
                                             'Allure/Extent reports in a pipeline']}],
                      'summary': "This app's existing 'Manual Tester → SDET' track is a full "
                                 '6-month plan covering manual fundamentals, a programming '
                                 'language, Git, Selenium/Playwright automation, API testing, '
                                 'CI/CD, a portfolio project, and interview prep.'},
          'slug': 'sdet',
          'status': 'Established',
          'title': 'SDET (Software Development Engineer in Test)',
          'transition_paths': ['Manual QA → Automation Engineer → SDET',
                               'SDET → Test Architect',
                               'SDET → AI Quality Engineer']},
 'sre': {'advantages': ['High-leverage role — reliability improvements protect revenue and '
                        'user trust broadly',
                        'Deep, transferable systems knowledge that applies across companies '
                        'and stacks',
                        'Strong compensation and demand at companies running services at real '
                        'scale'],
         'ai_impact': 'AI tools are speeding up log/metric triage and root-cause suggestions '
                      'during incidents, but a human still has to validate the diagnosis and '
                      "own the remediation decision — this is TechOrbit's own assessment, not "
                      'a cited industry statistic.',
         'certifications': [{'issuer': 'AWS',
                             'name': 'AWS Certified Cloud Practitioner',
                             'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                            {'issuer': 'Google Cloud',
                             'name': 'Google Cloud Professional Cloud DevOps Engineer',
                             'url': 'https://cloud.google.com/learn/certification/cloud-devops-engineer'},
                            {'issuer': 'CNCF / Linux Foundation',
                             'name': 'Certified Kubernetes Administrator (CKA)',
                             'url': 'https://www.cncf.io/training/certification/cka/'}],
         'challenges': ['On-call can be genuinely stressful, especially at organizations with '
                        'immature reliability practices',
                        'Requires constantly balancing reliability work against feature-team '
                        'pressure to ship',
                        'Can be hard to measure and get credit for — the best SRE work is '
                        'often invisible (nothing breaks)'],
         'common_tools': ['Prometheus',
                          'Grafana',
                          'PagerDuty',
                          'Kubernetes',
                          'Terraform',
                          'OpenTelemetry',
                          'Datadog'],
         'daily_responsibilities': ['Define and track SLIs/SLOs and manage error budgets for '
                                    'services',
                                    'Build automation to reduce repetitive operational work '
                                    '(toil)',
                                    'Respond to and lead resolution of production incidents',
                                    'Write and review postmortems, then drive follow-up fixes',
                                    'Improve monitoring, alerting, and on-call processes',
                                    'Do capacity planning and design for high availability'],
         'definition': 'A Site Reliability Engineer (SRE) applies software engineering '
                       'practices to keep production systems reliable at scale — defining and '
                       'tracking reliability targets, reducing manual toil through '
                       'automation, and leading incident response when things break.',
         'example_progression': ['Junior SRE / DevOps Engineer',
                                 'SRE',
                                 'Senior SRE',
                                 'Staff SRE or Reliability Lead',
                                 'Principal Engineer / Head of Reliability'],
         'expectations': {'advanced': 'Sets reliability strategy across teams, mentors '
                                      'on-call engineers, drives org-wide incident process '
                                      'improvements.',
                          'beginner': 'Participates in on-call with support, follows '
                                      'runbooks, fixes small toil items.',
                          'intermediate': 'Leads incident response independently, defines '
                                          'SLOs for a service, automates significant toil.'},
         'fit_assessment': ['Do you enjoy the moment of methodically diagnosing why a complex '
                            'system is failing, under time pressure?',
                            'Are you comfortable owning production reliability, including '
                            'being paged when something breaks?',
                            'Do you like building automation and tooling as much as (or more '
                            'than) building user-facing features?'],
         'future_outlook': 'As more infrastructure becomes managed/serverless, SRE work is '
                           'shifting further up the stack toward service-level reliability '
                           'and platform design rather than disappearing — this is '
                           "TechOrbit's own assessment, not a cited industry statistic.",
         'governance': {'author': 'TechOrbit content team',
                        'last_reviewed': '2026-09-22',
                        'next_review': None,
                        'reviewer': None,
                        'sources': ['Written from general, well-established SRE practice '
                                    "(including Google's public SRE book); certification "
                                    'names/URLs verified via web search on 2026-09-22.'],
                        'version': '0.1'},
         'interview_topics': ['SLIs, SLOs, and error budgets — how would you set them for a '
                              'given service?',
                              'Distributed systems failure modes: timeouts, retries, '
                              'cascading failures',
                              "Walk through how you'd debug a service with rising latency in "
                              'production',
                              'Postmortem writing and blameless culture'],
         'labs': ['Coming soon: a simulated incident/outage playground with logs, metrics, '
                  'and traces to triage.',
                  'For now, practice by instrumenting a small app with Prometheus/Grafana and '
                  'writing a postmortem for a self-created practice incident.'],
         'market_info': {'as_of_date': None,
                         'location': None,
                         'source_url': None,
                         'status': 'not_yet_sourced',
                         'summary': 'Salary and demand figures are intentionally left blank '
                                    'until a specific, dated, citable source is attached — '
                                    'the blueprint requires location/date context, and this '
                                    "page shouldn't guess."},
         'portfolio_expectations': ['A documented incident response — even a self-created '
                                    'practice scenario — with a full blameless postmortem',
                                    'A public repo showing SLO instrumentation and a real '
                                    'dashboard',
                                    'Evidence of automating a real, specific toil task with '
                                    'before/after time savings noted',
                                    'Clear writing: reliability work is judged heavily on how '
                                    'well you communicate about systems'],
         'projects': [{'description': 'Add metrics to a small app, define an SLO, and build a '
                                      'dashboard showing your error budget.',
                       'id': 'instrument-service-with-slos',
                       'level': 'guided',
                       'steps': ['Pick a small app and add metrics for latency, error rate, '
                                 'and traffic',
                                 'Define an SLI (e.g. "% of requests under 300ms") for it',
                                 'Set an SLO target and calculate the resulting error budget',
                                 'Build a dashboard showing current performance against the '
                                 'SLO',
                                 'Write a short doc explaining what happens when the error '
                                 'budget is exhausted'],
                       'stretch_goals': ['Add burn-rate alerts that fire before the budget is '
                                         'fully spent',
                                         'Track the SLO over a real week of usage and report '
                                         'on it'],
                       'tech_stack': ['Prometheus', 'Grafana', 'a small app to instrument'],
                       'title': 'Instrument a service with SLOs'},
                      {'description': 'Pick a repetitive manual operational task and fully '
                                      'automate it, with tests and documentation.',
                       'id': 'automate-toil-task',
                       'level': 'independent',
                       'steps': ['Identify a real repetitive manual operational task (yours '
                                 'or a documented example)',
                                 'Measure how much time/effort it currently costs',
                                 'Automate it end-to-end, not just the easy 80%',
                                 "Add tests so the automation itself doesn't become a new "
                                 'source of incidents',
                                 'Document how to run it, and how to roll back if it goes '
                                 'wrong'],
                       'stretch_goals': ['Schedule it to run automatically and alert on '
                                         'failure',
                                         'Measure the time saved and report it as a '
                                         'before/after'],
                       'tech_stack': ['a scripting language (Python/Bash)',
                                      'your existing ops tooling'],
                       'title': 'Automate a toil task'},
                      {'description': 'Deliberately break a test system, run an incident '
                                      'response, and write a full blameless postmortem.',
                       'id': 'run-simulated-incident',
                       'level': 'advanced-capstone',
                       'steps': ["Stand up a small test system you're willing to break",
                                 'Design a realistic failure (resource exhaustion, bad '
                                 'deploy, dependency outage)',
                                 'Trigger it and respond as if it were a real incident: '
                                 'triage, mitigate, resolve',
                                 'Track a timeline of what you did and when',
                                 'Write a full blameless postmortem with root cause and '
                                 'concrete follow-ups'],
                       'stretch_goals': ['Run it again after your follow-up fixes and confirm '
                                         'the failure no longer reproduces',
                                         'Practice it live with a peer playing incident '
                                         'commander'],
                       'tech_stack': ['your test system',
                                      'a monitoring/alerting tool',
                                      'a doc tool'],
                       'title': 'Run a simulated incident'}],
         'recommended_languages': ['Python', 'Go', 'Bash'],
         'related_roles': ['DevOps Engineer',
                           'Platform Engineer',
                           'Cloud Engineer',
                           'Observability Engineer'],
         'required_nontechnical_skills': ['Calm, clear communication during high-pressure '
                                          'incidents',
                                          'Blameless postmortem writing that focuses on '
                                          'systems, not people',
                                          'Negotiating reliability work against '
                                          'feature-delivery pressure with stakeholders'],
         'required_technical_skills': ['Strong Linux and networking fundamentals',
                                       'A programming/scripting language (Python or Go) for '
                                       'automation',
                                       'Container orchestration (Kubernetes) and '
                                       'infrastructure as code',
                                       'Observability tooling (Prometheus/Grafana, '
                                       'distributed tracing)',
                                       'Incident response and debugging distributed systems '
                                       'under pressure',
                                       'Understanding of distributed-systems failure modes '
                                       '(timeouts, retries, cascading failures)'],
         'resources': [{'title': "Google's Site Reliability Engineering book (free online)",
                        'url': 'https://sre.google/books/'},
                       {'title': 'Prometheus official docs',
                        'url': 'https://prometheus.io/docs/introduction/overview/'},
                       {'title': 'TechOrbit Resources page', 'url': '/resources'}],
         'roadmap': {'link': None,
                     'stages': [{'duration': '3-4 weeks',
                                 'name': 'Linux, networking & systems fundamentals',
                                 'topics': ['Processes, memory, networking basics',
                                            'Debugging a system under load']},
                                {'duration': '2 weeks',
                                 'name': 'SLIs, SLOs & error budgets',
                                 'topics': ['Choosing meaningful SLIs for a service',
                                            'Setting realistic SLO targets and error '
                                            'budgets']},
                                {'duration': '3-4 weeks',
                                 'name': 'Observability',
                                 'topics': ['Metrics, logs, and traces',
                                            'Building dashboards and useful alerts (not noisy '
                                            'ones)']},
                                {'duration': '3-4 weeks',
                                 'name': 'Automation & infrastructure as code',
                                 'topics': ['Terraform or equivalent',
                                            'Automating a real toil task end to end']},
                                {'duration': '2-3 weeks',
                                 'name': 'Incident response',
                                 'topics': ['Running an incident, writing a blameless '
                                            'postmortem',
                                            'On-call rotation basics']},
                                {'duration': '2 weeks',
                                 'name': 'Capacity planning & resilience',
                                 'topics': ['Load testing and capacity forecasting',
                                            'Chaos engineering basics']}],
                     'summary': 'A path from DevOps/operations fundamentals into the specific '
                                'discipline of reliability engineering: SLOs, error budgets, '
                                'and incident response. Follow the stages below — a dedicated '
                                'interactive roadmap page for this track is coming soon.'},
         'slug': 'sre',
         'status': 'Established',
         'title': 'Site Reliability Engineer',
         'transition_paths': ['DevOps Engineer → SRE',
                              'Backend Developer → SRE',
                              'SRE → Platform Engineering Lead']}}

LESSONS = {'git-and-github': {'beginner_explanation': 'Git tracks changes to your files over time so '
                                            'you can save checkpoints (commits), go back to '
                                            'any earlier checkpoint, and work on different '
                                            'versions of your project (branches) without '
                                            'losing anything. GitHub is a website that hosts '
                                            'Git projects online so you can back them up, '
                                            'share them, and collaborate with others.',
                    'category': 'foundational',
                    'common_mistakes': ['Committing directly to main instead of working in a '
                                        'feature branch',
                                        'Writing vague commit messages like "fix stuff" '
                                        'instead of describing what changed and why',
                                        'Forgetting to pull before starting new work, leading '
                                        'to avoidable merge conflicts',
                                        'Committing secrets or API keys by accident because '
                                        "they weren't excluded via .gitignore"],
                    'examples': ['git init — start tracking a new folder as a Git repository',
                                 'git add . && git commit -m "Add login page" — save a '
                                 'snapshot of your current changes',
                                 'git checkout -b feature/login — create and switch to a new '
                                 'branch',
                                 'git push origin feature/login — upload your branch to '
                                 'GitHub',
                                 'git pull — download the latest changes from GitHub into '
                                 'your local copy'],
                    'governance': {'author': 'TechOrbit content team',
                                   'last_reviewed': '2026-09-22',
                                   'next_review': None,
                                   'reviewer': None,
                                   'sources': ['General Git/GitHub documentation and common '
                                               'usage — no external citation needed for these '
                                               'fundamentals.'],
                                   'version': '0.1'},
                    'interactive_exercise': 'Coming soon: a guided in-browser terminal '
                                            'exercise where you initialize a repo, make a '
                                            'commit, create a branch, and open a pull request '
                                            'against a sample project.',
                    'interview_questions': ["What's the difference between 'git merge' and "
                                            "'git rebase'?",
                                            'How would you undo the last commit without '
                                            'losing your changes?',
                                            "What's a merge conflict, and how do you resolve "
                                            'one?',
                                            "What's the difference between a fork and a "
                                            'branch?'],
                    'mini_project': 'Create a small GitHub repository for any personal script '
                                    'or notes file. Make at least 3 commits with clear '
                                    'messages, create one feature branch, and open a pull '
                                    'request merging it into main.',
                    'practical_lab': 'Coming soon: a real sandboxed Git environment. Until '
                                     "then, practice locally: create a folder, run 'git "
                                     "init', make a few commits, create a branch, and push it "
                                     'to a GitHub repo you create.',
                    'quiz': [{'answer_index': 1,
                              'explanation': 'A commit is a local snapshot. You still need '
                                             "'git push' to send it to GitHub.",
                              'options': ['Uploads your code to GitHub',
                                          'Saves a labeled snapshot of your staged changes to '
                                          "the local repository's history",
                                          'Deletes uncommitted changes',
                                          'Creates a new branch'],
                              'question': "What does 'git commit' do?"},
                             {'answer_index': 2,
                              'explanation': 'Feature branches let you experiment and get '
                                             'work reviewed before it affects the main '
                                             'codebase.',
                              'options': ["It's required by Git and cannot be disabled",
                                          'It makes your commits smaller automatically',
                                          'It isolates in-progress work so main stays stable '
                                          'and deployable',
                                          "It's faster to push"],
                              'question': 'Why use a feature branch instead of committing '
                                          'straight to main?'}],
                    'reference_sheet': [{'note': 'A project folder tracked by Git.',
                                         'term': 'Repository (repo)'},
                                        {'note': 'A saved snapshot of changes, with a message '
                                                 'describing them.',
                                         'term': 'Commit'},
                                        {'note': 'An independent line of development off the '
                                                 'main history.',
                                         'term': 'Branch'},
                                        {'note': "A request to merge one branch's changes "
                                                 'into another, usually reviewed first.',
                                         'term': 'Pull request (PR)'},
                                        {'note': "Occurs when Git can't automatically combine "
                                                 'changes to the same lines and needs a human '
                                                 'decision.',
                                         'term': 'Merge conflict'},
                                        {'note': 'Download a full copy of a remote '
                                                 'repository, including its history.',
                                         'term': 'Clone'},
                                        {'note': "Your own copy of someone else's repository "
                                                 'on GitHub, used to propose changes without '
                                                 'direct write access.',
                                         'term': 'Fork'}],
                    'slug': 'git-and-github',
                    'title': 'Git & GitHub',
                    'visual_explanation': "Picture your project's history as a timeline of "
                                          'snapshots. Each commit is a labeled snapshot. A '
                                          'branch is a separate timeline that splits off from '
                                          'the main one so you can experiment safely, then '
                                          "merge it back in once it's ready."}}

RADAR_ITEMS = [{'category': 'Adopt',
  'name': 'Playwright',
  'related_roles': ['sdet'],
  'what_it_is': 'A modern browser automation framework for end-to-end testing, with built-in '
                'auto-waiting and multi-browser support.',
  'who_should_learn': 'QA/SDET learners starting UI automation today.',
  'why_it_matters': 'Faster and more reliable than older Selenium-based setups for most new '
                    'UI test suites.'},
 {'category': 'Adopt',
  'name': 'Git',
  'related_roles': ['sdet', 'developer', 'devops'],
  'what_it_is': 'Distributed version control — the standard way software teams track and '
                'collaborate on code changes.',
  'who_should_learn': 'Everyone, regardless of role.',
  'why_it_matters': "Foundational for every technical role; there's no serious alternative in "
                    'mainstream use.'},
 {'category': 'Adopt',
  'name': 'Docker',
  'related_roles': ['developer', 'devops', 'sdet'],
  'what_it_is': 'A tool for packaging an application and its dependencies into a portable '
                'container.',
  'who_should_learn': 'Developers and DevOps engineers; increasingly useful for SDETs setting '
                      'up test environments too.',
  'why_it_matters': 'The standard building block for modern deployment, CI pipelines, and '
                    'local dev environments.'},
 {'category': 'Adopt',
  'name': 'TypeScript',
  'related_roles': ['developer'],
  'what_it_is': 'A typed superset of JavaScript that compiles to plain JavaScript.',
  'who_should_learn': 'Frontend, full-stack, and Node.js developers.',
  'why_it_matters': 'Default choice for most new JavaScript projects — catches a large class '
                    'of bugs before runtime.'},
 {'category': 'Trial',
  'name': 'Kubernetes',
  'related_roles': ['devops'],
  'what_it_is': 'A container orchestration platform for deploying, scaling, and managing '
                'containerized applications.',
  'who_should_learn': 'DevOps engineers; developers at companies already running it in '
                      'production.',
  'why_it_matters': 'Industry-standard for larger-scale deployments, but genuinely more '
                    'complexity than many small teams need.'},
 {'category': 'Trial',
  'name': 'AI coding assistants',
  'related_roles': ['developer', 'sdet', 'devops'],
  'what_it_is': 'Tools like Claude Code or GitHub Copilot that generate and edit code from '
                'natural-language prompts inside your workflow.',
  'who_should_learn': 'All technical roles — the skill of directing and reviewing '
                      'AI-generated code is becoming as important as writing it by hand.',
  'why_it_matters': 'Genuinely speeds up boilerplate and first drafts, but still requires the '
                    'developer to review, test, and own the result.'},
 {'category': 'Assess',
  'name': 'LLM evaluation frameworks',
  'related_roles': ['sdet'],
  'what_it_is': 'Tools (e.g. promptfoo, DeepEval) for systematically testing prompt/model '
                'outputs against golden datasets.',
  'who_should_learn': 'SDETs moving into AI-QA.',
  'why_it_matters': 'Purpose-built for AI-QA work, but the tooling and best practices are '
                    'still young and changing quickly.'},
 {'category': 'Assess',
  'name': 'GraphQL',
  'related_roles': ['developer'],
  'what_it_is': 'A query language for APIs that lets clients request exactly the data they '
                'need.',
  'who_should_learn': 'Backend/full-stack developers evaluating API design for a specific '
                      "project's needs.",
  'why_it_matters': 'Solid fit for some frontend-heavy apps with complex data needs, but REST '
                    'remains the safer default for most APIs.'},
 {'category': 'Watch',
  'name': 'Agentic / multi-agent AI systems',
  'related_roles': ['sdet', 'developer'],
  'what_it_is': 'AI systems where one or more models plan, use tools, and act with some '
                'autonomy toward a goal, rather than answering a single prompt.',
  'who_should_learn': 'AI-QA specialists and developers building AI-powered features, as '
                      'awareness rather than deep expertise yet.',
  'why_it_matters': 'Fast-moving area with real production use emerging, but patterns for '
                    'reliability, evaluation, and safety are still being worked out.'},
 {'category': 'Watch',
  'name': 'WebAssembly (Wasm)',
  'related_roles': ['developer'],
  'what_it_is': 'A binary instruction format that lets code written in languages like '
                'C++/Rust run in the browser near-natively.',
  'who_should_learn': 'Developers working on performance-critical web applications.',
  'why_it_matters': 'Enables high-performance web use cases, but still a niche choice outside '
                    'specific performance-sensitive applications.'},
 {'category': 'Declining',
  'name': 'jQuery for new projects',
  'related_roles': ['developer'],
  'what_it_is': 'A JavaScript library for DOM manipulation and AJAX that was dominant in the '
                '2010s.',
  'who_should_learn': 'Only developers maintaining existing jQuery codebases.',
  'why_it_matters': 'Modern frameworks (React, Vue) and native browser APIs cover its use '
                    'cases better for new projects — mostly relevant now for maintaining '
                    'legacy codebases.'},
 {'category': 'Emerging',
  'name': 'AI-native test evaluation harnesses',
  'related_roles': ['sdet'],
  'what_it_is': 'Purpose-built pipelines for continuously evaluating AI-powered product '
                'features, not just one-off model benchmarks.',
  'who_should_learn': 'QA/SDET learners who want to be early in a role AI-QA is turning into '
                      'a real specialization.',
  'why_it_matters': 'As more products ship AI features, this is likely to become a standard '
                    'part of QA rather than a specialty — still forming as a discipline.'}]
