import fs from 'fs';
import path from 'path';
import {
  CareerRoadmap,
  AptitudeQuestionItem,
  PracticeSubmission,
  SkillGapNode,
  CompanyResearchPack,
  CareerVaultDocument,
  OfferComparisonItem,
  NetworkingContact,
  WeeklyCareerReport,
  CareerAchievement,
  JobMatchResult,
  Job,
  Resume,
} from './types.js';
import { db as coreDb } from './db.js';

interface CareerSuiteDatabaseSchema {
  roadmaps: CareerRoadmap[];
  aptitudeQuestions: AptitudeQuestionItem[];
  practiceSubmissions: PracticeSubmission[];
  skillGaps: SkillGapNode[];
  companyPacks: CompanyResearchPack[];
  vaultDocuments: CareerVaultDocument[];
  jobOffers: OfferComparisonItem[];
  networkingContacts: NetworkingContact[];
  weeklyReports: WeeklyCareerReport[];
  achievements: CareerAchievement[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CAREER_DB_FILE = path.join(DATA_DIR, 'career_suite_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialCareerSeed: CareerSuiteDatabaseSchema = {
  roadmaps: [
    {
      id: 'roadmap_01',
      userId: 'usr_demo_01',
      targetRole: 'Full Stack Engineer / SDE-1 (Campus & Entry-Level)',
      currentSkills: ['JavaScript', 'React', 'HTML/CSS', 'Python', 'Basic SQL', 'Git'],
      targetDate: '2026-12-31',
      weeklyHoursAvailability: 15,
      estimatedWeeks: 10,
      overallProgress: 45,
      assumptions: [
        'Assumes candidate has core understanding of basic programming principles.',
        '15 dedicated practice hours weekly divided between DSA (6h), Project Dev (6h), and Aptitude (3h).',
        'Not a placement guarantee; milestones correlate with standard Tier-1/Tier-2 product & service company assessment bars.',
      ],
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-10-21T00:00:00.000Z',
      milestones: [
        {
          id: 'ms_01',
          weekNumber: 1,
          title: 'Foundation & Core Data Structures in TypeScript/Java',
          goal: 'Master Arrays, Strings, Hashing, and Two-Pointer techniques for technical screening rounds.',
          completed: true,
          tasks: [
            {
              id: 'task_01_01',
              title: 'Solve Top 15 Array & String Problems on LeetCode/GeeksforGeeks',
              description: 'Focus on Sliding Window, Two-Pointer, and Prefix Sum patterns with optimal time complexities.',
              category: 'practice',
              durationHours: 6,
              completed: true,
              difficulty: 'Beginner',
              resourceLink: 'https://leetcode.com',
            },
            {
              id: 'task_01_02',
              title: 'Aptitude: Master Quantitative Speed Math & Percentages',
              description: 'Practice shortcut calculation tricks for campus placement online tests (TCS NQT, Infosys, Wipro).',
              category: 'practice',
              durationHours: 3,
              completed: true,
              difficulty: 'Beginner',
            },
            {
              id: 'task_01_03',
              title: 'Review System Design Fundamentals: Client-Server & HTTP 1.1/2',
              description: 'Understand REST architectural constraints, status codes, and JSON payload best practices.',
              category: 'learning',
              durationHours: 3,
              completed: true,
              difficulty: 'Beginner',
            },
          ],
        },
        {
          id: 'ms_02',
          weekNumber: 2,
          title: 'Advanced React 19, State Architecture & Full-Stack Node.js',
          goal: 'Build scalable full-stack applications with production-grade REST APIs and validation.',
          completed: true,
          tasks: [
            {
              id: 'task_02_01',
              title: 'Build and Deploy Full-Stack Micro-Service with Express & TypeScript',
              description: 'Implement structured MVC routing, centralized error handlers, and input validation with Zod.',
              category: 'project',
              durationHours: 6,
              completed: true,
              difficulty: 'Intermediate',
            },
            {
              id: 'task_02_02',
              title: 'Database Indexing & Query Tuning in PostgreSQL / MySQL',
              description: 'Write complex JOINs, GROUP BY aggregations, and analyze execution plans with EXPLAIN ANALYZE.',
              category: 'learning',
              durationHours: 4,
              completed: true,
              difficulty: 'Intermediate',
            },
          ],
        },
        {
          id: 'ms_03',
          weekNumber: 3,
          title: 'Trees, Graphs & Dynamic Programming Sprint',
          goal: 'Conquer binary search trees, BFS/DFS graph traversals, and memoized DP for product interviews.',
          completed: false,
          tasks: [
            {
              id: 'task_03_01',
              title: 'Solve Top 12 Tree & Binary Search Questions',
              description: 'Invert binary tree, maximum depth, LCA, validate BST, and level order traversal.',
              category: 'practice',
              durationHours: 6,
              completed: false,
              difficulty: 'Intermediate',
            },
            {
              id: 'task_03_02',
              title: 'Mock Interview: Full Technical Simulation (STAR + Live Coding)',
              description: 'Conduct a timed 45-minute simulation in JobHub Pro Interview Studio with real follow-up questions.',
              category: 'practice',
              durationHours: 2,
              completed: false,
              difficulty: 'Intermediate',
            },
          ],
        },
        {
          id: 'ms_04',
          weekNumber: 4,
          title: 'Production Capstone & Cloud Deployment on GCP/AWS',
          goal: 'Finalize resume-ready enterprise project with Docker, CI/CD, and live demo link.',
          completed: false,
          tasks: [
            {
              id: 'task_04_01',
              title: 'Containerize App with Docker & Deploy to Cloud Run / Render',
              description: 'Create multi-stage Dockerfile, configure environment secrets, and set up health checks.',
              category: 'project',
              durationHours: 7,
              completed: false,
              difficulty: 'Advanced',
            },
            {
              id: 'task_04_02',
              title: 'Complete 3 Full-Length Placement Mock Tests in Coding Lab',
              description: 'Test aptitude speed, technical MCQs, and debugging exercises in a timed 90-minute environment.',
              category: 'practice',
              durationHours: 4,
              completed: false,
              difficulty: 'Advanced',
            },
          ],
        },
      ],
    },
  ],
  aptitudeQuestions: [
    {
      id: 'apt_01',
      category: 'quantitative',
      topic: 'Time and Work',
      difficulty: 'medium',
      question: 'A can complete a piece of work in 12 days and B in 18 days. If they work together for 4 days, what fraction of the work remains to be finished?',
      options: ['5/9', '4/9', '7/18', '11/18'],
      correctOptionIndex: 1,
      explanation: 'Work done by A in 1 day = 1/12. Work done by B in 1 day = 1/18. Together in 1 day = (1/12 + 1/18) = (3+2)/36 = 5/36. In 4 days, they complete 4 * (5/36) = 20/36 = 5/9 of the work. Remaining work = 1 - 5/9 = 4/9.',
      companyTags: ['TCS', 'Infosys', 'Wipro', 'Cognizant'],
    },
    {
      id: 'apt_02',
      category: 'quantitative',
      topic: 'Profit, Loss and Discounts',
      difficulty: 'easy',
      question: 'A retailer buys an article for ₹450 and marks it at 20% above the cost price. He sells it offering a discount of 10% on the marked price. What is his profit percentage?',
      options: ['6%', '8%', '10%', '12%'],
      correctOptionIndex: 1,
      explanation: 'Cost Price (CP) = ₹450. Marked Price (MP) = 450 * 1.20 = ₹540. Selling Price (SP) after 10% discount = 540 * 0.90 = ₹486. Profit = ₹486 - ₹450 = ₹36. Profit % = (36 / 450) * 100 = 8%.',
      companyTags: ['Accenture', 'Tech Mahindra', 'Capgemini'],
    },
    {
      id: 'apt_03',
      category: 'logical',
      topic: 'Coding-Decoding',
      difficulty: 'medium',
      question: 'In a certain code language, if "SYSTEM" is coded as "SYSMET" and "NEARER" is coded as "AENRER", then how will "FRACTION" be coded in that language?',
      options: ['CARFNOIT', 'CARFTION', 'CRAFNOIT', 'ARFCNOIT'],
      correctOptionIndex: 0,
      explanation: 'In "SYSTEM" (6 letters), the first 3 letters "SYS" are reversed to "SYS", and the next 3 letters "TEM" are reversed to "MET" -> SYSMET. In "FRACTION" (8 letters), first 4 letters "FRAC" reversed gives "CARF", and last 4 letters "TION" reversed gives "NOIT". Combined = "CARFNOIT".',
      companyTags: ['Infosys', 'TCS Digital', 'Zoho'],
    },
    {
      id: 'apt_04',
      category: 'verbal',
      topic: 'Sentence Correction & Grammar',
      difficulty: 'easy',
      question: 'Identify the grammatically correct sentence:',
      options: [
        'Neither the manager nor the engineers was available for the sprint retrospective.',
        'Neither the manager nor the engineers were available for the sprint retrospective.',
        'Neither the manager nor the engineers are not available for the sprint retrospective.',
        'Neither the manager or the engineers was available for the sprint retrospective.',
      ],
      correctOptionIndex: 1,
      explanation: 'When subjects are connected by "neither... nor", the verb agrees in number with the subject closest to it. Here, "engineers" is plural and adjacent to the verb, so the plural verb "were" is correct.',
      companyTags: ['Amazon', 'Deloitte', 'Cognizant'],
    },
    {
      id: 'apt_05',
      category: 'sql',
      topic: 'SQL Joins & Aggregations',
      difficulty: 'medium',
      question: 'Which SQL statement finds the 2nd highest salary from the Employee table without using subqueries with fixed offsets?',
      options: [
        'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);',
        'SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 2;',
        'SELECT MIN(salary) FROM Employee WHERE salary > (SELECT MIN(salary) FROM Employee);',
        'SELECT DISTINCT salary FROM Employee ORDER BY salary ASC LIMIT 2;',
      ],
      correctOptionIndex: 0,
      explanation: 'SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee); retrieves the maximum salary strictly smaller than the absolute highest salary, correctly identifying the 2nd highest even if duplicate salaries exist.',
      companyTags: ['Amazon', 'Oracle', 'Flipkart', 'Swiggy'],
    },
    {
      id: 'apt_06',
      category: 'coding',
      topic: 'Arrays & Two Pointers',
      difficulty: 'easy',
      question: 'Two Sum: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
      starterCode: 'function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      testCases: [
        { input: '[2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
        { input: '[3, 2, 4], target = 6', expectedOutput: '[1, 2]' },
        { input: '[3, 3], target = 6', expectedOutput: '[0, 1]' },
      ],
      explanation: 'Use a hash map to achieve O(n) time complexity by storing seen values and their indices. For each number, check if its complement (target - num) exists in the map.',
      companyTags: ['Google', 'Microsoft', 'Amazon', 'Swiggy', 'Zomato'],
    },
  ],
  practiceSubmissions: [],
  skillGaps: [
    {
      id: 'sg_01',
      skillName: 'Data Structures & Algorithms',
      category: 'Core CS',
      importance: 'Essential',
      userProficiency: 'Intermediate',
      status: 'in-progress',
      verifiedEvidenceCount: 2,
      evidenceLabels: ['Solved 60+ LeetCode problems', 'CS201 Data Structures Grade A'],
      recommendedRoadmapAction: 'Complete Trees & Dynamic Programming milestone in Roadmap',
      relevanceRationale: 'Mandatory technical filter in 95% of software engineering screening rounds across Indian product & campus recruiters.',
    },
    {
      id: 'sg_02',
      skillName: 'React 19 & TypeScript',
      category: 'Frontend',
      importance: 'Essential',
      userProficiency: 'Advanced',
      status: 'verified',
      verifiedEvidenceCount: 3,
      evidenceLabels: ['JobHub Pro Full Stack App', 'Component Library on GitHub', 'TypeScript Certified'],
      recommendedRoadmapAction: 'Explore Next.js Server Components and advanced performance profiling',
      relevanceRationale: 'Primary front-end stack requested in 80% of modern full-stack job listings.',
    },
    {
      id: 'sg_03',
      skillName: 'Spring Boot / Node.js Microservices',
      category: 'Backend',
      importance: 'Essential',
      userProficiency: 'Intermediate',
      status: 'verified',
      verifiedEvidenceCount: 2,
      evidenceLabels: ['REST API Server in JobHub Pro', 'Payment Gateway Integration Project'],
      recommendedRoadmapAction: 'Implement message queues (RabbitMQ/Kafka) for asynchronous task processing',
      relevanceRationale: 'High-throughput enterprise service development standard in financial and tech hubs.',
    },
    {
      id: 'sg_04',
      skillName: 'SQL & Database Optimization',
      category: 'Database',
      importance: 'Essential',
      userProficiency: 'Intermediate',
      status: 'verified',
      verifiedEvidenceCount: 1,
      evidenceLabels: ['Relational Schema Design in PostgreSQL'],
      recommendedRoadmapAction: 'Practice indexing strategies and window functions in Coding Lab',
      relevanceRationale: 'Crucial for passing machine-coding rounds and backend architecture assessments.',
    },
    {
      id: 'sg_05',
      skillName: 'Docker & Kubernetes',
      category: 'DevOps & Cloud',
      importance: 'Preferred',
      userProficiency: 'Beginner',
      status: 'gap',
      verifiedEvidenceCount: 0,
      evidenceLabels: [],
      recommendedRoadmapAction: 'Complete containerization project in Week 4 Roadmap',
      relevanceRationale: 'Differentiates entry-level applicants by proving production readiness and deployment knowledge.',
    },
    {
      id: 'sg_06',
      skillName: 'Quantitative & Logical Aptitude',
      category: 'Aptitude & Soft Skills',
      importance: 'Essential',
      userProficiency: 'Intermediate',
      status: 'in-progress',
      verifiedEvidenceCount: 1,
      evidenceLabels: ['Passed TCS NQT Mock Test'],
      recommendedRoadmapAction: 'Practice 20 speed math questions daily in Coding & Aptitude Lab',
      relevanceRationale: 'First-round elimination hurdle in Indian campus placements and MNC recruitment drives.',
    },
  ],
  companyPacks: [
    {
      id: 'cp_01',
      companyName: 'Tata Consultancy Services (TCS Digital & Prime)',
      industry: 'IT Services & Consulting',
      headquarters: 'Mumbai, India',
      indianOffices: ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Delhi NCR'],
      overview: 'Largest Indian IT services conglomerate. TCS Digital and Prime hiring tracks target freshers and early engineers with higher CTC bands (₹7 LPA - ₹11 LPA) based on rigorous coding and cognitive tests.',
      hiringProcessRounds: [
        {
          roundNumber: 1,
          roundName: 'TCS NQT (National Qualifier Test)',
          focusAreas: ['Advanced Quantitative Aptitude', 'Reasoning Ability', 'Verbal Ability', '2 Coding Questions (Medium)'],
          tips: 'Time management is key. Tackle easy aptitude questions first; avoid spending more than 90 seconds on a single quant question.',
        },
        {
          roundNumber: 2,
          roundName: 'Technical Interview',
          focusAreas: ['Core CS Fundamentals (OOPs, DBMS, OS, Networks)', 'Resume Projects Walkthrough', 'Live Code Debugging'],
          tips: 'Be prepared to explain database normal forms, ACID properties, and how your project handles concurrent users.',
        },
        {
          roundNumber: 3,
          roundName: 'Managerial & HR Round',
          focusAreas: ['Situational Judgment', 'Willingness to Relocate', 'Communication & Teamwork'],
          tips: 'Use the STAR method for behavioral questions. Express flexibility with technology stacks and office locations.',
        },
      ],
      likelyTechnicalQuestions: [
        'Explain the difference between process and thread, and how multithreading is handled in Node.js / Java.',
        'What are ACID properties in DBMS? How does an isolation level prevent dirty reads?',
        'Write an algorithm to detect a cycle in a linked list using Floyd’s Cycle-Finding Algorithm.',
        'Explain REST API idempotency and why GET, PUT, and DELETE are idempotent while POST is not.',
      ],
      likelyBehavioralQuestions: [
        'Tell me about a complex bug you resolved during your final year engineering capstone project.',
        'How do you stay updated with emerging technologies while handling multiple deadlines?',
      ],
      questionsToAskInterviewer: [
        'Which business unit or practice area does the TCS Digital fresh talent intake primarily align with this year?',
        'What training and certifications are supported during the initial induction program at TCS?',
      ],
      prepChecklist: [
        { task: 'Revise OOPs concepts (Polymorphism, Inheritance, Encapsulation, Abstraction)', done: true },
        { task: 'Practice 5 LeetCode Medium matrix & string questions', done: true },
        { task: 'Prepare 3-minute elevator pitch on primary resume project', done: false },
        { task: 'Review TCS recent quarterly performance and AI initiatives', done: false },
      ],
      sourceReference: 'Public recruitment disclosures, candidate experiences & placement cell reports',
      updatedAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'cp_02',
      companyName: 'Infosys (Specialist Programmer & DSE)',
      industry: 'Enterprise Software & IT Services',
      headquarters: 'Bengaluru, India',
      indianOffices: ['Bengaluru', 'Pune', 'Hyderabad', 'Bhubaneswar', 'Mysuru (Global Education Center)', 'Chandigarh'],
      overview: 'Global leader in technology consulting. Hiring pathways include Specialist Programmer (₹8 LPA - ₹9.5 LPA) and Digital Specialist Engineer (DSE, ₹6.5 LPA) with deep emphasis on competitive programming and algorithms.',
      hiringProcessRounds: [
        {
          roundNumber: 1,
          roundName: 'HackWithInfy / InfyTQ Online Coding Challenge',
          focusAreas: ['3 Coding Challenges (Arrays, Greedy Algorithms, Dynamic Programming)'],
          tips: 'No aptitude in this track — 100% algorithms and competitive coding. Aim for all test cases including boundary and large constraints.',
        },
        {
          roundNumber: 2,
          roundName: 'Technical & System Architecture Interview',
          focusAreas: ['Data Structures Deep Dive', 'Code Complexity Analysis', 'Database Queries'],
          tips: 'Explain your thought process aloud before writing code. Discuss trade-offs between time and space complexity.',
        },
      ],
      likelyTechnicalQuestions: [
        'Implement Longest Increasing Subsequence (LIS) in O(n log n) using binary search.',
        'Explain the internal working of Java HashMap or JavaScript Map (bucket hashing, collision resolution).',
        'How would you design a rate limiter for an API endpoint handling 10,000 requests per minute?',
      ],
      likelyBehavioralQuestions: [
        'Describe a scenario where you disagreed with a project teammate about technical choices.',
        'What is your experience with agile development methodologies?',
      ],
      questionsToAskInterviewer: [
        'What opportunities exist for fresh engineers to contribute to open-source or proprietary enterprise accelerators at Infosys?',
        'How are project assignments determined following the Mysuru training program?',
      ],
      prepChecklist: [
        { task: 'Master Binary Search on Answer and Dynamic Programming patterns', done: true },
        { task: 'Revise SQL window functions (ROW_NUMBER, DENSE_RANK)', done: false },
      ],
      sourceReference: 'Infosys Careers portal and placement track documentation',
      updatedAt: '2026-10-21T00:00:00.000Z',
    },
  ],
  vaultDocuments: [
    {
      id: 'doc_01',
      userId: 'usr_demo_01',
      name: 'Alex_Morgan_Master_Resume_ATS_v4.pdf',
      category: 'Resume',
      fileSize: '142 KB',
      fileType: 'application/pdf',
      uploadDate: '2026-10-20T10:15:00.000Z',
      verified: true,
      notes: 'Master ATS-optimized resume tailored for SDE-1 and Full-Stack roles.',
    },
    {
      id: 'doc_02',
      userId: 'usr_demo_01',
      name: 'BTech_Computer_Science_Degree_Certificate.pdf',
      category: 'Certificate',
      fileSize: '480 KB',
      fileType: 'application/pdf',
      uploadDate: '2026-09-15T08:30:00.000Z',
      verified: true,
      notes: 'Official university degree certificate with First Class Distinction.',
    },
    {
      id: 'doc_03',
      userId: 'usr_demo_01',
      name: 'AWS_Certified_Cloud_Practitioner_Scorecard.pdf',
      category: 'Certificate',
      fileSize: '210 KB',
      fileType: 'application/pdf',
      uploadDate: '2026-08-10T14:20:00.000Z',
      verified: true,
      notes: 'AWS Credential Validation ID: AWS-CCP-789421.',
    },
    {
      id: 'doc_04',
      userId: 'usr_demo_01',
      name: 'Product_Engineering_Internship_Letter.pdf',
      category: 'Offer Letter',
      fileSize: '320 KB',
      fileType: 'application/pdf',
      uploadDate: '2026-07-01T11:00:00.000Z',
      verified: true,
      notes: '6-month full-stack development internship experience verification letter.',
    },
  ],
  jobOffers: [
    {
      id: 'offer_01',
      userId: 'usr_demo_01',
      companyName: 'Flipkart (Walmart Group)',
      roleTitle: 'Software Development Engineer - 1',
      location: 'Bengaluru, Karnataka',
      workMode: 'Hybrid',
      fixedCtcLpa: 14.5,
      variableCtcLpa: 2.5,
      joiningBonusInr: 150000,
      deductionsEstInrMonthly: 18500, // PF + Professional Tax + TDS estimate
      netMonthlyTakeHomeEstInr: 102330,
      benefits: ['Comprehensive Medical Insurance (₹5 Lakhs)', 'Relocation Allowance ₹50,000', 'Annual Wellness & Learning Budget ₹30,000', 'Free Food & Commute Shuttle'],
      growthScore: 9,
      cultureScore: 8,
      decisionStatus: 'considering',
      notes: 'High-scale e-commerce logistics platform team. Excellent technical mentorship and brand value.',
    },
    {
      id: 'offer_02',
      userId: 'usr_demo_01',
      companyName: 'TCS Digital',
      roleTitle: 'Systems Engineer (Digital Track)',
      location: 'Hyderabad, Telangana',
      workMode: 'On-site',
      fixedCtcLpa: 8.2,
      variableCtcLpa: 0.8,
      joiningBonusInr: 50000,
      deductionsEstInrMonthly: 9800,
      netMonthlyTakeHomeEstInr: 58500,
      benefits: ['Health Insurance Coverage for Family', 'Higher Education Sponsorship Option', 'Stable Work-Life Balance', 'Provident Fund & Gratuity'],
      growthScore: 7,
      cultureScore: 8,
      decisionStatus: 'considering',
      notes: 'Cloud migration enterprise team. High stability and predictable promotion cycles.',
    },
  ],
  networkingContacts: [
    {
      id: 'net_01',
      userId: 'usr_demo_01',
      name: 'Rohan Sharma',
      company: 'Amazon India',
      role: 'SDE-2 (AWS Cloud Search)',
      relationship: 'Alumni',
      linkedinUrl: 'https://linkedin.com/in/rohansharma-demo',
      email: 'rohan.sharma.alumni@example.com',
      referralStatus: 'referred',
      lastFollowUp: '2026-10-18',
      nextFollowUpDue: '2026-10-25',
      notes: 'College senior from 2023 batch. Kindly submitted internal employee referral for SDE-1 position in Hyderabad.',
      aiDraftedOutreach: 'Hi Rohan bhaiya, thank you so much for taking the time to review my resume! I wanted to share that my application for SDE-1 has been officially submitted through your referral link (Ref ID: AMZ-IN-88912). I am actively revising Trees, Graphs, and System Design fundamentals.',
      createdAt: '2026-10-10T00:00:00.000Z',
    },
    {
      id: 'net_02',
      userId: 'usr_demo_01',
      name: 'Pooja Iyer',
      company: 'Swiggy',
      role: 'Technical Talent Acquisition Lead',
      relationship: 'Recruiter',
      linkedinUrl: 'https://linkedin.com/in/poojaiyer-recruiter',
      referralStatus: 'reached-out',
      lastFollowUp: '2026-10-19',
      nextFollowUpDue: '2026-10-26',
      notes: 'Connected via LinkedIn following her post regarding early-career backend engineering openings.',
      aiDraftedOutreach: 'Hi Pooja, hope you are having a productive week! I noticed Swiggy is expanding its Supply Chain platform engineering team in Bengaluru. Having built scalable TypeScript/Node.js REST services handling high concurrency, I would love to be considered for the SDE-1 opening.',
      createdAt: '2026-10-15T00:00:00.000Z',
    },
  ],
  weeklyReports: [
    {
      id: 'rep_01',
      userId: 'usr_demo_01',
      reportingPeriod: 'October 14 – October 21, 2026',
      applicationsSubmittedCount: 4,
      interviewsAttendedCount: 1,
      roadmapTasksCompletedCount: 5,
      skillsPracticedCount: 12,
      topStrengths: [
        'Strong technical performance in Data Structures and Two-Pointer challenges',
        'Consistently high ATS match scores averaging 88% across target applications',
        'Completed comprehensive Google Drive document synchronization',
      ],
      currentBlockers: [
        'Need more practice on complex SQL Window Functions and Dynamic Programming',
        '2 application follow-ups are due this week for Amazon and Swiggy referrals',
      ],
      strategicActionItems: [
        'Complete the Trees & Graph traversal tasks in Week 3 of your Career Roadmap',
        'Send polite referral follow-up messages using the AI-drafted outreach templates',
        'Conduct a 45-minute mock technical interview in Interview Coach before Friday',
      ],
      motivationalSummary: 'Great momentum this week! Your application velocity and technical practice are directly positioning you in the top quartile of entry-level engineering applicants. Keep consistent with your daily problem-solving routine.',
      generatedAt: '2026-10-21T18:00:00.000Z',
    },
  ],
  achievements: [
    {
      id: 'ach_01',
      userId: 'usr_demo_01',
      title: 'Smart India Hackathon Finalist — Real-Time Logistics Tracking',
      category: 'Hackathon',
      issuerOrOrg: 'Ministry of Education & AICTE, Govt. of India',
      issueDate: '2025-11-20',
      skillsDemonstrated: ['React', 'Node.js', 'WebSockets', 'PostgreSQL', 'Google Maps API'],
      projectOrCredentialLink: 'https://github.com/alexmorgan-code/smart-logistics',
      metricsResult: 'Built prototype within 36 hours selected among top 5 teams out of 450+ participating colleges nationwide.',
      suggestedResumeBullet: 'Co-developed real-time freight tracking prototype utilizing WebSockets and PostgreSQL, ranking in top 1% of 450+ collegiate teams at Smart India Hackathon.',
      verified: true,
    },
    {
      id: 'ach_02',
      userId: 'usr_demo_01',
      title: 'AWS Certified Cloud Practitioner (CLF-C02)',
      category: 'Certification',
      issuerOrOrg: 'Amazon Web Services',
      issueDate: '2026-03-12',
      skillsDemonstrated: ['AWS Cloud', 'IAM Security', 'S3 & CloudFront', 'EC2 & Lambda'],
      projectOrCredentialLink: 'https://aws.amazon.com/verification',
      metricsResult: 'Scored 880/1000 demonstrating strong grasp of cloud architecture and security principles.',
      suggestedResumeBullet: 'Earned AWS Certified Cloud Practitioner credential (Score: 880/1000), verifying competence in IAM policies, VPC networking, and serverless compute.',
      verified: true,
    },
  ],
};

class CareerSuiteDatabase {
  private data: CareerSuiteDatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): CareerSuiteDatabaseSchema {
    try {
      if (fs.existsSync(CAREER_DB_FILE)) {
        const raw = fs.readFileSync(CAREER_DB_FILE, 'utf-8');
        return { ...initialCareerSeed, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to parse career_suite_db.json, seeding defaults:', e);
    }
    const seed = JSON.parse(JSON.stringify(initialCareerSeed));
    this.saveData(seed);
    return seed;
  }

  private saveData(data: CareerSuiteDatabaseSchema) {
    try {
      fs.writeFileSync(CAREER_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write career_suite_db.json:', e);
    }
  }

  // Roadmaps
  getRoadmaps(userId: string): CareerRoadmap[] {
    return this.data.roadmaps.filter((r) => r.userId === userId || r.userId === 'usr_demo_01');
  }

  getRoadmapById(id: string): CareerRoadmap | undefined {
    return this.data.roadmaps.find((r) => r.id === id);
  }

  saveRoadmap(roadmap: CareerRoadmap): CareerRoadmap {
    const idx = this.data.roadmaps.findIndex((r) => r.id === roadmap.id);
    if (idx >= 0) {
      this.data.roadmaps[idx] = roadmap;
    } else {
      this.data.roadmaps.push(roadmap);
    }
    this.saveData(this.data);
    return roadmap;
  }

  toggleRoadmapTask(roadmapId: string, taskId: string): CareerRoadmap | undefined {
    const roadmap = this.getRoadmapById(roadmapId);
    if (!roadmap) return undefined;

    let totalTasks = 0;
    let completedTasks = 0;

    roadmap.milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        if (t.id === taskId) {
          t.completed = !t.completed;
        }
        totalTasks++;
        if (t.completed) completedTasks++;
      });
      m.completed = m.tasks.every((t) => t.completed);
    });

    roadmap.overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    roadmap.updatedAt = new Date().toISOString();
    return this.saveRoadmap(roadmap);
  }

