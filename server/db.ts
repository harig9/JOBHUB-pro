import fs from 'fs';
import path from 'path';
import type {
  User,
  Job,
  JobStatus,
  JobStatusHistory,
  Resume,
  CoverLetter,
  InterviewSession,
  ATSScanResult,
  CareerAnalytics,
} from './types.ts';

interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  jobStatusHistory: JobStatusHistory[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
  interviews: InterviewSession[];
  atsScans: ATSScanResult[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jobhub_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialSeedData: DatabaseSchema = {
  users: [
    {
      id: 'usr_demo_01',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      headline: 'Staff Full-Stack & Distributed Systems Architect',
      targetRole: 'Senior Full Stack Engineer / Solutions Architect',
      yearsExperience: 8,
      phone: '+1 (555) 438-9201',
      location: 'San Francisco, CA (Open to Remote)',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      githubUrl: 'https://github.com/alexmorgan-code',
      portfolioUrl: 'https://alexmorgan.tech',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  resumes: [
    {
      id: 'res_primary_01',
      userId: 'usr_demo_01',
      title: 'Senior Full Stack & AI Systems Engineer (Master ATS)',
      isPrimary: true,
      templateId: 'modern-clean',
      targetRoles: ['Senior Full Stack Engineer', 'Software Architect', 'Staff Engineer'],
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 438-9201',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan-dev',
        github: 'github.com/alexmorgan-code',
        website: 'alexmorgan.tech',
      },
      summary:
        'Results-driven Senior Full-Stack Software Engineer with 8+ years of experience designing, building, and scaling resilient cloud architectures, real-time distributed platforms, and high-throughput microservices. Proven expertise in React, TypeScript, Node.js/Java Spring Boot, PostgreSQL/MySQL, AWS, and production LLM integrations. Led engineering teams that boosted platform throughput by 420% while reducing latency by 45%. Dedicated to clean code, test-driven development, and automated CI/CD pipelines.',
      experiences: [
        {
          id: 'exp_01',
          company: 'HyperScale Cloud Technologies',
          position: 'Staff Full-Stack Architect',
          location: 'San Francisco, CA',
          startDate: '2022-04',
          endDate: 'Present',
          current: true,
          bulletPoints: [
            'Architected and led the migration of a monolithic enterprise portal to an event-driven microservices architecture using Spring Boot, Node.js, and Kafka, serving 3.5M+ daily active users.',
            'Engineered real-time reactive dashboards in React 19 and TypeScript, decreasing page load times from 2.8s to 420ms and elevating Lighthouse performance scores to 99/100.',
            'Designed optimized MySQL and PostgreSQL partitioning strategies, cutting p99 database query response times by 58% on high-cardinality financial transaction sets.',
            'Integrated server-side Generative AI processing pipelines using Gemini 3.8 and LangChain, automating document classification and accelerating customer review turnaround by 78%.',
            'Mentored 11 junior and mid-level software engineers across 3 squads, instituting standardized code review rubrics and end-to-end Cypress/Jest test suites with 92% code coverage.',
          ],
        },
        {
          id: 'exp_02',
          company: 'Nexus FinTech Labs',
          position: 'Senior Software Engineer',
          location: 'New York, NY (Remote)',
          startDate: '2019-06',
          endDate: '2022-03',
          current: false,
          bulletPoints: [
            'Spearheaded development of a high-security payment reconciliation service processing $120M+ in monthly transaction volume with zero downtime SLA (99.999%).',
            'Implemented JWT-based authentication, RBAC authorization, and OAuth2 identity management compliant with SOC2 and PCI-DSS standards.',
            'Built reusable React component library with Tailwind CSS, reducing front-end development cycle time across 4 engineering teams by 35%.',
            'Optimized Docker containerization and Kubernetes orchestration workflows on AWS (EKS, RDS, Redis, CloudFront), cutting monthly cloud infrastructure spend by $42,000.',
          ],
        },
        {
          id: 'exp_03',
          company: 'Vanguard Interactive Systems',
          position: 'Full Stack Software Engineer',
          location: 'Austin, TX',
          startDate: '2017-08',
          endDate: '2019-05',
          current: false,
          bulletPoints: [
            'Developed RESTful API endpoints and GraphQL schemas for an omni-channel inventory management SaaS application utilized by 850+ retail businesses.',
            'Constructed responsive Single Page Applications (SPAs) with React, Redux, and WebSockets, facilitating real-time stock alert synchronization.',
            'Refactored legacy SQL schemas into normalized 3NF structures with indexed foreign keys, eliminating recurring deadlocks during peak flash sale campaigns.',
          ],
        },
      ],
      educations: [
        {
          id: 'edu_01',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science (B.S.)',
          fieldOfStudy: 'Computer Science & Software Engineering',
          location: 'Berkeley, CA',
          startDate: '2013-09',
          endDate: '2017-05',
          gpa: '3.86 / 4.00',
          honors: 'Magna Cum Laude, Dean’s Honors List',
        },
      ],
      skills: [
        {
          category: 'Frontend & UI Engineering',
          skills: ['React 19', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'HTML5/Semantic Web', 'State Management (Zustand/Redux)', 'WebSockets'],
        },
        {
          category: 'Backend & System Architecture',
          skills: ['Node.js', 'Express', 'Java', 'Spring Boot', 'RESTful API Design', 'GraphQL', 'Microservices', 'Event-Driven Architecture', 'Kafka'],
        },
        {
          category: 'Databases & Storage',
          skills: ['PostgreSQL', 'MySQL', 'Redis', 'Database Indexing', 'Schema Normalization (3NF)', 'Transactions & ACID', 'Prisma / Drizzle'],
        },
        {
          category: 'Cloud & DevOps',
          skills: ['AWS (ECS, EKS, RDS, S3)', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Terraform', 'Monitoring (Datadog, Prometheus)'],
        },
        {
          category: 'AI & Engineering Disciplines',
          skills: ['Generative AI Integration', 'Gemini API', 'Prompt Engineering', 'TDD (Jest, Playwright)', 'Cybersecurity (OAuth2, JWT, OWASP)', 'Agile/Scrum'],
        },
      ],
      projects: [
        {
          id: 'proj_01',
          name: 'Distributed Low-Latency Task Engine',
          description: 'Open-source distributed task orchestrator supporting priority queues, dead-letter re-routing, and cluster leader election.',
          technologies: ['TypeScript', 'Node.js', 'Redis', 'Docker'],
          link: 'https://github.com/alexmorgan-code/distributed-task-engine',
          metrics: 'Processes 25,000 tasks/sec with <4ms scheduling jitter; 1,400+ GitHub Stars',
        },
        {
          id: 'proj_02',
          name: 'ATS Semantic Keyword & Resume Parser',
          description: 'High-accuracy parser extracting semantic competence, skill vectors, and ATS compliance scores from PDF and DOCX files.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Gemini AI'],
          link: 'https://github.com/alexmorgan-code/ats-resume-parser',
          metrics: 'Evaluates ATS compliance with 94% alignment to Taleo & Workday parsing engines',
        },
      ],
      certifications: [
        {
          id: 'cert_01',
          name: 'AWS Certified Solutions Architect – Professional (SAP-C02)',
          issuer: 'Amazon Web Services',
          issueDate: '2023-08',
          expiryDate: '2026-08',
          credentialId: 'AWS-SAP-984210',
        },
        {
          id: 'cert_02',
          name: 'Oracle Certified Professional: Java SE 17 Developer',
          issuer: 'Oracle',
          issueDate: '2022-03',
          credentialId: 'OCP-JAVA-548190',
        },
      ],
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  jobs: [
    {
      id: 'job_01',
      userId: 'usr_demo_01',
      title: 'Senior Full Stack Engineer (Distributed Platforms)',
      company: 'Stripe',
      location: 'San Francisco, CA (Remote Eligible)',
      employmentType: 'Full-time',
      salaryRange: '$185,000 - $225,000 + Equity',
      status: 'interviewing',
      applicationDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
      directUrl: 'https://stripe.com/jobs/senior-fullstack-platforms',
      contactPerson: 'Sarah Chen (Senior Technical Recruiter)',
      contactEmail: 'schen-recruiting@stripe.com',
      jobDescription: `Stripe is looking for a Senior Full Stack Engineer to build reliable, high-throughput financial infrastructure and merchant dashboard experiences.

Responsibilities:
- Build delightful, accessible, and high-performance user interfaces using React, TypeScript, and modern CSS frameworks.
- Design and scale resilient backend RESTful microservices using Java / Spring Boot or Node.js.
- Partner with database architects to optimize relational data models in MySQL and PostgreSQL for transaction integrity and ACID compliance.
- Implement robust authentication, JWT security tokens, and OAuth flows protecting mission-critical financial data.
- Lead system reliability initiatives, CI/CD pipelines, and automated integration testing with Jest and Cypress.

Requirements:
- 5+ years of full-stack software development experience in cloud-native environments.
- Deep expertise in TypeScript, React, state management, and modern component systems.
- Strong proficiency in Java, Spring Boot, or Node.js backend services.
- Solid understanding of relational database design (MySQL, PostgreSQL), foreign keys, indexing, and query optimization.
- Experience with cloud architecture (AWS or GCP), Docker, and microservice orchestration.
- Excellent communication skills and passion for mentoring engineers.`,
      notes: 'Passed technical screen with flying colors! System design round scheduled for next Tuesday at 2:00 PM PST. Focus on distributed transactions and idempotency keys.',
      matchScore: 92,
      keySkills: ['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'Microservices', 'REST API', 'AWS', 'System Design'],
      priority: 'high',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'job_02',
      userId: 'usr_demo_01',
      title: 'Staff AI Solutions Architect',
      company: 'Anthropic',
      location: 'San Francisco, CA (Hybrid)',
      employmentType: 'Full-time',
      salaryRange: '$210,000 - $260,000 + Significant Equity',
      status: 'interviewing',
      applicationDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      directUrl: 'https://anthropic.com/careers/ai-solutions-architect',
      contactPerson: 'David Ross (Head of Solutions Engineering)',
      contactEmail: 'david.ross@anthropic.com',
      jobDescription: `Join Anthropic to help world-class enterprise customers architect, integrate, and scale advanced AI solutions powered by Claude and modern LLMs.

Responsibilities:
- Collaborate with engineering leaders at Fortune 500 companies to architect secure, scalable GenAI integrations.
- Build production-ready reference implementations combining modern React/TypeScript frontends with robust backend microservices.
- Ensure strict security compliance (SOC2, OAuth, JWT, data masking, and model guardrails).
- Benchmark model performance, latency, token throughput, and prompt engineering strategies.

Requirements:
- 7+ years of software engineering or solutions architecture experience.
- Hands-on mastery of TypeScript, Python or Java, and modern web application frameworks.
- Deep practical experience integrating LLM APIs, structured outputs (JSON schema), function calling, and vector embeddings.
- Track record of designing distributed, resilient systems with relational databases (PostgreSQL/MySQL) and cloud infrastructure.`,
      notes: 'Completed hiring manager chat. Preparing sample architecture presentation for enterprise multi-tenant GenAI pipeline.',
      matchScore: 89,
      keySkills: ['GenAI Integration', 'TypeScript', 'React', 'Java', 'Python', 'System Architecture', 'Security (OAuth, JWT)', 'PostgreSQL', 'Cloud Architecture'],
      priority: 'high',
      createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'job_03',
      userId: 'usr_demo_01',
      title: 'Lead Platform & Cloud Engineer',
      company: 'Datadog',
      location: 'San Francisco, CA / Remote',
      employmentType: 'Full-time',
      salaryRange: '$195,000 - $235,000',
      status: 'applied',
      applicationDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
      directUrl: 'https://careers.datadoghq.com/detail/549102',
      contactPerson: 'Elena Rostova',
      contactEmail: 'elena.rostova@datadoghq.com',
      jobDescription: `Datadog is looking for a Lead Platform Engineer to elevate our developer platform and telemetry ingestion services.

Key Requirements:
- Microservices in Go, Java, or Node.js.
- Kubernetes, Docker, Terraform, and AWS/GCP cloud platforms.
- Deep relational database experience (PostgreSQL, MySQL, CockroachDB) and cache layers (Redis).
- High-availability distributed architectures handling millions of telemetry points per second.`,
      notes: 'Applied with customized 88% ATS-tailored resume emphasizing AWS Solutions Architect certification and Kubernetes expertise.',
      matchScore: 88,
      keySkills: ['AWS', 'Kubernetes', 'Docker', 'Java', 'Node.js', 'PostgreSQL', 'MySQL', 'Redis', 'Distributed Systems'],
      priority: 'medium',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'job_04',
      userId: 'usr_demo_01',
      title: 'Principal Software Engineer (Growth)',
      company: 'Canva',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$190,000 - $240,000 AUD / USD Equiv',
      status: 'offer',
      applicationDate: new Date(Date.now() - 28 * 86400000).toISOString(),
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
      directUrl: 'https://canva.com/careers/lead-growth-eng',
      contactPerson: 'Marcus Vance (Director of Engineering)',
      contactEmail: 'marcus.vance@canva.com',
      jobDescription: `Lead frontend and full-stack experiments driving activation, retention, and internationalization for Canva's 170M+ monthly users.

Requirements:
- Proven excellence in TypeScript, React, web performance optimization, and experiment-driven engineering.
- Deep understanding of distributed backend APIs, database optimization, and high-frequency event streaming.`,
      notes: 'OFFER RECEIVED! $215,000 base + equity package. Have until Friday next week to make final decision. Currently evaluating counter-offers.',
      matchScore: 94,
      keySkills: ['React', 'TypeScript', 'Web Performance', 'Microservices', 'Distributed Systems', 'Experimentation'],
      priority: 'high',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'job_05',
      userId: 'usr_demo_01',
      title: 'Senior Backend Engineer (Payments)',
      company: 'Airbnb',
      location: 'San Francisco, CA (Live and Work Anywhere)',
      employmentType: 'Full-time',
      salaryRange: '$180,000 - $215,000',
      status: 'wishlist',
      deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
      directUrl: 'https://careers.airbnb.com/positions/491024',
      contactPerson: '',
      contactEmail: '',
      jobDescription: `Airbnb Payments handles multi-currency transactions across 220+ countries. We need engineers with strong Java/Spring, MySQL/Aurora, distributed consensus, and idempotent workflow design.`,
      notes: 'Need to run ATS scan against current resume before applying. Reach out to former colleague Jane at Airbnb for referral.',
      matchScore: 84,
      keySkills: ['Java', 'Spring Boot', 'MySQL', 'Distributed Systems', 'Idempotency', 'Kafka', 'AWS'],
      priority: 'medium',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  jobStatusHistory: [
    {
      id: 'hist_01',
      jobId: 'job_01',
      fromStatus: 'wishlist',
      toStatus: 'applied',
      note: 'Submitted application on Stripe careers portal with customized cover letter.',
      changedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'hist_02',
      jobId: 'job_01',
      fromStatus: 'applied',
      toStatus: 'interviewing',
      note: 'Recruiter reached out for 30-min intro chat, followed by coding assessment invite.',
      changedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'hist_03',
      jobId: 'job_04',
      fromStatus: 'interviewing',
      toStatus: 'offer',
      note: 'Official offer letter received after final presentation with VP of Engineering.',
      changedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  coverLetters: [
    {
      id: 'cov_01',
      userId: 'usr_demo_01',
      jobId: 'job_01',
      resumeId: 'res_primary_01',
      title: 'Stripe — Senior Full Stack Engineer Cover Letter',
      recipientName: 'Hiring Team & Sarah Chen',
      recipientTitle: 'Head of Technical Recruiting',
      companyName: 'Stripe',
      jobTitle: 'Senior Full Stack Engineer (Distributed Platforms)',
      tone: 'professional',
      content: `Dear Sarah and the Stripe Engineering Team,

I am writing to express my strong enthusiasm for the Senior Full Stack Engineer role on Stripe's Distributed Platforms team. With over 8 years of engineering experience architecting scalable microservices in Java/Spring Boot and Node.js, combined with crafting high-performance, accessible user interfaces in React and TypeScript, I have long admired Stripe's gold-standard developer tooling and uncompromising commitment to platform reliability.

In my current role as Staff Full-Stack Architect at HyperScale Cloud Technologies, I led the architectural evolution from a legacy monolith to an event-driven microservices ecosystem. By optimizing MySQL database indexing, sharding strategies, and implementing asynchronous Kafka message queues, our team reduced p99 query latency by 58% while expanding capacity to support 3.5 million daily active users. On the frontend, I spearheaded the adoption of React 19 and typed component systems, accelerating page rendering speeds by 85% and maintaining a 99/100 Lighthouse performance benchmark.

Stripe's mission to increase the GDP of the internet demands software engineers who obsess over transaction idempotency, low-latency API contracts, and airtight security protocols such as JWT authentication and OAuth2. Having built payment reconciliation pipelines processing $120M+ in monthly transaction volume with five-nines availability (99.999%), I understand the rigorous standards necessary when moving real money at scale.

I would welcome the opportunity to discuss how my hands-on background in full-stack architecture, relational database optimization, and team mentorship can directly accelerate Stripe's distributed infrastructure objectives. Thank you for your time, consideration, and dedication to builders everywhere.

Sincerely,
Alex Morgan`,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ],
  interviews: [
    {
      id: 'intv_01',
      userId: 'usr_demo_01',
      jobId: 'job_01',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'Stripe',
      experienceLevel: 'Senior / Staff',
      status: 'in-progress',
      overallScore: 8.8,
      questions: [
        {
          id: 'q_01',
          category: 'technical',
          question: 'How would you design an idempotent payment processing API to prevent duplicate charges in distributed architectures?',
          contextWhyAsked: 'Stripe heavily relies on idempotency keys to ensure network retries do not double-bill customers.',
          tips: [
            'Explain how unique idempotency keys are sent in HTTP headers (e.g., Idempotency-Key: uuid).',
            'Discuss distributed lock mechanisms (Redis redlock or database row locks).',
            'Cover caching the original response payload and status code to return identical responses on subsequent retries.',
            'Explain edge cases: in-flight concurrent requests, cache expiration TTL, and database transactions.',
          ],
          sampleStarAnswer: {
            situation: 'At Nexus FinTech, we faced occasional network disconnects where clients re-submitted $100k+ batch transfers, risking duplicate transactions.',
            task: 'Design an end-to-end idempotent gateway layer supporting at-least-once delivery semantics without double-processing.',
            action: 'Introduced an Idempotency-Key header stored in Redis with an atomic SETNX lock and a 24-hour TTL. If a duplicate key arrived while the first was processing, it returned a 409 Conflict with a retry-after header. Once committed in PostgreSQL via ACID transaction, the response payload was cached against the key.',
            result: 'Completely eliminated duplicate transaction incidents across $120M monthly volume and reduced dispute handling overhead by 100%.',
          },
          userAnswer:
            'I use an Idempotency-Key header sent by the client. The server checks Redis or a relational table using atomic insertion. If the key exists and the previous transaction succeeded, we return the cached response immediately. If it is in-progress, we return a lock status. If it does not exist, we process the transaction inside a database ACID transaction and store the resulting response.',
          evaluation: {
            score: 9.2,
            strengths: [
              'Accurately addressed atomic locks and cached response return',
              'Correctly identified ACID transaction wrapping for state mutation',
              'Demonstrated clear understanding of distributed network retry realities',
            ],
            improvements: [
              'Could mention lock expiration timeouts (TTL) in case the server crashes mid-flight',
              'Mention returning specific HTTP status codes (like 409 or 425) for in-flight requests',
            ],
            starFeedback: 'Strong, technically sound answer. Incorporating a concrete metric from past production experience will turn this into a 10/10.',
            betterAnswerDraft:
              'In distributed financial systems like Stripe, I implement idempotency via client-generated Idempotency-Key headers. On receiving a request, the API gateway attempts an atomic Redis SETNX with a lease TTL (e.g. 120 seconds). If the key already exists and has a finished payload, the gateway short-circuits and replays the cached 200 OK response. If the key is locked by an in-flight worker, it responds with 409 Conflict. Once the backend commits the financial state change inside a relational ACID transaction, it updates the idempotency record with the final response payload and sets a 24-hour retention TTL.',
          },
        },
        {
          id: 'q_02',
          category: 'behavioral',
          question: 'Describe a situation where you had a strong technical disagreement with a team member or architect. How did you resolve it?',
          contextWhyAsked: 'Evaluates emotional intelligence, conflict resolution, data-driven decision making, and leadership.',
          tips: [
            'Use the STAR method explicitly.',
            'Avoid casting the other person negatively; focus on differing engineering trade-offs.',
            'Highlight how you leveraged data, benchmarks, or small proof-of-concepts (POCs) rather than ego.',
          ],
          sampleStarAnswer: {
            situation: 'During our platform rewrite at HyperScale, the principal architect insisted on pure GraphQL for every public API, while I advocated for RESTful endpoints for high-throughput webhook ingest.',
            task: 'Find a consensus that balanced developer DX with stringent p99 sub-50ms latency SLAs.',
            action: 'Instead of debating endlessly in Slack, I built a benchmark POC using k6 comparing payload parsing overhead. The data showed REST with Protobuf saved 45% CPU under 10k RPS. We agreed on a hybrid architecture: GraphQL for frontend client dashboards and REST for webhook ingress.',
            result: 'Both services launched on time, meeting all latency targets while fostering deep mutual respect between our engineering groups.',
          },
        },
        {
          id: 'q_03',
          category: 'technical',
          question: 'How do you optimize a slow relational query in MySQL or PostgreSQL that is causing high CPU spikes in production?',
          contextWhyAsked: 'Tests practical database debugging, index design, query plans, and performance tuning under load.',
          tips: [
            'Explain using EXPLAIN ANALYZE to inspect sequential scans vs index scans.',
            'Discuss composite indexing, covering indexes, and avoiding SELECT *.',
            'Mention query antipatterns like functions on indexed columns (e.g. WHERE DATE(created_at) = ...).',
            'Address connection pooling, read replicas, and caching layers.',
          ],
        },
      ],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  atsScans: [
    {
      id: 'scan_01',
      resumeId: 'res_primary_01',
      jobId: 'job_01',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'Stripe',
      overallScore: 92,
      matchRating: 'Excellent',
      breakdown: {
        hardSkillsScore: 95,
        softSkillsScore: 90,
        experienceRelevanceScore: 94,
        formattingScore: 98,
        quantifiableMetricsScore: 92,
      },
      skillsAnalysis: {
        matchedHardSkills: ['React', 'TypeScript', 'Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'Microservices', 'RESTful API', 'AWS', 'Docker', 'OAuth2', 'JWT'],
        missingHardSkills: ['Idempotency Keys', 'Kafka Stream Processing', 'Cypress E2E'],
        matchedSoftSkills: ['Mentorship', 'Cross-functional Collaboration', 'System Design', 'Code Reviews'],
        missingSoftSkills: ['Incident Response On-call', 'Direct Customer Discovery'],
      },
      actionableRecommendations: [
        {
          priority: 'high',
          section: 'Experience',
          suggestion: 'Explicitly highlight API idempotency key handling and payment retry protection in the HyperScale experience bullet points.',
          impact: '+4% ATS match increase for Stripe-specific keyword scoring',
        },
        {
          priority: 'medium',
          section: 'Summary',
          suggestion: 'Add "Distributed Financial Platforms" into the opening sentence of the professional summary.',
          impact: '+2% ATS keyword density match',
        },
        {
          priority: 'low',
          section: 'Skills',
          suggestion: 'Ensure "Idempotent API Design" and "Kafka Event Streaming" are listed in the Backend Architecture skills category.',
          impact: '+1% hard skills match boost',
        },
      ],
      tailoredBulletSuggestions: [
        {
          original: 'Architected and led the migration of a monolithic enterprise portal to an event-driven microservices architecture using Spring Boot, Node.js, and Kafka...',
          improved: 'Architected high-reliability financial microservices in Java Spring Boot and Kafka, implementing idempotent API requests and distributed locking to support 3.5M+ daily transactions with 99.999% consistency.',
          targetKeywords: ['Idempotent API', 'Java Spring Boot', 'Financial Microservices', 'Distributed Locking'],
        },
      ],
      scannedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
};

class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
    this.save(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  private save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database file:', err);
    }
  }

  private persist(): void {
    this.save(this.data);
  }

  // --- Users ---
  getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id) || this.data.users[0];
  }

  updateUser(id: string, updates: Partial<User>): User {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[idx];
  }

  // --- Jobs ---
  getJobs(userId: string): Job[] {
    return this.data.jobs
      .filter((j) => j.userId === userId || !userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getJobById(id: string): Job | undefined {
    return this.data.jobs.find((j) => j.id === id);
  }

  createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.jobs.unshift(newJob);

    // Record initial status in history
    this.data.jobStatusHistory.push({
      id: `hist_${Date.now()}`,
      jobId: newJob.id,
      fromStatus: 'wishlist',
      toStatus: newJob.status,
      note: 'Job opportunity created',
      changedAt: new Date().toISOString(),
    });

    this.persist();
    return newJob;
  }

  updateJob(id: string, updates: Partial<Job>): Job {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) {
      throw new Error(`Job ${id} not found`);
    }

    const prevJob = this.data.jobs[idx];
    const prevStatus = prevJob.status;

    this.data.jobs[idx] = {
      ...prevJob,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status && updates.status !== prevStatus) {
      this.data.jobStatusHistory.push({
        id: `hist_${Date.now()}`,
        jobId: id,
        fromStatus: prevStatus,
        toStatus: updates.status,
        note: updates.notes || `Status transitioned from ${prevStatus} to ${updates.status}`,
        changedAt: new Date().toISOString(),
      });
    }

    this.persist();
    return this.data.jobs[idx];
  }

  deleteJob(id: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => j.id !== id);
    this.data.jobStatusHistory = this.data.jobStatusHistory.filter((h) => h.jobId !== id);
    this.data.atsScans = this.data.atsScans.filter((s) => s.jobId !== id);
    this.persist();
    return this.data.jobs.length < initialLen;
  }

  getJobHistory(jobId: string): JobStatusHistory[] {
    return this.data.jobStatusHistory
      .filter((h) => h.jobId === jobId)
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  }

  // --- Resumes ---
  getResumes(userId: string): Resume[] {
    return this.data.resumes.filter((r) => r.userId === userId || !userId);
  }

  getResumeById(id: string): Resume | undefined {
    return this.data.resumes.find((r) => r.id === id);
  }

  createResume(resumeData: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Resume {
    const newResume: Resume = {
      ...resumeData,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newResume.isPrimary) {
      // Unset other primaries
      this.data.resumes.forEach((r) => {
        if (r.userId === newResume.userId) r.isPrimary = false;
      });
    }

    this.data.resumes.unshift(newResume);
    this.persist();
    return newResume;
  }

  updateResume(id: string, updates: Partial<Resume>): Resume {
    const idx = this.data.resumes.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Resume ${id} not found`);
    }

    if (updates.isPrimary) {
      const userId = this.data.resumes[idx].userId;
      this.data.resumes.forEach((r) => {
        if (r.userId === userId && r.id !== id) r.isPrimary = false;
      });
    }

    this.data.resumes[idx] = {
      ...this.data.resumes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.resumes[idx];
  }

  deleteResume(id: string): boolean {
    const initialLen = this.data.resumes.length;
    this.data.resumes = this.data.resumes.filter((r) => r.id !== id);
    this.persist();
    return this.data.resumes.length < initialLen;
  }

  duplicateResume(id: string): Resume {
    const original = this.getResumeById(id);
    if (!original) throw new Error(`Resume ${id} not found`);

    const duplicate: Resume = {
      ...JSON.parse(JSON.stringify(original)),
      id: `res_${Date.now()}_dup`,
      title: `${original.title} (Tailored Copy)`,
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.resumes.unshift(duplicate);
    this.persist();
    return duplicate;
  }

  // --- Cover Letters ---
  getCoverLetters(userId: string): CoverLetter[] {
    return this.data.coverLetters.filter((c) => c.userId === userId || !userId);
  }

  getCoverLetterById(id: string): CoverLetter | undefined {
    return this.data.coverLetters.find((c) => c.id === id);
  }

  createCoverLetter(clData: Omit<CoverLetter, 'id' | 'createdAt' | 'updatedAt'>): CoverLetter {
    const newCL: CoverLetter = {
      ...clData,
      id: `cov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.coverLetters.unshift(newCL);
    this.persist();
    return newCL;
  }

  updateCoverLetter(id: string, updates: Partial<CoverLetter>): CoverLetter {
    const idx = this.data.coverLetters.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Cover Letter ${id} not found`);

    this.data.coverLetters[idx] = {
      ...this.data.coverLetters[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.coverLetters[idx];
  }

  deleteCoverLetter(id: string): boolean {
    const len = this.data.coverLetters.length;
    this.data.coverLetters = this.data.coverLetters.filter((c) => c.id !== id);
    this.persist();
    return this.data.coverLetters.length < len;
  }

  // --- Interview Sessions ---
  getInterviews(userId: string): InterviewSession[] {
    return this.data.interviews.filter((i) => i.userId === userId || !userId);
  }

  getInterviewById(id: string): InterviewSession | undefined {
    return this.data.interviews.find((i) => i.id === id);
  }

  createInterview(data: Omit<InterviewSession, 'id' | 'createdAt' | 'updatedAt'>): InterviewSession {
    const session: InterviewSession = {
      ...data,
      id: `intv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.interviews.unshift(session);
    this.persist();
    return session;
  }

  updateInterview(id: string, updates: Partial<InterviewSession>): InterviewSession {
    const idx = this.data.interviews.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Interview ${id} not found`);

    this.data.interviews[idx] = {
      ...this.data.interviews[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.interviews[idx];
  }

  // --- ATS Scans ---
  getATSScans(userId: string): ATSScanResult[] {
    return this.data.atsScans;
  }

  saveATSScan(scan: ATSScanResult): ATSScanResult {
    this.data.atsScans.unshift(scan);
    // Keep last 30 scans
    if (this.data.atsScans.length > 30) {
      this.data.atsScans = this.data.atsScans.slice(0, 30);
    }
    this.persist();
    return scan;
  }

  // --- Analytics ---
  getAnalytics(userId: string): CareerAnalytics {
    const jobs = this.getJobs(userId);
    const total = jobs.length;

    const statusCounts: Record<JobStatus, number> = {
      wishlist: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      archived: 0,
    };

    let totalScore = 0;
    let scoredJobs = 0;

    const skillCounts: Record<string, number> = {};

    jobs.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
      if (j.matchScore) {
        totalScore += j.matchScore;
        scoredJobs++;
      }
      j.keySkills?.forEach((s) => {
        const norm = s.trim();
        skillCounts[norm] = (skillCounts[norm] || 0) + 1;
      });
    });

    const primaryResume = this.data.resumes.find((r) => r.userId === userId && r.isPrimary) || this.data.resumes[0];
    const userSkillsSet = new Set<string>();
    primaryResume?.skills?.forEach((cat) => {
      cat.skills.forEach((s) => userSkillsSet.add(s.toLowerCase()));
    });

    const topSkillsInDemand = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        userHasSkill: userSkillsSet.has(skill.toLowerCase()),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const interviewedOrOffered = statusCounts.interviewing + statusCounts.offer;
    const activeApplied = statusCounts.applied + statusCounts.interviewing + statusCounts.offer + statusCounts.rejected;

    const interviewRate = activeApplied > 0 ? Math.round((interviewedOrOffered / activeApplied) * 100) : 0;
    const offerRate = activeApplied > 0 ? Math.round((statusCounts.offer / activeApplied) * 100) : 0;
    const avgMatchScore = scoredJobs > 0 ? Math.round(totalScore / scoredJobs) : 88;

    const pipelineFunnel = [
      { stage: 'Wishlist & Identified', count: statusCounts.wishlist, percentage: 100 },
      { stage: 'Applications Submitted', count: activeApplied, percentage: total > 0 ? Math.round((activeApplied / total) * 100) : 0 },
      { stage: 'Interview Stage', count: statusCounts.interviewing + statusCounts.offer, percentage: activeApplied > 0 ? Math.round(((statusCounts.interviewing + statusCounts.offer) / activeApplied) * 100) : 0 },
      { stage: 'Offers Extended', count: statusCounts.offer, percentage: activeApplied > 0 ? Math.round((statusCounts.offer / activeApplied) * 100) : 0 },
    ];

    // Simple timeline aggregation by date
    const dateMap: Record<string, number> = {};
    jobs.forEach((j) => {
      const d = (j.applicationDate || j.createdAt).substring(0, 10);
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    const applicationsTimeline = Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalApplications: total,
      statusCounts,
      interviewRate,
      offerRate,
      avgMatchScore,
      topSkillsInDemand,
      applicationsTimeline,
      pipelineFunnel,
    };
  }

  resetToSeed(): void {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.persist();
  }
}

export const db = new RelationalDatabase();
