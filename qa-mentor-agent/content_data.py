"""Content data embedded as Python literals (not read from JSON files at
request time), so it is guaranteed to be included by Vercel's Python
build-time import tracing regardless of any static-asset bundling
behavior. Generated from data/roles/*.json, data/lessons/*.json, and
data/radar/items.json - those files remain the human-edited source; run
the generation script again after editing them.
"""

ROLES = {'sdet': {'slug': 'sdet',
          'title': 'SDET (Software Development Engineer in Test)',
          'status': 'Established',
          'definition': 'An SDET writes code to test software rather than testing it purely by '
                        'hand — building and maintaining automated test suites, frameworks, and '
                        'CI/CD quality gates alongside the development team.',
          'daily_responsibilities': ['Design and maintain automated UI, API, and integration test '
                                     'suites',
                                     'Review pull requests for testability and add missing test '
                                     'coverage',
                                     'Investigate and triage test failures in CI, distinguishing '
                                     'real bugs from flaky tests',
                                     'Build and improve the test automation framework itself (page '
                                     'objects, fixtures, reporting)',
                                     'Pair with developers on hard-to-test features and edge '
                                     'cases'],
          'required_technical_skills': ['A programming language (Java, Python, or '
                                        'JavaScript/TypeScript)',
                                        'A UI automation tool (Selenium, Playwright, or Cypress)',
                                        'API testing (Postman, REST Assured, or an HTTP client '
                                        'library)',
                                        'Git and version control workflows',
                                        'Basic SQL for data verification',
                                        'CI/CD fundamentals (running tests in a pipeline)'],
          'required_nontechnical_skills': ['Clear written bug reports and documentation',
                                           'Comfort collaborating directly with developers, not '
                                           'just filing tickets',
                                           "Risk-based thinking — knowing what's worth testing "
                                           'deeply vs. lightly'],
          'expectations': {'beginner': 'Can write and maintain existing automated tests, '
                                       "understands the framework's structure, needs guidance on "
                                       'new test design.',
                           'intermediate': 'Designs new test suites independently, debugs flaky '
                                           'tests, contributes to framework improvements.',
                           'advanced': 'Owns framework architecture decisions, mentors other '
                                       'testers, drives quality strategy across a team or product '
                                       'area.'},
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
          'recommended_languages': ['Java', 'Python', 'JavaScript/TypeScript'],
          'roadmap': {'summary': "This app's existing 'Manual Tester → SDET' track is a full "
                                 '6-month plan covering manual fundamentals, a programming '
                                 'language, Git, Selenium/Playwright automation, API testing, '
                                 'CI/CD, a portfolio project, and interview prep.',
                      'link': '/roadmaps#manual-to-sdet',
                      'stages': [{'name': 'Solidify manual testing fundamentals',
                                  'duration': '2-3 weeks',
                                  'topics': ['SDLC/STLC, test case design techniques',
                                             'Bug lifecycle, exploratory testing']},
                                 {'name': 'Learn a programming language',
                                  'duration': '4-6 weeks',
                                  'topics': ['Java or Python fundamentals',
                                             'OOP, collections, exception handling']},
                                 {'name': 'Web automation fundamentals',
                                  'duration': '4-6 weeks',
                                  'topics': ['Selenium WebDriver, locators, waits',
                                             'Page Object Model, TestNG/JUnit or pytest']},
                                 {'name': 'API testing & automation',
                                  'duration': '2-3 weeks',
                                  'topics': ['REST concepts, Postman',
                                             'REST Assured or Python requests']},
                                 {'name': 'CI/CD & reporting',
                                  'duration': '2 weeks',
                                  'topics': ['Jenkins or GitHub Actions basics',
                                             'Allure/Extent reports in a pipeline']}]},
          'labs': ['Coming soon: browser-based coding, API, and Linux playgrounds with real '
                   'sandboxed execution.',
                   "For now, practice via the Practice page's SDET-tagged quiz questions and "
                   'AI-graded coding challenges.'],
          'projects': [{'level': 'guided',
                        'title': 'Automate a public demo site end-to-end',
                        'description': 'Use Playwright or Selenium with the Page Object Model '
                                       'against a free public demo site.'},
                       {'level': 'independent',
                        'title': 'Build a REST API test suite in CI',
                        'description': 'Postman or REST Assured against a free public API, wired '
                                       'into GitHub Actions.'},
                       {'level': 'intermediate',
                        'title': 'Write an LLM evaluation harness',
                        'description': 'A golden dataset + scoring script for a sample prompt — a '
                                       'first step into AI-QA.'}],
          'interview_topics': ['Manual testing: test case design, bug reporting, SDLC/STLC '
                               'fundamentals',
                               'Automation: Selenium/Playwright, framework design, API automation, '
                               'coding questions',
                               'AI-QA: testing LLM features, evaluation strategies, prompt/output '
                               'quality'],
          'certifications': [{'name': 'ISTQB Foundation Level (CTFL)',
                              'issuer': 'ISTQB',
                              'url': 'https://www.istqb.org/certifications/certified-tester-foundation-level'},
                             {'name': 'ISTQB Advanced Level',
                              'issuer': 'ISTQB',
                              'url': 'https://www.istqb.org/certifications/advanced-level'},
                             {'name': 'ICAgile Certified Professional — Agile Testing',
                              'issuer': 'ICAgile',
                              'url': 'https://www.icagile.com/certifications/agile-testing'},
                             {'name': 'AWS Certified Cloud Practitioner',
                              'issuer': 'AWS',
                              'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                             {'name': 'Postman API Fundamentals',
                              'issuer': 'Postman Academy',
                              'url': 'https://academy.postman.com/'}],
          'market_info': {'status': 'not_yet_sourced',
                          'summary': 'Salary and demand figures are intentionally left blank until '
                                     'a specific, dated, citable source is attached — the '
                                     'blueprint requires location/date context, and this page '
                                     "shouldn't guess.",
                          'location': None,
                          'as_of_date': None,
                          'source_url': None},
          'related_roles': ['Manual QA Engineer',
                            'Automation Engineer',
                            'Test Architect',
                            'Performance Engineer',
                            'AI Quality Engineer'],
          'transition_paths': ['Manual QA → Automation Engineer → SDET',
                               'SDET → Test Architect',
                               'SDET → AI Quality Engineer'],
          'advantages': ['Strong demand — most product teams now expect some automated test '
                         'coverage',
                         'Sits close to both engineering and product, giving broad visibility into '
                         'how software actually gets built',
                         'Skills transfer well toward developer, DevOps, or AI-QA roles later'],
          'challenges': ['Flaky tests and maintenance burden can dominate the job if framework '
                         'hygiene is neglected',
                         'Requires staying current on both testing practice and the '
                         'languages/tools your team uses',
                         "Can be perceived as 'a developer who only writes tests,' which "
                         'undersells the risk-analysis skill involved'],
          'example_progression': ['Junior QA Engineer',
                                  'QA Engineer / Manual Tester',
                                  'SDET',
                                  'Senior SDET',
                                  'Test Architect or Automation Lead'],
          'portfolio_expectations': ['A public repo automating a real site end-to-end with the '
                                     'Page Object Model',
                                     'A REST API test suite wired into a CI pipeline',
                                     'A clear README on every repo: what it tests, how to run it, '
                                     'and a screenshot of a passing run'],
          'fit_assessment': ['Do you enjoy finding the exact input that breaks something, then '
                             'writing code to make sure it never breaks that way again?',
                             "Are you comfortable reading and writing code daily, even if you're "
                             'not designing new features?',
                             'Do you like working closely with developers rather than testing in '
                             'isolation at the end of a cycle?'],
          'ai_impact': 'AI tools are speeding up test-case generation and flaky-test triage, but '
                       'someone still has to judge whether an AI-suggested test is actually '
                       'meaningful — that judgment is becoming a bigger part of the job, not a '
                       "smaller one. This is TechOrbit's own assessment, not a cited industry "
                       'statistic.',
          'future_outlook': 'Testing AI-powered features (the AI-QA specialization) is a '
                            'fast-growing extension of this role rather than a separate job market '
                            '— most of the underlying skills carry over directly. This is '
                            "TechOrbit's own assessment, not a cited industry statistic.",
          'resources': [{'title': 'Selenium official docs',
                         'url': 'https://www.selenium.dev/documentation/'},
                        {'title': 'Playwright official docs',
                         'url': 'https://playwright.dev/docs/intro'},
                        {'title': 'TechOrbit Resources page', 'url': '/resources'}],
          'governance': {'author': 'TechOrbit content team',
                         'reviewer': None,
                         'version': '0.1',
                         'last_reviewed': '2026-09-22',
                         'next_review': None,
                         'sources': ["Adapted from this app's existing Roadmaps 'Manual Tester → "
                                     "SDET' track and Career page certification/portfolio "
                                     'content.']}},
 'developer': {'slug': 'developer',
               'title': 'Full-Stack Developer',
               'status': 'Established',
               'definition': 'A full-stack developer builds both the parts of an application users '
                             'see (frontend) and the parts that power it behind the scenes '
                             '(backend, APIs, databases) — able to work across the whole stack '
                             'rather than specializing in only one layer.',
               'daily_responsibilities': ['Build and maintain UI components and the APIs/services '
                                          'that back them',
                                          'Design and query databases, and reason about data '
                                          'models',
                                          'Write and review pull requests, including tests for new '
                                          'code',
                                          'Debug issues across the stack — from a UI glitch down '
                                          'to a slow database query',
                                          'Collaborate with product/design on feasibility and with '
                                          'QA/SDET on testability'],
               'required_technical_skills': ['A frontend framework (React, Vue, or Angular) and '
                                             'core HTML/CSS/JavaScript',
                                             'A backend language and framework (Node.js/Express, '
                                             'Python/Django or FastAPI, or Java/Spring)',
                                             'Relational databases and SQL; comfort with at least '
                                             'one NoSQL store',
                                             'REST or GraphQL API design',
                                             'Git and collaborative version control workflows',
                                             'Basic cloud/deployment literacy (containers, a CI/CD '
                                             "pipeline, a cloud provider's core services)"],
               'required_nontechnical_skills': ['Breaking ambiguous requirements into concrete, '
                                                'buildable tasks',
                                                'Clear technical communication in code reviews, '
                                                'PRs, and design docs',
                                                'Time and scope estimation, and flagging risk '
                                                'early rather than late'],
               'expectations': {'beginner': 'Can implement well-defined features and fix bugs with '
                                            "guidance, understands the existing codebase's "
                                            'patterns.',
                                'intermediate': 'Designs and ships features independently across '
                                                'the stack, writes solid tests, participates '
                                                'meaningfully in code review.',
                                'advanced': 'Makes architecture decisions, mentors other '
                                            'developers, and owns quality and performance for a '
                                            'service or product area.'},
               'common_tools': ['Git/GitHub',
                                'VS Code',
                                'Docker',
                                'Postman',
                                'npm/pip/Maven',
                                'GitHub Actions or Jenkins',
                                'A cloud console (AWS/Azure/GCP)'],
               'recommended_languages': ['JavaScript/TypeScript', 'Python', 'Java'],
               'roadmap': {'summary': 'A learning path from programming fundamentals to a deployed '
                                      'full-stack application. Follow the stages below — a '
                                      'dedicated interactive roadmap page for this track is coming '
                                      'soon.',
                           'link': None,
                           'stages': [{'name': 'Programming fundamentals',
                                       'duration': '4-6 weeks',
                                       'topics': ['Variables, control flow, functions',
                                                  'Data structures: arrays, objects/maps, basic '
                                                  'algorithms']},
                                      {'name': 'Frontend fundamentals',
                                       'duration': '4-6 weeks',
                                       'topics': ['HTML/CSS layout and responsive design',
                                                  'JavaScript DOM manipulation, then a framework '
                                                  '(React)']},
                                      {'name': 'Backend fundamentals',
                                       'duration': '4-6 weeks',
                                       'topics': ['Building a REST API',
                                                  'Authentication basics, request validation, '
                                                  'error handling']},
                                      {'name': 'Databases',
                                       'duration': '2-3 weeks',
                                       'topics': ['Relational modeling and SQL',
                                                  'Connecting an API to a database, migrations']},
                                      {'name': 'Git & collaboration',
                                       'duration': '1-2 weeks',
                                       'topics': ['Branching, pull requests, code review '
                                                  'etiquette']},
                                      {'name': 'Deploy a full-stack project',
                                       'duration': '2-3 weeks',
                                       'topics': ['Containerize the app',
                                                  'Deploy frontend + backend + database to a cloud '
                                                  'provider']}]},
               'labs': ['Coming soon: a browser-based coding playground and a web (HTML/CSS/JS) '
                        'playground with live preview.',
                        'For now, practice by building the projects below locally and pushing them '
                        'to GitHub.'],
               'projects': [{'level': 'guided',
                             'title': 'Build a CRUD REST API with authentication',
                             'description': 'A backend API (e.g. a task list or notes app) with '
                                            'signup/login and full create/read/update/delete '
                                            'endpoints.'},
                            {'level': 'independent',
                             'title': 'Build a full-stack app with a database',
                             'description': 'Connect a frontend framework to your own API and a '
                                            "real database; deploy it so it's live at a public "
                                            'URL.'},
                            {'level': 'advanced-capstone',
                             'title': 'Contribute to an open-source project',
                             'description': "Find a 'good first issue' on a real open-source repo, "
                                            'fix it, and get a pull request merged.'}],
               'interview_topics': ['Data structures & algorithms (arrays, hash maps, trees, basic '
                                    'complexity analysis)',
                                    'System design fundamentals (for intermediate+: designing a '
                                    'simple API or service at a high level)',
                                    'Language/framework-specific questions for your stack',
                                    'Debugging and code-review scenarios'],
               'certifications': [{'name': 'AWS Certified Developer — Associate',
                                   'issuer': 'AWS',
                                   'url': 'https://aws.amazon.com/certification/certified-developer-associate'},
                                  {'name': 'Meta Front-End Developer Professional Certificate',
                                   'issuer': 'Meta (via Coursera)',
                                   'url': 'https://www.coursera.org/professional-certificates/meta-front-end-developer'},
                                  {'name': 'Full Stack Developer Certification',
                                   'issuer': 'freeCodeCamp (free)',
                                   'url': 'https://www.freecodecamp.org/learn/full-stack-developer-v9'},
                                  {'name': 'Oracle Certified Professional: Java SE Developer',
                                   'issuer': 'Oracle',
                                   'url': 'https://education.oracle.com/oracle-certification-path/pFamily_48'}],
               'market_info': {'status': 'not_yet_sourced',
                               'summary': 'Salary and demand figures are intentionally left blank '
                                          'until a specific, dated, citable source is attached — '
                                          'the blueprint requires location/date context, and this '
                                          "page shouldn't guess.",
                               'location': None,
                               'as_of_date': None,
                               'source_url': None},
               'related_roles': ['Frontend Developer',
                                 'Backend Developer',
                                 'Mobile Developer',
                                 'DevOps Engineer',
                                 'AI Engineer'],
               'transition_paths': ['QA/SDET → Developer (via strong automation coding skills)',
                                    'Backend Developer → AI Engineer',
                                    'Full-Stack Developer → Platform/DevOps Engineer'],
               'advantages': ['Broad skill set makes you useful on small teams and startups where '
                              'one person wears many hats',
                              'High demand across nearly every industry, not just tech companies',
                              'Strong foundation for later specializing into frontend, backend, '
                              'mobile, DevOps, or AI engineering'],
               'challenges': ["Breadth can come at the cost of depth — easy to be 'okay' at "
                              'everything and expert at nothing without deliberate focus',
                              'The tooling and framework landscape changes quickly and requires '
                              'continuous learning',
                              'Context-switching between frontend and backend concerns in the same '
                              'day can be mentally taxing'],
               'example_progression': ['Junior Developer',
                                       'Developer',
                                       'Senior Developer',
                                       'Tech Lead or Staff Engineer',
                                       'Engineering Manager or Principal Engineer'],
               'portfolio_expectations': ['A deployed full-stack project with a public URL, not '
                                          'just source code',
                                          'A REST or GraphQL API you designed yourself, with tests',
                                          'A clear README on every repo: what it does, how to run '
                                          'it, and why you made key technical decisions',
                                          'At least one merged pull request to a project that '
                                          "wasn't solely yours (open source or a group project)"],
               'fit_assessment': ["Do you enjoy going from 'nothing exists' to 'a real feature "
                                  "works end to end,' even when that means touching unfamiliar "
                                  'parts of the stack?',
                                  'Are you comfortable being a generalist, picking up new '
                                  'frameworks and languages as a project needs them?',
                                  'Do you like reasoning about both what the user sees and how the '
                                  'data behind it is structured?'],
               'ai_impact': 'AI coding assistants are speeding up boilerplate and first-draft '
                            'code, but understanding the system well enough to review, debug, and '
                            'own that code is becoming more valuable, not less — this is '
                            "TechOrbit's own assessment, not a cited industry statistic.",
               'future_outlook': 'Full-stack skills remain a strong general-purpose foundation '
                                 'that specializations (AI engineering, platform engineering, '
                                 'mobile) are typically built on top of, rather than a path being '
                                 "replaced by them — this is TechOrbit's own assessment, not a "
                                 'cited industry statistic.',
               'resources': [{'title': 'MDN Web Docs (HTML/CSS/JavaScript)',
                              'url': 'https://developer.mozilla.org/'},
                             {'title': 'freeCodeCamp Full Stack curriculum (free)',
                              'url': 'https://www.freecodecamp.org/learn/full-stack-developer-v9'},
                             {'title': 'TechOrbit Resources page', 'url': '/resources'}],
               'governance': {'author': 'TechOrbit content team',
                              'reviewer': None,
                              'version': '0.1',
                              'last_reviewed': '2026-09-22',
                              'next_review': None,
                              'sources': ['Written from general, well-established software '
                                          'development practice; certification names/URLs verified '
                                          'via web search on 2026-09-22.']}},
 'devops': {'slug': 'devops',
            'title': 'DevOps Engineer',
            'status': 'Established',
            'definition': 'A DevOps engineer builds and operates the systems that let teams ship '
                          'software quickly and reliably — CI/CD pipelines, infrastructure as '
                          "code, containers, and the monitoring that tells you when something's "
                          'wrong.',
            'daily_responsibilities': ['Build and maintain CI/CD pipelines so code gets tested and '
                                       'deployed safely',
                                       'Write and review infrastructure-as-code (Terraform, '
                                       'CloudFormation, etc.)',
                                       'Manage containerized workloads and their orchestration '
                                       '(Docker, Kubernetes)',
                                       'Set up and tune monitoring, logging, and alerting for '
                                       'production systems',
                                       'Respond to incidents, investigate root causes, and improve '
                                       'systems to prevent repeats',
                                       'Work with developers to make applications easier to '
                                       'deploy, configure, and observe'],
            'required_technical_skills': ['Linux fundamentals and shell scripting (Bash)',
                                          'A scripting/programming language for automation (Python '
                                          'or Go)',
                                          'Containers (Docker) and orchestration (Kubernetes)',
                                          'Infrastructure as code (Terraform, or a cloud-native '
                                          'equivalent)',
                                          'CI/CD tooling (GitHub Actions, Jenkins, or GitLab CI)',
                                          "A cloud provider's core services (AWS, Azure, or GCP)",
                                          'Monitoring/observability basics (metrics, logs, '
                                          'traces)'],
            'required_nontechnical_skills': ['Staying calm and methodical during production '
                                             'incidents',
                                             'Writing clear runbooks and postmortems that others '
                                             'can actually follow',
                                             'Balancing reliability work against feature-delivery '
                                             'pressure'],
            'expectations': {'beginner': 'Can follow existing pipelines and infrastructure code, '
                                         'makes small well-scoped changes with review, learns the '
                                         'on-call rotation.',
                             'intermediate': 'Designs and builds new pipelines/infrastructure '
                                             'independently, participates in on-call, writes solid '
                                             'postmortems.',
                             'advanced': 'Owns reliability and infrastructure strategy for a team '
                                         'or org, mentors others, drives incident response process '
                                         'and tooling.'},
            'common_tools': ['Docker',
                             'Kubernetes',
                             'Terraform',
                             'GitHub Actions',
                             'Jenkins',
                             'Prometheus',
                             'Grafana',
                             'AWS/Azure/GCP console'],
            'recommended_languages': ['Python', 'Go', 'Bash'],
            'roadmap': {'summary': 'A learning path from Linux and scripting fundamentals through '
                                   'containers, CI/CD, infrastructure as code, and production '
                                   'monitoring. Follow the stages below — a dedicated interactive '
                                   'roadmap page for this track is coming soon.',
                        'link': None,
                        'stages': [{'name': 'Linux & scripting fundamentals',
                                    'duration': '3-4 weeks',
                                    'topics': ['Filesystem, processes, permissions',
                                               'Bash scripting for automation']},
                                   {'name': 'Git & CI/CD fundamentals',
                                    'duration': '2 weeks',
                                    'topics': ['Branching workflows',
                                               'Build a pipeline that tests and deploys on every '
                                               'push']},
                                   {'name': 'Containers',
                                    'duration': '3-4 weeks',
                                    'topics': ['Docker images and containers',
                                               'Docker Compose for multi-service apps']},
                                   {'name': 'Kubernetes',
                                    'duration': '4-6 weeks',
                                    'topics': ['Pods, deployments, services',
                                               'ConfigMaps/secrets, basic troubleshooting']},
                                   {'name': 'Infrastructure as code',
                                    'duration': '3-4 weeks',
                                    'topics': ['Terraform basics: providers, resources, state',
                                               'Provision real cloud resources from code']},
                                   {'name': 'Monitoring & incident response',
                                    'duration': '2-3 weeks',
                                    'topics': ['Metrics/logs/traces basics',
                                               'Writing a runbook and a postmortem']}]},
            'labs': ['Coming soon: a Linux terminal playground, Docker/Kubernetes simulations, and '
                     'a CI/CD pipeline builder.',
                     'For now, practice locally: install Docker, run a multi-container app with '
                     'Compose, and write a Terraform config that provisions a real (free-tier) '
                     'cloud resource.'],
            'projects': [{'level': 'guided',
                          'title': 'Containerize and deploy a small app',
                          'description': 'Dockerize an existing app, then deploy it with a CI/CD '
                                         'pipeline that runs tests before every deploy.'},
                         {'level': 'independent',
                          'title': 'Provision infrastructure with Terraform',
                          'description': 'Write Terraform to stand up a small real environment '
                                         '(e.g. a web server + database) on a free-tier cloud '
                                         'account, checked into version control.'},
                         {'level': 'advanced-capstone',
                          'title': 'Deploy a monitored Kubernetes app',
                          'description': 'Run an app on Kubernetes with Prometheus/Grafana '
                                         'monitoring and a documented runbook for what to do if it '
                                         'goes down.'}],
            'interview_topics': ['CI/CD pipeline design and troubleshooting',
                                 'Kubernetes concepts (pods, deployments, services, networking '
                                 'basics)',
                                 'Infrastructure as code and why it matters (drift, '
                                 'reproducibility, review)',
                                 'Incident response: how would you debug a production outage?'],
            'certifications': [{'name': 'AWS Certified Cloud Practitioner',
                                'issuer': 'AWS',
                                'url': 'https://aws.amazon.com/certification/certified-cloud-practitioner/'},
                               {'name': 'Certified Kubernetes Administrator (CKA)',
                                'issuer': 'CNCF / Linux Foundation',
                                'url': 'https://www.cncf.io/training/certification/cka/'},
                               {'name': 'HashiCorp Certified: Terraform Associate',
                                'issuer': 'HashiCorp',
                                'url': 'https://developer.hashicorp.com/certifications/infrastructure-automation'},
                               {'name': 'AWS Certified DevOps Engineer — Professional',
                                'issuer': 'AWS',
                                'url': 'https://aws.amazon.com/certification/certified-devops-engineer-professional'}],
            'market_info': {'status': 'not_yet_sourced',
                            'summary': 'Salary and demand figures are intentionally left blank '
                                       'until a specific, dated, citable source is attached — the '
                                       'blueprint requires location/date context, and this page '
                                       "shouldn't guess.",
                            'location': None,
                            'as_of_date': None,
                            'source_url': None},
            'related_roles': ['Site Reliability Engineer',
                              'Platform Engineer',
                              'Cloud Engineer',
                              'Full-Stack Developer',
                              'Security Engineer'],
            'transition_paths': ['Linux Administrator → DevOps Engineer',
                                 'DevOps Engineer → SRE',
                                 'Full-Stack Developer → DevOps Engineer'],
            'advantages': ['High demand — nearly every company running software at scale needs '
                           'this skill set',
                           'Sits at the intersection of development and operations, giving broad '
                           'system-level visibility',
                           'Strong foundation for later specializing into SRE, platform '
                           'engineering, or cloud architecture'],
            'challenges': ['On-call and incident response can be stressful and unpredictable',
                           'Breadth of required knowledge (networking, security, multiple clouds, '
                           'containers) is genuinely large',
                           "Easy to end up as the team's default troubleshooter for anything "
                           'infrastructure-shaped, which can crowd out deeper project work'],
            'example_progression': ['Junior DevOps Engineer',
                                    'DevOps Engineer',
                                    'Senior DevOps Engineer',
                                    'Platform Engineer or SRE Lead',
                                    'Principal Engineer / Head of Infrastructure'],
            'portfolio_expectations': ['A public repo with real Terraform/IaC code that provisions '
                                       'something, not just a tutorial copy',
                                       'A documented CI/CD pipeline (e.g. a GitHub Actions '
                                       'workflow) with a clear README explaining what it does',
                                       'Evidence of monitoring/observability work — a dashboard '
                                       'screenshot or a written incident postmortem for a practice '
                                       'scenario',
                                       'Clear documentation of what you built, why you made '
                                       "specific technical choices, and what you'd do differently"],
            'fit_assessment': ['Do you enjoy being the person who makes systems more reliable and '
                               "repeatable, even when it's invisible when done well?",
                               'Are you comfortable being paged for a production issue and working '
                               'through it methodically under pressure?',
                               'Do you like automating repetitive work rather than doing it by '
                               'hand each time?'],
            'ai_impact': 'AI tools are speeding up writing boilerplate IaC and CI/CD config, and '
                         "helping triage alerts, but judgment about what's actually safe to "
                         'automate and what needs a human in the loop is becoming more valuable, '
                         "not less — this is TechOrbit's own assessment, not a cited industry "
                         'statistic.',
            'future_outlook': 'As more of the DevOps toolchain becomes managed/platform-provided, '
                              'the role is shifting toward platform engineering — building the '
                              'internal tools other engineers use — rather than disappearing; this '
                              "is TechOrbit's own assessment, not a cited industry statistic.",
            'resources': [{'title': 'Kubernetes official docs',
                           'url': 'https://kubernetes.io/docs/home/'},
                          {'title': 'Terraform official docs',
                           'url': 'https://developer.hashicorp.com/terraform/docs'},
                          {'title': 'TechOrbit Resources page', 'url': '/resources'}],
            'governance': {'author': 'TechOrbit content team',
                           'reviewer': None,
                           'version': '0.1',
                           'last_reviewed': '2026-09-22',
                           'next_review': None,
                           'sources': ['Written from general, well-established DevOps practice; '
                                       'certification names/URLs verified via web search on '
                                       '2026-09-22.']}}}