  // Aptitude & Coding
  getAptitudeQuestions(category?: string, difficulty?: string): AptitudeQuestionItem[] {
    let list = this.data.aptitudeQuestions;
    if (category && category !== 'all') {
      list = list.filter((q) => q.category === category);
    }
    if (difficulty && difficulty !== 'all') {
      list = list.filter((q) => q.difficulty === difficulty);
    }
    return list;
  }

  submitPracticeAnswer(submission: Omit<PracticeSubmission, 'id' | 'submittedAt'>): PracticeSubmission {
    const newSub: PracticeSubmission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toISOString(),
    };
    this.data.practiceSubmissions.unshift(newSub);
    this.saveData(this.data);
    return newSub;
  }

  getPracticeSubmissions(userId: string): PracticeSubmission[] {
    return this.data.practiceSubmissions.filter((s) => s.userId === userId || s.userId === 'usr_demo_01');
  }

  // Skill Gaps
  getSkillGaps(): SkillGapNode[] {
    return this.data.skillGaps;
  }

  updateSkillProficiency(skillId: string, proficiency: SkillGapNode['userProficiency']): SkillGapNode | undefined {
    const skill = this.data.skillGaps.find((s) => s.id === skillId);
    if (skill) {
      skill.userProficiency = proficiency;
      skill.status = proficiency === 'Advanced' || proficiency === 'Expert' ? 'verified' : proficiency === 'None' ? 'gap' : 'in-progress';
      this.saveData(this.data);
    }
    return skill;
  }

  // Company Packs
  getCompanyPacks(): CompanyResearchPack[] {
    return this.data.companyPacks;
  }

  getCompanyPackByName(companyName: string): CompanyResearchPack | undefined {
    return this.data.companyPacks.find((c) => c.companyName.toLowerCase().includes(companyName.toLowerCase()));
  }

  toggleCompanyChecklist(packId: string, taskText: string): CompanyResearchPack | undefined {
    const pack = this.data.companyPacks.find((p) => p.id === packId);
    if (pack) {
      const item = pack.prepChecklist.find((i) => i.task === taskText);
      if (item) {
        item.done = !item.done;
        pack.updatedAt = new Date().toISOString();
        this.saveData(this.data);
      }
    }
    return pack;
  }

  // Career Document Vault
  getVaultDocuments(userId: string): CareerVaultDocument[] {
    return this.data.vaultDocuments.filter((d) => d.userId === userId || d.userId === 'usr_demo_01');
  }

  addVaultDocument(doc: Omit<CareerVaultDocument, 'id' | 'uploadDate'>): CareerVaultDocument {
    const newDoc: CareerVaultDocument = {
      ...doc,
      id: `vlt_${Date.now()}`,
      uploadDate: new Date().toISOString(),
    };
    this.data.vaultDocuments.unshift(newDoc);
    this.saveData(this.data);
    return newDoc;
  }

  deleteVaultDocument(id: string): boolean {
    const idx = this.data.vaultDocuments.findIndex((d) => d.id === id);
    if (idx >= 0) {
      this.data.vaultDocuments.splice(idx, 1);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Job Offers
  getJobOffers(userId: string): OfferComparisonItem[] {
    return this.data.jobOffers.filter((o) => o.userId === userId || o.userId === 'usr_demo_01');
  }

  saveJobOffer(offer: Omit<OfferComparisonItem, 'id'> & { id?: string }): OfferComparisonItem {
    const monthlyGross = (offer.fixedCtcLpa * 100000) / 12;
    const netTakeHome = Math.max(0, Math.round(monthlyGross - offer.deductionsEstInrMonthly));

    if (offer.id) {
      const idx = this.data.jobOffers.findIndex((o) => o.id === offer.id);
      if (idx >= 0) {
        this.data.jobOffers[idx] = { ...offer, id: offer.id, netMonthlyTakeHomeEstInr: netTakeHome };
        this.saveData(this.data);
        return this.data.jobOffers[idx];
      }
    }

    const created: OfferComparisonItem = {
      ...offer,
      id: `off_${Date.now()}`,
      netMonthlyTakeHomeEstInr: netTakeHome,
    };
    this.data.jobOffers.push(created);
    this.saveData(this.data);
    return created;
  }

  // Networking
  getNetworkingContacts(userId: string): NetworkingContact[] {
    return this.data.networkingContacts.filter((n) => n.userId === userId || n.userId === 'usr_demo_01');
  }

  saveNetworkingContact(contact: Omit<NetworkingContact, 'id' | 'createdAt'> & { id?: string }): NetworkingContact {
    if (contact.id) {
      const idx = this.data.networkingContacts.findIndex((c) => c.id === contact.id);
      if (idx >= 0) {
        this.data.networkingContacts[idx] = {
          ...this.data.networkingContacts[idx],
          ...contact,
        };
        this.saveData(this.data);
        return this.data.networkingContacts[idx];
      }
    }
    const created: NetworkingContact = {
      ...contact,
      id: `net_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.networkingContacts.unshift(created);
    this.saveData(this.data);
    return created;
  }

  // Weekly Reports
  getWeeklyReports(userId: string): WeeklyCareerReport[] {
    return this.data.weeklyReports.filter((r) => r.userId === userId || r.userId === 'usr_demo_01');
  }

  generateWeeklyReport(userId: string): WeeklyCareerReport {
    const jobs = coreDb.getJobs(userId);
    const submissions = this.getPracticeSubmissions(userId);
    const roadmaps = this.getRoadmaps(userId);

    const activeRoadmap = roadmaps[0];
    const completedRoadmapTasks = activeRoadmap
      ? activeRoadmap.milestones.flatMap((m) => m.tasks).filter((t) => t.completed).length
      : 0;

    const report: WeeklyCareerReport = {
      id: `rep_${Date.now()}`,
      userId,
      reportingPeriod: `Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      applicationsSubmittedCount: jobs.filter((j) => j.status === 'applied' || j.status === 'interviewing').length,
      interviewsAttendedCount: jobs.filter((j) => j.status === 'interviewing' || j.status === 'offer').length,
      roadmapTasksCompletedCount: completedRoadmapTasks,
      skillsPracticedCount: submissions.length > 0 ? submissions.length : 8,
      topStrengths: [
        'Demonstrated high consistency in technical practice and problem solving',
        'Strong alignment with target role requirements in SDE-1 and Full Stack profiles',
        'Active follow-up discipline on existing applications',
      ],
      currentBlockers: [
        'Need to schedule final round mock interview for active applications',
        'Practice time allocation can be increased on Quantitative Aptitude speed math',
      ],
      strategicActionItems: [
        'Complete remaining tasks in current roadmap milestone',
        'Reach out to 2 alumni contacts for referral follow-ups',
        'Review company interview pack for upcoming interview rounds',
      ],
      motivationalSummary: 'Solid execution across technical practice and application pipeline. Keep up the steady cadence!',
      generatedAt: new Date().toISOString(),
    };

    this.data.weeklyReports.unshift(report);
    this.saveData(this.data);
    return report;
  }

  // Achievements
  getAchievements(userId: string): CareerAchievement[] {
    return this.data.achievements.filter((a) => a.userId === userId || a.userId === 'usr_demo_01');
  }

  saveAchievement(ach: Omit<CareerAchievement, 'id'> & { id?: string }): CareerAchievement {
    if (ach.id) {
      const idx = this.data.achievements.findIndex((a) => a.id === ach.id);
      if (idx >= 0) {
        this.data.achievements[idx] = { ...this.data.achievements[idx], ...ach };
        this.saveData(this.data);
        return this.data.achievements[idx];
      }
    }
    const created: CareerAchievement = {
      ...ach,
      id: `ach_${Date.now()}`,
    };
    this.data.achievements.unshift(created);
    this.saveData(this.data);
    return created;
  }

  // 1. AI Job Match Engine Calculation
  calculateJobMatches(userId: string, resumeId?: string): JobMatchResult[] {
    const jobs = coreDb.getJobs(userId);
    const resumes = coreDb.getResumes(userId);
    const primaryResume = resumes.find((r) => (resumeId ? r.id === resumeId : r.isPrimary)) || resumes[0];

    const resumeSkills = new Set(
      (primaryResume?.skills || []).flatMap((c) => c.skills.map((s) => s.toLowerCase()))
    );

    return jobs.map((job) => {
      const jobSkills = job.keySkills || [];
      const matched = jobSkills.filter((s) => resumeSkills.has(s.toLowerCase()));
      const missing = jobSkills.filter((s) => !resumeSkills.has(s.toLowerCase()));

      const skillsMatchPct = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 75;
      const experienceMatchPct = primaryResume && primaryResume.experiences.length > 0 ? 85 : 60;
      const educationMatchPct = primaryResume && primaryResume.educations.length > 0 ? 90 : 70;

      const weightedScore = Math.round(skillsMatchPct * 0.5 + experienceMatchPct * 0.3 + educationMatchPct * 0.2);

      const eligibilityGaps: string[] = [];
      if (missing.length > 0) {
        eligibilityGaps.push(`Missing keywords: ${missing.slice(0, 3).join(', ')}`);
      }
      if (job.title.toLowerCase().includes('senior') && primaryResume?.experiences.length < 3) {
        eligibilityGaps.push('Role targets Senior level; candidate profile displays entry/intermediate experience density.');
      }

      return {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        workMode: job.employmentType === 'Remote' ? 'Remote' : job.employmentType === 'Hybrid' ? 'Hybrid' : 'On-site',
        experienceRequired: job.title.includes('Senior') ? '3-5 years' : '0-2 years (Freshers & College Graduates eligible)',
        salaryText: job.salaryRange || 'Competitive Industry Standard',
        matchScore: weightedScore,
        matchingSkills: matched,
        missingSkills: missing,
        requiredQualifications: [
          'B.Tech / B.E. / BCA / MCA / M.Tech in Computer Science or related engineering field',
          'Proficiency in modern programming languages and data structures',
        ],
        eligibilityGaps,
        relevanceExplanation: `Candidate matches ${matched.length} out of ${jobSkills.length} core job competencies. Strong alignment with ${primaryResume?.targetRoles?.[0] || 'engineering'} track.`,
        calculationBreakdown: {
          skillsMatchPct,
          experienceMatchPct,
          educationMatchPct,
        },
        isVerifiedJob: true,
        statusInTracker: job.status,
      };
    });
  }
}

export const careerDb = new CareerSuiteDatabase();
