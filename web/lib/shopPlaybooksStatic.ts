// Hard-coded shop playbooks from the static playbooks.html page.
// These are merged with DB shop playbooks so the static marketing content
// is always rendered even when the database has not been seeded yet.

export interface StaticShopPlaybook {
  slug: string;
  title: string;
  category: "interview" | "case";
  tag: string;
  meta: string;
  rating: number;
  price: number;
  intro: string;
  bullets: string[];
  note?: string;
}

export const SHOP_PLAYBOOKS: StaticShopPlaybook[] = [
  {
    slug: "marketing",
    title: "Marketing",
    category: "interview",
    tag: "Interview",
    meta: "42 topics · 120+ Qs",
    rating: 4.7,
    price: 499,
    intro:
      "Revise how brands understand customers, create value, communicate effectively, and drive sustainable business growth.",
    bullets: [
      "Marketing fundamentals, consumer behaviour, segmentation, targeting, positioning, branding and the marketing mix",
      "Digital marketing, SEO, social media, influencer marketing, promotions and channel strategies",
      "Practical concepts and frameworks commonly discussed in marketing, brand and growth interviews",
    ],
  },
  {
    slug: "sales",
    title: "Sales",
    category: "interview",
    tag: "Interview",
    meta: "38 topics · 110+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Understand how businesses identify prospects, convert opportunities, manage relationships, and build repeatable revenue.",
    bullets: [
      "Sales funnels, customer buying stages, lead nurturing and conversion fundamentals",
      "CRM, customer relationships, sales planning and post-purchase engagement",
      "Practical preparation for sales, business development and revenue-focused interview questions",
    ],
    note: "Covers the customer journey from awareness and interest through purchase and loyalty, along with funnel-building activities.",
  },
  {
    slug: "statistics",
    title: "Statistics",
    category: "interview",
    tag: "Interview",
    meta: "30 topics · 90+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Build the statistical foundation needed to interpret data, explain results, and answer analytical interview questions.",
    bullets: [
      "Mean, median, mode, variance, standard deviation and frequency distributions",
      "Probability, sampling methods, distributions and statistical reasoning",
      "Clear explanations of formulas and concepts used in analytics, research and business interviews",
    ],
    note: "Begins with descriptive statistics and measures of central tendency and variability before progressing to probability and sampling.",
  },
  {
    slug: "finance",
    title: "Finance",
    category: "interview",
    tag: "Interview",
    meta: "48 topics · 150+ Qs",
    rating: 4.8,
    price: 499,
    intro:
      "Revise the essential financial concepts used to understand performance, evaluate decisions, and discuss business value.",
    bullets: [
      "Balance sheets, income statements, cash-flow statements and financial performance",
      "Time value of money, discounting, compounding and investment decisions",
      "Financial ratios covering liquidity, solvency, profitability and operational efficiency",
    ],
    note: "Covers the principal financial statements and their role in assessing a company's financial health.",
  },
  {
    slug: "analytics",
    title: "Analytics",
    category: "interview",
    tag: "Interview",
    meta: "40 topics · 120+ Qs",
    rating: 4.7,
    price: 499,
    intro:
      "Learn how raw data becomes meaningful insight, business recommendations, and better management decisions.",
    bullets: [
      "Data collection, cleaning, transformation, analysis, interpretation and visualisation",
      "Descriptive, diagnostic, predictive and prescriptive analytics",
      "Regression, cohort, factor, time-series and other widely used analytical techniques",
    ],
    note: "Follows the complete analysis process and explains how results become actionable business insights.",
  },
  {
    slug: "economics",
    title: "Economics",
    category: "interview",
    tag: "Interview",
    meta: "34 topics · 95+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Understand how markets, government decisions and economic forces influence businesses, customers and prices.",
    bullets: [
      "Supply, demand, equilibrium, elasticity and the factors influencing market prices",
      "Capitalist, socialist and mixed economies, along with major economic sectors",
      "Fiscal policy, monetary policy, inflation, trade and macroeconomic decision-making",
    ],
    note: "Begins with supply and demand and explains how these forces shape prices and market conditions.",
  },
  {
    slug: "supply-chain",
    title: "Supply Chain",
    category: "interview",
    tag: "Interview",
    meta: "32 topics · 85+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Revise how organisations plan, source, produce, move and manage goods efficiently from supplier to customer.",
    bullets: [
      "Planning, sourcing, manufacturing, delivery, returns and supply-chain models",
      "Inventory management, EOQ, reorder points, ABC analysis, JIT and MRP",
      "Quality, sustainability, global supply chains and data-driven inventory decisions",
    ],
    note: "Covers the complete supply-chain journey and major approaches to inventory optimisation.",
  },
  {
    slug: "market-research",
    title: "Market Research",
    category: "interview",
    tag: "Interview",
    meta: "28 topics · 80+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Learn how businesses understand customers, evaluate markets, analyse competitors and make evidence-based decisions.",
    bullets: [
      "Primary and secondary research, surveys, qualitative and quantitative methods",
      "Market segmentation, customer insights, competitor analysis and emerging trends",
      "Practical use of behavioural data, feedback, social media, website data and market evidence",
    ],
    note: "Covers research design, segmentation, competitive analysis and the interpretation of market information.",
  },
  {
    slug: "consulting",
    title: "Consulting",
    category: "interview",
    tag: "Interview",
    meta: "36 topics · 100+ Qs",
    rating: 4.7,
    price: 499,
    intro:
      "Build the business knowledge, structured thinking and communication foundation expected in consulting-oriented roles.",
    bullets: [
      "Types of consulting, career paths, consultant responsibilities and essential professional skills",
      "PESTEL, Porter's Five Forces, McKinsey 7S and process-improvement frameworks",
      "Client management, communication, problem-solving and emerging consulting trends",
    ],
    note: "Includes competitive-analysis and organisational frameworks such as Porter's Five Forces and McKinsey 7S.",
  },
  {
    slug: "strategy",
    title: "Strategy",
    category: "interview",
    tag: "Interview",
    meta: "36 topics · 100+ Qs",
    rating: 4.7,
    price: 499,
    intro:
      "Understand how organisations choose where to compete, create advantage and prepare for long-term growth.",
    bullets: [
      "Strategic-thinking fundamentals, vision, planning, risk evaluation and decision-making",
      "SWOT and other frameworks used to assess businesses, markets and opportunities",
      "Competition, growth, adaptability and the development of practical strategic recommendations",
    ],
    note: "Presents strategic thinking as the combination of observation, planning, problem-solving and adaptability.",
  },
  {
    slug: "product-management",
    title: "Product Management",
    category: "interview",
    tag: "Interview",
    meta: "40 topics · 110+ Qs",
    rating: 4.7,
    price: 499,
    intro:
      "Learn how products move from customer problem and initial idea to launch, adoption and continuous improvement.",
    bullets: [
      "Product strategy, customer needs, competition, market fit and profitability",
      "Ideation, validation, prototyping, MVP development, launch and product improvement",
      "Personas, roadmaps, KPIs, OKRs, product analytics and cross-functional collaboration",
    ],
    note: "Follows the product journey from idea development through validation, prototyping, release and iteration.",
  },
  {
    slug: "project-management",
    title: "Project Management",
    category: "interview",
    tag: "Interview",
    meta: "30 topics · 85+ Qs",
    rating: 4.6,
    price: 499,
    intro:
      "Revise how projects are planned, delivered, monitored and protected against delays, risks and execution failures.",
    bullets: [
      "Project planning, scope, scheduling, stakeholders, resources and delivery fundamentals",
      "Risk identification, impact assessment, mitigation planning and continuous monitoring",
      "Risk avoidance, reduction, transfer and acceptance strategies with practical applications",
    ],
    note: "Explains the complete risk-management process, from identification through mitigation and monitoring.",
  },
  {
    slug: "guesstimates",
    title: "Guesstimates",
    category: "case",
    tag: "Case",
    meta: "25 questions · 60+ examples",
    rating: 4.6,
    price: 399,
    intro:
      "Practise breaking unfamiliar estimation questions into logical assumptions, manageable calculations and defensible answers.",
    bullets: [
      "Population, demand, revenue, capacity, consumption and market-sizing problems",
      "Assumption building, segmentation, rounding, sanity checks and structured calculations",
      "Complete worked approaches showing how to communicate reasoning, not merely the final number",
    ],
    note: "Emphasises logical assumptions, simplified calculations and explaining the approach clearly to the interviewer.",
  },
  {
    slug: "market-entry",
    title: "Market Entry",
    category: "case",
    tag: "Case",
    meta: "12 case studies",
    rating: 4.6,
    price: 499,
    intro:
      "Learn how to decide whether a company should enter a new market and how it should proceed.",
    bullets: [
      "Market attractiveness, customers, competition, company capabilities and product fit",
      "Market sizing, expected profitability, barriers to entry and operational feasibility",
      "Entry choices including organic expansion, acquisition, partnership and joint ventures",
    ],
    note: "Teaches students to evaluate opportunity, viability and feasibility before recommending an entry strategy.",
  },
  {
    slug: "pricing",
    title: "Pricing",
    category: "case",
    tag: "Case",
    meta: "10 case studies",
    rating: 4.7,
    price: 499,
    intro:
      "Practise determining what a product or service should cost using commercial logic and customer value.",
    bullets: [
      "Cost-based, competitor-based and value-based pricing approaches",
      "Fixed and variable costs, R&D recovery, margins, elasticity and willingness to pay",
      "Final recommendations supported by calculations, risks, considerations and next steps",
    ],
    note: "Compares multiple pricing approaches and connects costs, competition and perceived customer value.",
  },
];

export const SHOP_COVERS = [
  "linear-gradient(150deg,#2E6BFF,#1D4ED8)",
  "linear-gradient(150deg,#0B1F3A,#16345C)",
  "linear-gradient(150deg,#1D4ED8,#1740A8)",
  "linear-gradient(150deg,#5B8CFF,#2E6BFF)",
  "linear-gradient(150deg,#16345C,#0B1F3A)",
  "linear-gradient(150deg,#2E6BFF,#5B8CFF)",
];