LESSONS = {'git-and-github': {'slug': 'git-and-github',
                    'title': 'Git & GitHub',
                    'category': 'foundational',
                    'beginner_explanation': 'Git tracks changes to your files over time so you can '
                                            'save checkpoints (commits), go back to any earlier '
                                            'checkpoint, and work on different versions of your '
                                            'project (branches) without losing anything. GitHub is '
                                            'a website that hosts Git projects online so you can '
                                            'back them up, share them, and collaborate with '
                                            'others.',
                    'visual_explanation': "Picture your project's history as a timeline of "
                                          'snapshots. Each commit is a labeled snapshot. A branch '
                                          'is a separate timeline that splits off from the main '
                                          'one so you can experiment safely, then merge it back in '
                                          "once it's ready.",
                    'examples': ['git init — start tracking a new folder as a Git repository',
                                 'git add . && git commit -m "Add login page" — save a snapshot of '
                                 'your current changes',
                                 'git checkout -b feature/login — create and switch to a new '
                                 'branch',
                                 'git push origin feature/login — upload your branch to GitHub',
                                 'git pull — download the latest changes from GitHub into your '
                                 'local copy'],
                    'common_mistakes': ['Committing directly to main instead of working in a '
                                        'feature branch',
                                        'Writing vague commit messages like "fix stuff" instead of '
                                        'describing what changed and why',
                                        'Forgetting to pull before starting new work, leading to '
                                        'avoidable merge conflicts',
                                        'Committing secrets or API keys by accident because they '
                                        "weren't excluded via .gitignore"],
                    'interactive_exercise': 'Coming in Phase 2: a guided in-browser terminal '
                                            'exercise where you initialize a repo, make a commit, '
                                            'create a branch, and open a pull request against a '
                                            'sample project.',
                    'quiz': [{'question': "What does 'git commit' do?",
                              'options': ['Uploads your code to GitHub',
                                          'Saves a labeled snapshot of your staged changes to the '
                                          "local repository's history",
                                          'Deletes uncommitted changes',
                                          'Creates a new branch'],
                              'answer_index': 1,
                              'explanation': "A commit is a local snapshot. You still need 'git "
                                             "push' to send it to GitHub."},
                             {'question': 'Why use a feature branch instead of committing straight '
                                          'to main?',
                              'options': ["It's required by Git and cannot be disabled",
                                          'It makes your commits smaller automatically',
                                          'It isolates in-progress work so main stays stable and '
                                          'deployable',
                                          "It's faster to push"],
                              'answer_index': 2,
                              'explanation': 'Feature branches let you experiment and get work '
                                             'reviewed before it affects the main codebase.'}],
                    'practical_lab': 'Coming in Phase 2: a real sandboxed Git environment. Until '
                                     "then, practice locally: create a folder, run 'git init', "
                                     'make a few commits, create a branch, and push it to a GitHub '
                                     'repo you create.',
                    'mini_project': 'Create a small GitHub repository for any personal script or '
                                    'notes file. Make at least 3 commits with clear messages, '
                                    'create one feature branch, and open a pull request merging it '
                                    'into main.',
                    'interview_questions': ["What's the difference between 'git merge' and 'git "
                                            "rebase'?",
                                            'How would you undo the last commit without losing '
                                            'your changes?',
                                            "What's a merge conflict, and how do you resolve one?",
                                            "What's the difference between a fork and a branch?"],
                    'reference_sheet': [{'term': 'Repository (repo)',
                                         'note': 'A project folder tracked by Git.'},
                                        {'term': 'Commit',
                                         'note': 'A saved snapshot of changes, with a message '
                                                 'describing them.'},
                                        {'term': 'Branch',
                                         'note': 'An independent line of development off the main '
                                                 'history.'},
                                        {'term': 'Pull request (PR)',
                                         'note': "A request to merge one branch's changes into "
                                                 'another, usually reviewed first.'},
                                        {'term': 'Merge conflict',
                                         'note': "Occurs when Git can't automatically combine "
                                                 'changes to the same lines and needs a human '
                                                 'decision.'},
                                        {'term': 'Clone',
                                         'note': 'Download a full copy of a remote repository, '
                                                 'including its history.'},
                                        {'term': 'Fork',
                                         'note': "Your own copy of someone else's repository on "
                                                 'GitHub, used to propose changes without direct '
                                                 'write access.'}],
                    'governance': {'author': 'TechOrbit content team',
                                   'reviewer': None,
                                   'version': '0.1',
                                   'last_reviewed': '2026-09-22',
                                   'next_review': None,
                                   'sources': ['General Git/GitHub documentation and common usage '
                                               '— no external citation needed for these '
                                               'fundamentals.']}}}

RADAR_ITEMS = [{'name': 'Playwright',
  'category': 'Adopt',
  'what_it_is': 'A modern browser automation framework for end-to-end testing, with built-in '
                'auto-waiting and multi-browser support.',
  'why_it_matters': 'Faster and more reliable than older Selenium-based setups for most new UI '
                    'test suites.',
  'who_should_learn': 'QA/SDET learners starting UI automation today.',
  'related_roles': ['sdet']},
 {'name': 'Git',
  'category': 'Adopt',
  'what_it_is': 'Distributed version control — the standard way software teams track and '
                'collaborate on code changes.',
  'why_it_matters': "Foundational for every technical role; there's no serious alternative in "
                    'mainstream use.',
  'who_should_learn': 'Everyone, regardless of role.',
  'related_roles': ['sdet', 'developer', 'devops']},
 {'name': 'Docker',
  'category': 'Adopt',
  'what_it_is': 'A tool for packaging an application and its dependencies into a portable '
                'container.',
  'why_it_matters': 'The standard building block for modern deployment, CI pipelines, and local '
                    'dev environments.',
  'who_should_learn': 'Developers and DevOps engineers; increasingly useful for SDETs setting up '
                      'test environments too.',
  'related_roles': ['developer', 'devops', 'sdet']},
 {'name': 'TypeScript',
  'category': 'Adopt',
  'what_it_is': 'A typed superset of JavaScript that compiles to plain JavaScript.',
  'why_it_matters': 'Default choice for most new JavaScript projects — catches a large class of '
                    'bugs before runtime.',
  'who_should_learn': 'Frontend, full-stack, and Node.js developers.',
  'related_roles': ['developer']},
 {'name': 'Kubernetes',
  'category': 'Trial',
  'what_it_is': 'A container orchestration platform for deploying, scaling, and managing '
                'containerized applications.',
  'why_it_matters': 'Industry-standard for larger-scale deployments, but genuinely more complexity '
                    'than many small teams need.',
  'who_should_learn': 'DevOps engineers; developers at companies already running it in production.',
  'related_roles': ['devops']},
 {'name': 'AI coding assistants',
  'category': 'Trial',
  'what_it_is': 'Tools like Claude Code or GitHub Copilot that generate and edit code from '
                'natural-language prompts inside your workflow.',
  'why_it_matters': 'Genuinely speeds up boilerplate and first drafts, but still requires the '
                    'developer to review, test, and own the result.',
  'who_should_learn': 'All technical roles — the skill of directing and reviewing AI-generated '
                      'code is becoming as important as writing it by hand.',
  'related_roles': ['developer', 'sdet', 'devops']},
 {'name': 'LLM evaluation frameworks',
  'category': 'Assess',
  'what_it_is': 'Tools (e.g. promptfoo, DeepEval) for systematically testing prompt/model outputs '
                'against golden datasets.',
  'why_it_matters': 'Purpose-built for AI-QA work, but the tooling and best practices are still '
                    'young and changing quickly.',
  'who_should_learn': 'SDETs moving into AI-QA.',
  'related_roles': ['sdet']},
 {'name': 'GraphQL',
  'category': 'Assess',
  'what_it_is': 'A query language for APIs that lets clients request exactly the data they need.',
  'why_it_matters': 'Solid fit for some frontend-heavy apps with complex data needs, but REST '
                    'remains the safer default for most APIs.',
  'who_should_learn': 'Backend/full-stack developers evaluating API design for a specific '
                      "project's needs.",
  'related_roles': ['developer']},
 {'name': 'Agentic / multi-agent AI systems',
  'category': 'Watch',
  'what_it_is': 'AI systems where one or more models plan, use tools, and act with some autonomy '
                'toward a goal, rather than answering a single prompt.',
  'why_it_matters': 'Fast-moving area with real production use emerging, but patterns for '
                    'reliability, evaluation, and safety are still being worked out.',
  'who_should_learn': 'AI-QA specialists and developers building AI-powered features, as awareness '
                      'rather than deep expertise yet.',
  'related_roles': ['sdet', 'developer']},
 {'name': 'WebAssembly (Wasm)',
  'category': 'Watch',
  'what_it_is': 'A binary instruction format that lets code written in languages like C++/Rust run '
                'in the browser near-natively.',
  'why_it_matters': 'Enables high-performance web use cases, but still a niche choice outside '
                    'specific performance-sensitive applications.',
  'who_should_learn': 'Developers working on performance-critical web applications.',
  'related_roles': ['developer']},
 {'name': 'jQuery for new projects',
  'category': 'Declining',
  'what_it_is': 'A JavaScript library for DOM manipulation and AJAX that was dominant in the '
                '2010s.',
  'why_it_matters': 'Modern frameworks (React, Vue) and native browser APIs cover its use cases '
                    'better for new projects — mostly relevant now for maintaining legacy '
                    'codebases.',
  'who_should_learn': 'Only developers maintaining existing jQuery codebases.',
  'related_roles': ['developer']},
 {'name': 'AI-native test evaluation harnesses',
  'category': 'Emerging',
  'what_it_is': 'Purpose-built pipelines for continuously evaluating AI-powered product features, '
                'not just one-off model benchmarks.',
  'why_it_matters': 'As more products ship AI features, this is likely to become a standard part '
                    'of QA rather than a specialty — still forming as a discipline.',
  'who_should_learn': 'QA/SDET learners who want to be early in a role AI-QA is turning into a '
                      'real specialization.',
  'related_roles': ['sdet']}]
