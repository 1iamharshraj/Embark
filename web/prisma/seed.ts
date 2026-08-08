import { prisma } from "../lib/prisma";
import { hash } from "../lib/auth";

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function iso(date: Date): string {
  return date.toISOString();
}

const streamPlaybooks = [
  {
    slug: "general-management",
    name: "General Management",
    theme: "dark",
    tagline: "The generalist route: run businesses, not functions.",
    oneLiner:
      "For people who want the whole P&L one day — leadership programmes, strategy roles, and the long game to business head.",
    forYouIf: [
      "You enjoy connecting dots across functions more than going deep in one",
      "You want leadership-programme routes (TAS, ABG, Mahindra GMC) or strategy roles",
      "You can live with slower early salary growth for faster later responsibility",
    ],
    study: [
      "Strategy",
      "Organisational behaviour",
      "Corporate finance",
      "Operations",
      "Marketing management",
      "Negotiation",
      "Business law",
      "Leadership practicum",
    ],
    roles: [
      {
        role: "Leadership programme associate",
        desc: "Rotations across functions and geographies in conglomerates — the classic GM track.",
        arc: "Rotations → business analyst → chief of staff → P&L owner",
      },
      {
        role: "Strategy / founder's office",
        desc: "Close to the CEO agenda in startups and mid-size firms; broad exposure, high ambiguity.",
        arc: "Associate → strategy manager → business head",
      },
      {
        role: "Management consultant (generalist)",
        desc: "Problem-solving across industries; a common launchpad into GM roles later.",
        arc: "Consultant → engagement manager → industry exit",
      },
    ],
    recruiters: [
      "Tata Administrative Services",
      "Aditya Birla Group",
      "Mahindra GMC",
      "Reliance",
      "RPG Group",
      "ITC",
      "McKinsey & Company",
      "Startups (founder's office)",
    ],
    skills: [
      "Read a P&L and balance sheet without flinching",
      "Structure an ambiguous problem in under five minutes",
      "Run a meeting that ends with owners and dates",
      "Build a one-page business review from raw data",
      "Tell a company's strategy back to it better than its own website",
      "Interview stakeholders and synthesise what they actually said",
      "Present to seniors: one slide, one message, no filler",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Read one annual report a week. Learn Excel properly. Know why you want GM, in one honest sentence — panels ask.",
      },
      {
        phase: "Term 1–2",
        detail:
          "Grades matter for leadership-programme shortlists. Join one committee that runs real budgets, not five that don't.",
      },
      {
        phase: "Summer internship",
        detail:
          "Pick breadth over brand if you must choose — a real project with a measurable outcome beats coffee runs at a famous logo.",
      },
      {
        phase: "Term 3–4",
        detail:
          "Case competitions in strategy and general management; a national final is a resume line recruiters actually check.",
      },
      {
        phase: "Final year",
        detail:
          'Convert your summer or build the story of why not. Practise "walk me through your internship" until it is a two-minute film.',
      },
      {
        phase: "Placements",
        detail:
          "Leadership programmes interview for ownership and composure, not frameworks. Bring three stories where you owned an outcome end to end.",
      },
    ],
    signals: {
      do: [
        "Own one visible campus outcome (fest P&L, committee budget)",
        "Show range: one finance, one ops, one people story",
        "Know two industries deeply enough to discuss margins",
      ],
      dont: [
        'Say "I\'m flexible" when asked what you want — it reads as unprepared',
        "Collect committee titles with no outcomes attached",
        "Ignore academics: LP shortlists often cut on grades first",
      ],
    },
    colleges: [
      "IIM Ahmedabad",
      "IIM Bangalore",
      "IIM Calcutta",
      "XLRI Jamshedpur",
      "FMS Delhi",
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    theme: "orange",
    tagline: "Build brands people choose without thinking.",
    oneLiner:
      "The FMCG brand-management track, plus the newer digital and growth routes — for people who love consumers, distribution and creative judgement with numbers behind it.",
    forYouIf: [
      "You notice why a shampoo shelf is arranged the way it is",
      "You want the brand-manager track (FMCG) or growth roles in consumer tech",
      "You like creative work but want the numbers to have the final word",
    ],
    study: [
      "Consumer behaviour",
      "Brand management",
      "Sales & distribution",
      "Marketing research",
      "Digital marketing",
      "Pricing",
      "Retail & e-commerce",
      "Integrated marketing communication",
    ],
    roles: [
      {
        role: "Sales officer / ASM (FMCG entry)",
        desc: "Everyone's first posting: a territory, a target, and a van. Where marketing careers are actually made.",
        arc: "ASM → brand executive → brand manager → marketing head",
      },
      {
        role: "Brand management",
        desc: "Own a brand's P&L, positioning, media and innovation pipeline.",
        arc: "Brand exec → BM → senior BM → category head",
      },
      {
        role: "Growth / performance marketing",
        desc: "Consumer-tech route: funnels, CAC, retention — marketing with a dashboard.",
        arc: "Growth analyst → growth manager → head of growth",
      },
    ],
    recruiters: [
      "Hindustan Unilever",
      "P&G",
      "ITC",
      "Nestlé",
      "Marico",
      "Dabur",
      "Coca-Cola",
      "Swiggy",
      "Flipkart",
      "Nykaa",
    ],
    skills: [
      "Explain a brand's positioning in one sentence a rickshaw driver would get",
      "Read a Nielsen/Kantar share report and find the story",
      "Design and defend a pricing decision",
      "Run a structured market visit: shelf, shopper, retailer margin",
      "Build a simple media plan and justify the split",
      "A/B test copy and actually change your mind on the data",
      "Present a brand plan in seven slides",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Work retail shelves with your eyes: pick two brands and track everything they do for a month. Start a swipe file.",
      },
      {
        phase: "Term 1–2",
        detail:
          "Marketing club, but more importantly: win one live project with a real company. FMCG shortlists love evidence over enthusiasm.",
      },
      {
        phase: "Summer internship",
        detail:
          "FMCG summer = sales stint. Embrace the territory; the best PPOs go to people who loved the market, not survived it.",
      },
      {
        phase: "Term 3–4",
        detail:
          "Brand-track case competitions (HUL L.I.M.E., P&G CEO Challenge class of contests). One national final changes your shortlists.",
      },
      {
        phase: "Final year",
        detail:
          'Build your brand POV: three brands you\'d fix and how. Panels ask "which campaign did you like recently" — have a real answer.',
      },
      {
        phase: "Placements",
        detail:
          "Marketing interviews test consumer empathy + commercial sense. Every answer should end in shopper, share or margin.",
      },
    ],
    signals: {
      do: [
        "Do the market visit before the interview and mention what you saw",
        'Quantify creative instincts: "this claim, because this insight"',
        "Know distribution — it wins Indian marketing wars",
      ],
      dont: [
        "Confuse liking ads with liking marketing",
        "Dodge the sales stint — it is the credential",
        "Present digital-only knowledge to an FMCG panel",
      ],
    },
    colleges: ["FMS Delhi", "IIM Calcutta", "XLRI Jamshedpur", "SPJIMR Mumbai", "IIM Bangalore"],
  },
  {
    slug: "finance",
    name: "Finance",
    theme: "green",
    tagline: "Where the numbers stop being homework and start being money.",
    oneLiner:
      "Investment banking, corporate finance, markets and fintech — for people who want to be trusted with capital and can defend a valuation at 2 a.m.",
    forYouIf: [
      "Valuation feels like a puzzle, not a chore",
      "You want IB/PE/markets, corporate treasury, or fintech strategy",
      "You can handle front-loaded hours in exchange for front-loaded learning",
    ],
    study: [
      "Corporate finance",
      "Valuation",
      "Financial markets",
      "Derivatives",
      "Financial statement analysis",
      "M&A",
      "Fixed income",
      "Fintech & payments",
    ],
    roles: [
      {
        role: "Investment banking analyst/associate",
        desc: "Deals: pitchbooks, models, diligence. Brutal hours, unmatched compression of learning.",
        arc: "Associate → VP → director / PE exit",
      },
      {
        role: "Corporate finance / treasury",
        desc: "Inside companies: capital allocation, FP&A, investor relations. Saner hours, real influence.",
        arc: "Analyst → FP&A manager → finance controller → CFO track",
      },
      {
        role: "Markets / asset management",
        desc: "Research and portfolio roles; your calls are scored in public every day.",
        arc: "Research associate → analyst → fund manager",
      },
    ],
    recruiters: [
      "Goldman Sachs",
      "J.P. Morgan",
      "Avendus",
      "Kotak Investment Banking",
      "ICICI Bank",
      "HDFC Bank",
      "Axis Capital",
      "Big 4 (deals)",
      "Razorpay",
      "CRED",
    ],
    skills: [
      "Build a three-statement model from scratch",
      "Value a company three ways and explain why the answers differ",
      "Read an annual report's notes — where the bodies are buried",
      "Explain a deal from the news in three minutes",
      "Excel keyboard fluency (no mouse for an hour)",
      "Write a one-page investment memo",
      "Track one sector well enough to have a view",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Accounting basics before day one — finance electives assume it. Start following two sectors and one deal a week.",
      },
      {
        phase: "Term 1–2",
        detail:
          "Grades gate IB shortlists at most campuses. Join the finance club for the network, do the modelling course for the skill.",
      },
      {
        phase: "Summer internship",
        detail:
          'IB summers are won in October: CV points frozen early. If not IB, corporate finance at a serious firm beats "finance-ish" at a brand.',
      },
      {
        phase: "Term 3–4",
        detail:
          "CFA L1 if markets-bound. Stock-pitch and M&A case competitions; one good memo circulates further than you think.",
      },
      {
        phase: "Final year",
        detail:
          'Deal journal: ten deals, one page each, your view included. Panels can smell a memorised DCF from a real one.',
      },
      {
        phase: "Placements",
        detail:
          'Technicals are table stakes; differentiation is judgement. "Would you do this deal?" needs an actual answer with a number.',
      },
    ],
    signals: {
      do: [
        "Have a view on a live deal, with numbers",
        "Know your own CV's every number cold",
        "Show stamina evidence — finance panels look for it",
      ],
      dont: [
        'Say "I like numbers" as your motivation',
        "Fumble accounting basics while claiming IB ambitions",
        "Chase the label: fintech strategy ≠ finance track",
      ],
    },
    colleges: [
      "IIM Ahmedabad",
      "IIM Calcutta",
      "FMS Delhi",
      "SPJIMR Mumbai",
      "IIM Bangalore",
    ],
  },
  {
    slug: "operations-supply-chain",
    name: "Operations & Supply Chain",
    theme: "orange",
    tagline: "The stream that moves atoms, not slides.",
    oneLiner:
      "From quick-commerce dark stores to factory floors — for people who get satisfaction from a process running 4% better than yesterday.",
    forYouIf: [
      "You want measurable, physical outcomes — trucks, SKUs, throughput",
      "E-commerce ops, manufacturing excellence or supply-chain consulting appeal to you",
      "You like being where the business actually happens",
    ],
    study: [
      "Operations management",
      "Supply chain design",
      "Logistics",
      "Lean & six sigma",
      "Procurement",
      "Demand forecasting",
      "Project management",
      "Service operations",
    ],
    roles: [
      {
        role: "E-commerce / quick-commerce ops",
        desc: "Run fulfilment centres, last-mile networks, dark stores. India's fastest-growing ops playground.",
        arc: "Ops manager → city head → regional ops head",
      },
      {
        role: "Supply chain (FMCG / manufacturing)",
        desc: "Plan demand, source materials, move goods; own service levels and cost.",
        arc: "SC analyst → planning manager → supply chain head",
      },
      {
        role: "Ops consulting",
        desc: "Fix other companies' factories and networks; travel-heavy, exposure-rich.",
        arc: "Consultant → manager → ops excellence leader",
      },
    ],
    recruiters: [
      "Amazon",
      "Flipkart",
      "Swiggy",
      "Zepto",
      "Tata Steel",
      "Asian Paints",
      "Maersk",
      "Delhivery",
      "Accenture Ops",
      "Hindustan Unilever (SC)",
    ],
    skills: [
      "Map a process end-to-end and find the bottleneck",
      "Basic queuing and inventory maths without a formula sheet",
      "Read a warehouse: layout, pick paths, idle time",
      "Build a demand forecast and know when to distrust it",
      "Negotiate with a vendor using cost structure, not volume threats",
      'Run a root-cause analysis that survives the third "why"',
      "SQL well enough to pull your own data",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Visit any warehouse or plant you can. Watch how a food-delivery order actually reaches you; write down every handoff.",
      },
      {
        phase: "Term 1–2",
        detail:
          "Ops electives early. Live projects with e-commerce firms are abundant — take one and produce a number (\"reduced X by Y%\").",
      },
      {
        phase: "Summer internship",
        detail:
          "Choose a role with a floor, not just a dashboard. The intern who stood in the FC at 6 a.m. converts.",
      },
      {
        phase: "Term 3–4",
        detail:
          "Six sigma green belt if your college offers it. Supply-chain case competitions (ISCM, company-run challenges).",
      },
      {
        phase: "Final year",
        detail:
          "Build one ops story with baseline → intervention → result. Numbers are the language of this stream.",
      },
      {
        phase: "Placements",
        detail:
          "Panels give guesstimates and process cases. Practise thinking aloud in units: orders, minutes, rupees per shipment.",
      },
    ],
    signals: {
      do: [
        "Speak in metrics: fill rate, TAT, cost per order",
        "Show comfort with fieldwork and odd hours",
        "Bring one process you personally improved, however small",
      ],
      dont: [
        "Treat ops as the fallback stream — panels can tell",
        "Hide from data questions; modern ops is analytical",
        "Confuse supply chain buzzwords with understanding flow",
      ],
    },
    colleges: ["IIM Calcutta", "IIM Indore", "SPJIMR Mumbai", "IIM Bangalore", "XLRI Jamshedpur"],
  },
  {
    slug: "human-resources",
    name: "Human Resources",
    theme: "green",
    tagline: "The people P&L: talent is the hardest supply chain.",
    oneLiner:
      "HR leadership programmes and business-partner roles — for people who can hold both the employee's story and the company's spreadsheet at once.",
    forYouIf: [
      "Organisational problems interest you more than market problems",
      "You want HRLP routes or the HR business partner track",
      "You can be trusted with hard conversations and confidential rooms",
    ],
    study: [
      "Organisational behaviour",
      "Talent management",
      "Compensation & benefits",
      "Labour law & IR",
      "HR analytics",
      "Learning & development",
      "Change management",
      "Performance systems",
    ],
    roles: [
      {
        role: "HR leadership programme",
        desc: "Rotations across talent, C&B, IR and plant HR in large groups — the premium HR entry.",
        arc: "HRLP → HRBP → HR head (unit) → CHRO track",
      },
      {
        role: "HR business partner",
        desc: "Embedded with a business unit; translate business goals into people decisions.",
        arc: "HRBP → senior HRBP → business HR head",
      },
      {
        role: "Specialist (C&B / analytics / L&D)",
        desc: "Go deep in one lever: pay design, people data, capability building.",
        arc: "Analyst → specialist lead → CoE head",
      },
    ],
    recruiters: [
      "Aditya Birla Group",
      "Tata Group",
      "RPG",
      "Unilever",
      "ITC",
      "Deloitte",
      "Accenture",
      "Mahindra",
      "Larsen & Toubro",
      "Amazon",
    ],
    skills: [
      "Read attrition data and find the real reason, not the exit-form reason",
      "Design a simple incentive plan and predict how it will be gamed",
      "Facilitate a discussion between people who disagree",
      "Know the basics of Indian labour law that actually bite",
      "Build an HR dashboard a business head would read",
      "Interview for competence, not confidence",
      "Write a difficult message that is honest and humane",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Read one serious book on organisations (not pop-psych). Talk to two HR professionals about their worst week.",
      },
      {
        phase: "Term 1–2",
        detail:
          "OB and IR courses seriously — HR panels test fundamentals. Take a live project involving real employee data.",
      },
      {
        phase: "Summer internship",
        detail:
          "Prefer a project with a measurable people-outcome (attrition, hiring funnel, engagement) over a shadowing role.",
      },
      {
        phase: "Term 3–4",
        detail:
          "HR case competitions (Tata Steel-a-thon, XLRI events). Learn HR analytics properly — it is the differentiator this decade.",
      },
      {
        phase: "Final year",
        detail:
          "Form views: moonlighting, hybrid work, AI in hiring. Panels ask current-affairs-of-work questions and expect a position.",
      },
      {
        phase: "Placements",
        detail:
          "HR interviews are values-probing and situational. Prepare stories where you balanced person vs organisation and can defend the call.",
      },
    ],
    signals: {
      do: [
        "Bring numbers to a people conversation",
        "Show one experience of handling conflict directly",
        "Know the difference between HR ops, HRBP and CoE roles",
      ],
      dont: [
        'Say "I like people" — the panel has heard it 400 times',
        "Ignore IR/labour law; plant HR is where HRLPs start",
        "Treat HR as the softer option; the good tracks are brutally selective",
      ],
    },
    colleges: ["XLRI Jamshedpur", "TISS Mumbai", "MDI Gurgaon", "IIM Ranchi", "SCMHRD Pune"],
  },
  {
    slug: "business-analytics",
    name: "Business Analytics",
    theme: "dark",
    tagline: "Decisions, with evidence attached.",
    oneLiner:
      "Analytics consulting, product analytics and data-driven strategy — for people who want to sit between the data team and the decision.",
    forYouIf: [
      'You ask "how do we know that?" in every meeting',
      "Analytics consulting, product analytics or data-led strategy roles appeal",
      "You are willing to code a little to be trusted a lot",
    ],
    study: [
      "Statistics & econometrics",
      "Machine learning for managers",
      "SQL & data management",
      "Experimentation / A-B testing",
      "Data visualisation",
      "Product analytics",
      "Forecasting",
      "Decision science",
    ],
    roles: [
      {
        role: "Analytics consultant",
        desc: "Client problems solved with models and storytelling — ZS, Mastercard, AmEx class of firms.",
        arc: "Analyst → engagement lead → analytics practice head",
      },
      {
        role: "Product / growth analyst",
        desc: "Inside consumer tech: metrics, experiments, and the \"should we ship it\" call.",
        arc: "Analyst → senior analyst → analytics manager → head of data",
      },
      {
        role: "Strategy with data (corporate)",
        desc: "FP&A-plus roles where the model is yours and so is the recommendation.",
        arc: "Analyst → insights manager → strategy head",
      },
    ],
    recruiters: [
      "Mastercard",
      "American Express",
      "ZS Associates",
      "Tiger Analytics",
      "Mu Sigma",
      "Flipkart",
      "Swiggy",
      "Walmart Global Tech",
      "EXL",
      "Fractal",
    ],
    skills: [
      "SQL joins and window functions without Googling",
      "Design an A/B test and know what invalidates it",
      "Regression: run it, read it, and say what it does not prove",
      "Turn a messy business question into a measurable one",
      "One chart, one message — visualisation discipline",
      "Python/R enough to clean data and prototype",
      "Explain a model to someone who distrusts models",
    ],
    plan: [
      {
        phase: "Before the MBA",
        detail:
          "Finish a real SQL course and one statistics refresher. Kaggle once, badly — you learn what data cleaning actually is.",
      },
      {
        phase: "Term 1–2",
        detail:
          "Take the quant electives others avoid. Build one public project: a dashboard or analysis of a dataset you care about.",
      },
      {
        phase: "Summer internship",
        detail:
          "Analytics summers test tools on day one. Rehearse SQL before the interview, not after the shortlist.",
      },
      {
        phase: "Term 3–4",
        detail:
          "Analytics case competitions and datathons. Add experimentation depth — most candidates stop at dashboards.",
      },
      {
        phase: "Final year",
        detail:
          "Portfolio over certificates: three analyses with business recommendations beats five course completions.",
      },
      {
        phase: "Placements",
        detail:
          "Expect a case + technical screen. The winning move is translating analysis into a decision, not showing off methods.",
      },
    ],
    signals: {
      do: [
        "Show one end-to-end project: question → data → decision",
        'Say "the data can\'t answer that" when true — it builds trust',
        "Know the business metric behind every technical metric",
      ],
      dont: [
        "List tools you can't interview on",
        "Hide from coding rounds; managers who can't query get filtered",
        "Present correlation with a causal straight face",
      ],
    },
    colleges: ["IIM Calcutta", "IIM Bangalore", "ISB Hyderabad", "IIM Lucknow", "MDI Gurgaon"],
  },
];

const shopPlaybooks = [
  {
    id: "marketing",
    title: "Marketing",
    cat: "interview",
    oneLiner: "42 topics · 120+ Qs",
    rating: 4.7,
    price: 499,
    intro: "Revise how brands understand customers, create value, communicate effectively, and drive sustainable business growth.",
    bullets: [
      "Marketing fundamentals, consumer behaviour, segmentation, targeting, positioning, branding and the marketing mix",
      "Digital marketing, SEO, social media, influencer marketing, promotions and channel strategies",
      "Practical concepts and frameworks commonly discussed in marketing, brand and growth interviews",
    ],
  },
  {
    id: "sales",
    title: "Sales",
    cat: "interview",
    oneLiner: "38 topics · 110+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Understand how businesses identify prospects, convert opportunities, manage relationships, and build repeatable revenue.",
    bullets: [
      "Sales funnels, customer buying stages, lead nurturing and conversion fundamentals",
      "CRM, customer relationships, sales planning and post-purchase engagement",
      "Practical preparation for sales, business development and revenue-focused interview questions",
    ],
    note: "Covers the customer journey from awareness and interest through purchase and loyalty, along with funnel-building activities.",
  },
  {
    id: "statistics",
    title: "Statistics",
    cat: "interview",
    oneLiner: "30 topics · 90+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Build the statistical foundation needed to interpret data, explain results, and answer analytical interview questions.",
    bullets: [
      "Mean, median, mode, variance, standard deviation and frequency distributions",
      "Probability, sampling methods, distributions and statistical reasoning",
      "Clear explanations of formulas and concepts used in analytics, research and business interviews",
    ],
    note: "Begins with descriptive statistics and measures of central tendency and variability before progressing to probability and sampling.",
  },
  {
    id: "finance",
    title: "Finance",
    cat: "interview",
    oneLiner: "48 topics · 150+ Qs",
    rating: 4.8,
    price: 499,
    intro: "Revise the essential financial concepts used to understand performance, evaluate decisions, and discuss business value.",
    bullets: [
      "Balance sheets, income statements, cash-flow statements and financial performance",
      "Time value of money, discounting, compounding and investment decisions",
      "Financial ratios covering liquidity, solvency, profitability and operational efficiency",
    ],
    note: "Covers the principal financial statements and their role in assessing a company's financial health.",
  },
  {
    id: "analytics",
    title: "Analytics",
    cat: "interview",
    oneLiner: "40 topics · 120+ Qs",
    rating: 4.7,
    price: 499,
    intro: "Learn how raw data becomes meaningful insight, business recommendations, and better management decisions.",
    bullets: [
      "Data collection, cleaning, transformation, analysis, interpretation and visualisation",
      "Descriptive, diagnostic, predictive and prescriptive analytics",
      "Regression, cohort, factor, time-series and other widely used analytical techniques",
    ],
    note: "Follows the complete analysis process and explains how results become actionable business insights.",
  },
  {
    id: "economics",
    title: "Economics",
    cat: "interview",
    oneLiner: "34 topics · 95+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Understand how markets, government decisions and economic forces influence businesses, customers and prices.",
    bullets: [
      "Supply, demand, equilibrium, elasticity and the factors influencing market prices",
      "Capitalist, Socialist and mixed economies, along with major economic sectors",
      "Fiscal policy, monetary policy, inflation, trade and macroeconomic decision-making",
    ],
    note: "Begins with supply and demand and explains how these forces shape prices and market conditions.",
  },
  {
    id: "supply-chain",
    title: "Supply Chain",
    cat: "interview",
    oneLiner: "32 topics · 85+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Revise how organisations plan, source, produce, move and manage goods efficiently from supplier to customer.",
    bullets: [
      "Planning, sourcing, manufacturing, delivery, returns and supply-chain models",
      "Inventory management, EOQ, reorder points, ABC analysis, JIT and MRP",
      "Quality, sustainability, global supply chains and data-driven inventory decisions",
    ],
    note: "Covers the complete supply-chain journey and major approaches to inventory optimisation.",
  },
  {
    id: "market-research",
    title: "Market Research",
    cat: "interview",
    oneLiner: "28 topics · 80+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Learn how businesses understand customers, evaluate markets, analyse competitors and make evidence-based decisions.",
    bullets: [
      "Primary and secondary research, surveys, qualitative and quantitative methods",
      "Market segmentation, customer insights, competitor analysis and emerging trends",
      "Practical use of behavioural data, feedback, social media, website data and market evidence",
    ],
    note: "Covers research design, segmentation, competitive analysis and the interpretation of market information.",
  },
  {
    id: "consulting",
    title: "Consulting",
    cat: "interview",
    oneLiner: "36 topics · 100+ Qs",
    rating: 4.7,
    price: 499,
    intro: "Build the business knowledge, structured thinking and communication foundation expected in consulting-oriented roles.",
    bullets: [
      "Types of consulting, career paths, consultant responsibilities and essential professional skills",
      "PESTEL, Porter's Five Forces, McKinsey 7S and process-improvement frameworks",
      "Client management, communication, problem-solving and emerging consulting trends",
    ],
    note: "Includes competitive-analysis and organisational frameworks such as Porter's Five Forces and McKinsey 7S.",
  },
  {
    id: "strategy",
    title: "Strategy",
    cat: "interview",
    oneLiner: "36 topics · 100+ Qs",
    rating: 4.7,
    price: 499,
    intro: "Understand how organisations choose where to compete, create advantage and prepare for long-term growth.",
    bullets: [
      "Strategic-thinking fundamentals, vision, planning, risk evaluation and decision-making",
      "SWOT and other frameworks used to assess businesses, markets and opportunities",
      "Competition, growth, adaptability and the development of practical strategic recommendations",
    ],
    note: "Presents strategic thinking as the combination of observation, planning, problem-solving and adaptability.",
  },
  {
    id: "product-management",
    title: "Product Management",
    cat: "interview",
    oneLiner: "40 topics · 110+ Qs",
    rating: 4.7,
    price: 499,
    intro: "Learn how products move from customer problem and initial idea to launch, adoption and continuous improvement.",
    bullets: [
      "Product strategy, customer needs, competition, market fit and profitability",
      "Ideation, validation, prototyping, MVP development, launch and product improvement",
      "Personas, roadmaps, KPIs, OKRs, product analytics and cross-functional collaboration",
    ],
    note: "Follows the product journey from idea development through validation, prototyping, release and iteration.",
  },
  {
    id: "project-management",
    title: "Project Management",
    cat: "interview",
    oneLiner: "30 topics · 85+ Qs",
    rating: 4.6,
    price: 499,
    intro: "Revise how projects are planned, delivered, monitored and protected against delays, risks and execution failures.",
    bullets: [
      "Project planning, scope, scheduling, stakeholders, resources and delivery fundamentals",
      "Risk identification, impact assessment, mitigation planning and continuous monitoring",
      "Risk avoidance, reduction, transfer and acceptance strategies with practical applications",
    ],
    note: "Explains the complete risk-management process, from identification through mitigation and monitoring.",
  },
  {
    id: "guesstimates",
    title: "Guesstimates",
    cat: "case",
    oneLiner: "25 questions · 60+ examples",
    rating: 4.6,
    price: 399,
    intro: "Practise breaking unfamiliar estimation questions into logical assumptions, manageable calculations and defensible answers.",
    bullets: [
      "Population, demand, revenue, capacity, consumption and market-sizing problems",
      "Assumption building, segmentation, rounding, sanity checks and structured calculations",
      "Complete worked approaches showing how to communicate reasoning, not merely the final number",
    ],
    note: "Emphasises logical assumptions, simplified calculations and explaining the approach clearly to the interviewer.",
  },
  {
    id: "market-entry",
    title: "Market Entry",
    cat: "case",
    oneLiner: "12 case studies",
    rating: 4.6,
    price: 499,
    intro: "Learn how to decide whether a company should enter a new market and how it should proceed.",
    bullets: [
      "Market attractiveness, customers, competition, company capabilities and product fit",
      "Market sizing, expected profitability, barriers to entry and operational feasibility",
      "Entry choices including organic expansion, acquisition, partnership and joint ventures",
    ],
    note: "Teaches students to evaluate opportunity, viability and feasibility before recommending an entry strategy.",
  },
  {
    id: "pricing",
    title: "Pricing",
    cat: "case",
    oneLiner: "10 case studies",
    rating: 4.7,
    price: 499,
    intro: "Practise determining what a product or service should cost using commercial logic and customer value.",
    bullets: [
      "Cost-based, competitor-based and value-based pricing approaches",
      "Fixed and variable costs, R&D recovery, margins, elasticity and willingness to pay",
      "Final recommendations supported by calculations, risks, considerations and next steps",
    ],
    note: "Compares multiple pricing approaches and connects costs, competition and perceived customer value.",
  },
];

const mentors = [
  {
    slug: "kavitha-venkat",
    name: "Kavitha Venkat",
    image: "assets/people/p1.jpg",
    role: "Marketing leader",
    company: "HUL",
    college: "IIM Bangalore",
    batch: "'14",
    tier: "industry",
    phases: [3, 5],
    streams: ["Marketing"],
    rating: 4.9,
    sessions: 142,
    years: 12,
    price: 1499,
    guestLectures: true,
    expertise: ["Brand-track interviews", "FMCG summers", "PPO conversion"],
    bio: "Twelve years across HUL brands, from ASM territories to national launches. Mentors the FMCG summer-to-PPO route — the exact climb she made.",
    reviewText:
      "She rebuilt my internship plan around one metric my guide cared about. Converted the PPO in week nine.",
    reviewWho: "PGP student, IIM Indore",
  },
  {
    slug: "abhinav-rathi",
    name: "Abhinav Rathi",
    image: "assets/people/p2.jpg",
    role: "Strategy lead",
    company: "McKinsey & Company",
    college: "IIM Ahmedabad",
    batch: "'16",
    tier: "industry",
    phases: [1, 4],
    streams: ["Consulting", "Strategy"],
    rating: 4.8,
    sessions: 98,
    years: 10,
    price: 1999,
    guestLectures: true,
    expertise: ["WAT-PI for the old IIMs", "Case competitions", "Consulting prep"],
    bio: "Interviewed for and got the IIM A call twice — once as a candidate, now as an alumni panellist. Coaches admissions interviews and case-competition finals.",
    reviewText:
      "Three mocks with him were harder than my actual IIM A interview. That was the point.",
    reviewWho: "Aspirant, converted IIM A",
  },
  {
    slug: "shruti-nambiar",
    name: "Shruti Nambiar",
    image: "assets/people/p3.jpg",
    role: "Analytics director",
    company: "Flipkart",
    college: "IIM Calcutta",
    batch: "'15",
    tier: "industry",
    phases: [3, 5],
    streams: ["Business Analytics"],
    rating: 4.9,
    sessions: 120,
    years: 11,
    price: 1499,
    guestLectures: true,
    expertise: ["Analytics interviews", "SQL screens", "Day-0 tech shortlists"],
    bio: "Runs analytics hiring loops at Flipkart. Knows exactly what the technical screen filters for — because she wrote it.",
    reviewText:
      "Mock SQL round on Tuesday, real one on Friday. Same question type appeared. Offer signed.",
    reviewWho: "Final-year, IIM L",
  },
  {
    slug: "rohan-malhotra",
    name: "Rohan Malhotra",
    image: "assets/people/p4.jpg",
    role: "Supply chain head",
    company: "Zepto",
    college: "XLRI Jamshedpur",
    batch: "'17",
    tier: "industry",
    phases: [2, 3],
    streams: ["Operations & Supply Chain"],
    rating: 4.7,
    sessions: 76,
    years: 9,
    price: 1299,
    guestLectures: false,
    expertise: ["Ops summers", "Committee strategy", "Quick-commerce roles"],
    bio: "Went from XLRI ops club junior to running dark-store networks. Mentors first-years on committees that compound and summers with a floor, not just a dashboard.",
    reviewText:
      "Told me which committee to skip. That advice alone was worth the term.",
    reviewWho: "First-year, XLRI",
  },
  {
    slug: "divya-krishnan",
    name: "Divya Krishnan",
    image: "assets/people/p5.jpg",
    role: "Product director",
    company: "Razorpay",
    college: "ISB Hyderabad",
    batch: "'18",
    tier: "industry",
    phases: [4, 5],
    streams: ["Product Management", "Business Analytics"],
    rating: 4.8,
    sessions: 88,
    years: 10,
    price: 1699,
    guestLectures: true,
    expertise: ["Product interviews", "Case-comp decks", "Offer negotiation"],
    bio: "Judges product case competitions and hires from them. Coaches finals rehearsals and the offer conversations nobody prepares for.",
    reviewText:
      "She made us rehearse the finals Q&A five times. We won. The judges asked four of the five questions.",
    reviewWho: "Case comp national finalist",
  },
  {
    slug: "arjun-mehta",
    name: "Arjun Mehta",
    image: "assets/people/p6.jpg",
    role: "Finance VP",
    company: "HDFC Bank",
    college: "FMS Delhi",
    batch: "'13",
    tier: "industry",
    phases: [1, 5],
    streams: ["Finance"],
    rating: 4.8,
    sessions: 105,
    years: 13,
    price: 1499,
    guestLectures: false,
    expertise: ["Finance placements", "FMS/IIM interviews", "Banking careers"],
    bio: "Thirteen years in banking after FMS. Mentors finance aspirants through admissions and final-years through banking interview loops.",
    reviewText:
      "He asked me why I wanted finance until my answer stopped being a brochure. Panels noticed.",
    reviewWho: "Aspirant, converted FMS",
  },
  {
    slug: "ishita-sharma",
    name: "Ishita Sharma",
    image: "assets/people/p7.jpg",
    role: "Associate consultant",
    company: "Deloitte",
    college: "IIM Indore",
    batch: "'25",
    tier: "alumni",
    phases: [1, 2],
    streams: ["Consulting", "General Management"],
    rating: 4.9,
    sessions: 64,
    years: 1,
    price: 699,
    guestLectures: false,
    expertise: ["Fresh admissions intel", "First-year survival", "Committee selection"],
    bio: "Placement committee, batch of 2025 — the interview formats she coaches are the ones she sat through eighteen months ago. The freshest intel on the roster.",
    reviewText:
      "She knew this year's WAT topics pattern better than my coaching institute did.",
    reviewWho: "Aspirant, 3 calls converted",
  },
  {
    slug: "vivek-iyer",
    name: "Vivek Iyer",
    image: "assets/people/p8.jpg",
    role: "Sales head",
    company: "Amazon",
    college: "IIM Lucknow",
    batch: "'16",
    tier: "industry",
    phases: [2, 3],
    streams: ["Sales", "Marketing"],
    rating: 4.7,
    sessions: 82,
    years: 10,
    price: 1299,
    guestLectures: true,
    expertise: ["Sales & GTM summers", "E-commerce roles", "GD prep"],
    bio: "Hires summer interns at Amazon every season. Mentors company selection and the group discussions that gate the shortlists.",
    reviewText:
      "His GD drills are chaos on purpose. The real one felt slow afterwards.",
    reviewWho: "First-year, IIM K",
  },
  {
    slug: "ananya-rao",
    name: "Ananya Rao",
    image: "assets/people/p9.jpg",
    role: "HR director",
    company: "Deloitte",
    college: "XLRI Jamshedpur",
    batch: "'12",
    tier: "industry",
    phases: [1, 5],
    streams: ["Human Resources"],
    rating: 4.8,
    sessions: 91,
    years: 14,
    price: 1499,
    guestLectures: true,
    expertise: ["HR careers", "XLRI/TISS admissions", "Offer evaluation"],
    bio: "Fourteen years in HR leadership — she has been the panel on hundreds of interviews. Mentors HR aspirants and anyone weighing competing offers.",
    reviewText:
      "She evaluated my two offers on five dimensions I hadn't considered. Took the \"smaller\" one. Zero regrets.",
    reviewWho: "Final-year, XLRI",
  },
  {
    slug: "karthik-menon",
    name: "Karthik Menon",
    image: "assets/people/p10.jpg",
    role: "Management trainee",
    company: "ITC",
    college: "XLRI Jamshedpur",
    batch: "'24",
    tier: "alumni",
    phases: [2, 4],
    streams: ["Marketing", "General Management"],
    rating: 4.9,
    sessions: 71,
    years: 2,
    price: 699,
    guestLectures: false,
    expertise: ["Case competitions", "Deck craft", "First-year strategy"],
    bio: "Won three national case competitions in two years, converted one into his ITC offer. Coaches teams stage by stage — shortlist deck to finals Q&A.",
    reviewText:
      "We'd never made a finals before. With his stage-wise plan we made two in one season.",
    reviewWho: "Case comp team, SPJIMR",
  },
];

function makeCompetitions(now: Date) {
  return [
    {
      id: "fmcg-growth-sprint",
      title: "Embark Case Sprint: FMCG Growth Challenge",
      host: "Embark India × Meridian Consumer Goods",
      category: "Marketing",
      banner: "orange",
      fee: 0,
      teamMin: 1,
      teamMax: 4,
      eligibility:
        "MBA/PGDM students of any year, any B-school in India. Cross-college teams allowed.",
      about:
        "A real growth problem from a national FMCG player: a heritage brand losing shelf share to D2C challengers. Three rounds from screening deck to a live boardroom pitch. Built for Tier 2 talent hunting a resume signal — and the sponsor is watching for PPI candidates.",
      rules: [
        "Teams of 1–4; one submission per team per round",
        "Decks in PDF, max 12 slides plus appendix",
        "Plagiarism = disqualification; data sources must be cited",
        "Judging is offline by the sponsor and Embark panel; decisions are final",
      ],
      prizes: [
        ["Winner", "₹30,000 + PPI interviews with the sponsor"],
        ["1st runner-up", "₹15,000 + PPI interviews"],
        ["2nd runner-up", "₹5,000"],
        ["All finalists", "Winner-track certificate + mentor session"],
      ],
      ppo: true,
      beginner: false,
      draft: false,
      regOpen: addDays(now, -5),
      regClose: addDays(now, 4),
      startAt: addDays(now, -2),
      endAt: addDays(now, 12),
      resultAt: addDays(now, 15),
      rounds: [
        {
          name: "Round 1 — Screening deck",
          brief:
            "Diagnose the share loss and propose your growth thesis in 5 slides.",
          opens: iso(addHours(now, -24)),
          closes: iso(addHours(now, 72)),
        },
        {
          name: "Round 2 — Full solution",
          brief:
            "Complete 12-slide strategy: portfolio, pricing, channel and media plan with financials.",
          opens: iso(addHours(now, -1)),
          closes: iso(addDays(now, 8)),
        },
        {
          name: "Finals — Live boardroom pitch",
          brief: "Online pitch to the sponsor CXO panel. 10 minutes, then Q&A.",
          opens: iso(addDays(now, 10)),
          closes: iso(addDays(now, 11)),
        },
      ],
      seedRegs: 87,
    },
    {
      id: "quickcommerce-ops-clash",
      title: "SwiftCart Quick-Commerce Ops Clash",
      host: "Embark India × SwiftCart",
      category: "Operations",
      banner: "green",
      fee: 0,
      teamMin: 2,
      teamMax: 4,
      eligibility: "MBA/PGDM students of any year. Teams of 2–4 from any college.",
      about:
        "Dark-store economics under 10-minute delivery pressure: design the network, the labour model and the unit economics that survive a price war. Two rounds, judged by operators.",
      rules: [
        "Teams of 2–4",
        "Round 1 is a structured working file plus 6-slide summary",
        "Cite every external data source",
      ],
      prizes: [
        ["Winner", "₹25,000 + PPI conversations"],
        ["Runner-up", "₹10,000"],
        ["Top 8", "Winner-track certificates"],
      ],
      ppo: true,
      beginner: false,
      draft: false,
      regOpen: addDays(now, 2),
      regClose: addDays(now, 10),
      startAt: addDays(now, 11),
      endAt: addDays(now, 24),
      resultAt: addDays(now, 27),
      rounds: [
        {
          name: "Round 1 — Ops model",
          brief: "Network design and unit economics working file.",
          opens: iso(addDays(now, 11)),
          closes: iso(addDays(now, 15)),
        },
        {
          name: "Finals — Live defence",
          brief: "Defend your model to a panel of quick-commerce operators.",
          opens: iso(addDays(now, 20)),
          closes: iso(addDays(now, 22)),
        },
      ],
      seedRegs: 0,
    },
    {
      id: "bharat-marketing-league",
      title: "Bharat Marketing League",
      host: "Embark India",
      category: "Marketing",
      banner: "dark",
      fee: 0,
      teamMin: 1,
      teamMax: 3,
      eligibility:
        "Open to all MBA/PGDM students. Tier 2 and Tier 3 college teams especially encouraged.",
      about:
        "Go-to-market for the next 500 million: a rural-first launch challenge. Two rounds, fully online, designed so a strong team from any campus can beat a brand-name college on the merits.",
      rules: [
        "Teams of 1–3, any college mix",
        "Round 1 is a 3-slide concept note",
        "All submissions in English or Hinglish — clarity beats polish",
      ],
      prizes: [
        ["Winner", "₹20,000 + feature on The eMBArk Times"],
        ["Runner-up", "₹10,000"],
        ["Top 10", "Winner-track certificates"],
      ],
      ppo: false,
      beginner: true,
      draft: false,
      regOpen: addDays(now, 6),
      regClose: addDays(now, 14),
      startAt: addDays(now, 15),
      endAt: addDays(now, 30),
      resultAt: addDays(now, 33),
      rounds: [
        {
          name: "Round 1 — Concept note",
          brief: "Pick a category, define the wedge, three slides.",
          opens: iso(addDays(now, 15)),
          closes: iso(addDays(now, 20)),
        },
        {
          name: "Finals — Full GTM",
          brief: "Complete rural go-to-market with budget and channel math.",
          opens: iso(addDays(now, 24)),
          closes: iso(addDays(now, 28)),
        },
      ],
      seedRegs: 0,
    },
    {
      id: "analytics-case-cup",
      title: "Northline Analytics Case Cup",
      host: "Embark India × Northline Analytics",
      category: "Analytics",
      banner: "charcoal",
      fee: 0,
      teamMin: 1,
      teamMax: 4,
      eligibility:
        "MBA/PGDM students with an interest in analytics. No coding required for Round 1.",
      about:
        "Turn a messy retail dataset into a boardroom decision. Business judgement first, tools second — exactly how analytics interviews actually work.",
      rules: [
        "Teams of 1–4",
        "Round 1 is insight-first: charts optional, thinking mandatory",
        "Finalists present live",
      ],
      prizes: [
        ["Winner", "₹20,000 + PPI interviews"],
        ["Runner-up", "₹8,000"],
        ["Top 10", "Winner-track certificates"],
      ],
      ppo: true,
      beginner: false,
      draft: false,
      regOpen: addDays(now, -30),
      regClose: addDays(now, -20),
      startAt: addDays(now, -19),
      endAt: addDays(now, -6),
      resultAt: addDays(now, -3),
      rounds: [
        {
          name: "Round 1 — Insight memo",
          brief: "From dataset to decision memo.",
          opens: iso(addDays(now, -19)),
          closes: iso(addDays(now, -14)),
        },
        {
          name: "Finals — Live readout",
          brief: "Present the decision to the panel.",
          opens: iso(addDays(now, -9)),
          closes: iso(addDays(now, -7)),
        },
      ],
      seedRegs: 214,
    },
    {
      id: "people-case-challenge",
      title: "The People Case Challenge",
      host: "Embark India",
      category: "Human Resources",
      banner: "green",
      fee: 0,
      teamMin: 1,
      teamMax: 4,
      eligibility: "Draft — being finalised.",
      about: "An HR transformation case. Draft — not yet published.",
      rules: ["Draft"],
      prizes: [["Winner", "TBD"]],
      ppo: false,
      beginner: false,
      draft: true,
      regOpen: addDays(now, 20),
      regClose: addDays(now, 30),
      startAt: addDays(now, 31),
      endAt: addDays(now, 45),
      resultAt: addDays(now, 48),
      rounds: [
        {
          name: "Round 1",
          brief: "TBD",
          opens: iso(addDays(now, 31)),
          closes: iso(addDays(now, 35)),
        },
      ],
      seedRegs: 0,
    },
  ];
}

async function main() {
  const now = new Date();

  // Clear existing data in dependency order (Cascades handle most).
  await prisma.$transaction([
    prisma.winner.deleteMany(),
    prisma.advancement.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.registration.deleteMany(),
    prisma.order.deleteMany(),
    prisma.playbookProgress.deleteMany(),
    prisma.bookingRequest.deleteMany(),
    prisma.speakerApplication.deleteMany(),
    prisma.lectureRequest.deleteMany(),
    prisma.user.deleteMany(),
    prisma.mentor.deleteMany(),
    prisma.playbook.deleteMany(),
    prisma.competition.deleteMany(),
  ]);

  // Users
  const [admin, student, riya] = await Promise.all([
    prisma.user.create({
      data: {
        email: "ajay.san36@gmail.com",
        password: await hash("admin123", 10),
        name: "Ajay",
        college: "Admin",
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "student@embark.local",
        password: await hash("student123", 10),
        name: "Test Student",
        college: "IIM Indore",
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "riya@embark.local",
        password: await hash("student123", 10),
        name: "Riya Sen",
        college: "XLRI Jamshedpur",
        isAdmin: false,
      },
    }),
  ]);

  // Stream playbooks
  await prisma.playbook.createMany({
    data: streamPlaybooks.map((pb) => ({
      slug: pb.slug,
      name: pb.name,
      theme: pb.theme,
      category: "stream",
      tagline: pb.tagline,
      oneLiner: pb.oneLiner,
      content: pb as unknown as object,
      price: 499,
      rating: 4.6,
      meta: pb.tagline,
      order: 0,
    })),
  });

  // Shop playbooks
  await prisma.playbook.createMany({
    data: shopPlaybooks.map((pb, index) => ({
      slug: `shop-${pb.id}`,
      name: pb.title,
      theme: index % 2 === 0 ? "orange" : "dark",
      category: pb.cat,
      tagline: pb.intro,
      oneLiner: pb.intro,
      content: pb as unknown as object,
      price: pb.price,
      rating: pb.rating,
      meta: pb.oneLiner,
      order: 0,
    })),
  });

  // Mentors
  await prisma.mentor.createMany({
    data: mentors.map((m) => ({
      slug: m.slug,
      name: m.name,
      image: m.image,
      role: m.role,
      company: m.company,
      college: m.college,
      batch: m.batch,
      tier: m.tier,
      phases: m.phases,
      streams: m.streams,
      rating: m.rating,
      sessions: m.sessions,
      years: m.years,
      price: m.price,
      guestLectures: m.guestLectures,
      expertise: m.expertise,
      bio: m.bio,
      reviewText: m.reviewText,
      reviewWho: m.reviewWho,
    })),
  });

  // Competitions
  await prisma.competition.createMany({
    data: makeCompetitions(now) as any,
  });

  // Registrations: 2 for the live competition, 1 for the closed competition.
  const liveComp = await prisma.competition.findUniqueOrThrow({
    where: { id: "fmcg-growth-sprint" },
  });
  const closedComp = await prisma.competition.findUniqueOrThrow({
    where: { id: "analytics-case-cup" },
  });

  const liveRegStudent = await prisma.registration.create({
    data: {
      userId: student.id,
      compId: liveComp.id,
      teamName: "Team Indore",
      members: [
        { name: student.name, email: student.email, college: student.college },
      ],
    },
  });

  const liveRegRiya = await prisma.registration.create({
    data: {
      userId: riya.id,
      compId: liveComp.id,
      teamName: "Team XLRI",
      members: [
        { name: riya.name, email: riya.email, college: riya.college },
      ],
    },
  });

  const closedReg = await prisma.registration.create({
    data: {
      userId: student.id,
      compId: closedComp.id,
      teamName: "Data Mavericks",
      members: [
        { name: student.name, email: student.email, college: student.college },
      ],
    },
  });

  // Submission and advancement for the live student registration.
  await prisma.submission.create({
    data: {
      compId: liveComp.id,
      regId: liveRegStudent.id,
      userId: student.id,
      roundIdx: 0,
      filePath: "uploads/demo-submission.pdf",
      note: "Demo submission for verification",
    },
  });

  await prisma.advancement.create({
    data: {
      compId: liveComp.id,
      regId: liveRegStudent.id,
      roundIdx: 0,
    },
  });

  // Winner for the closed competition.
  await prisma.winner.create({
    data: {
      compId: closedComp.id,
      regId: closedReg.id,
      rank: 1,
      teamName: closedReg.teamName,
    },
  });

  // Speaker applications.
  await prisma.speakerApplication.createMany({
    data: [
      {
        name: "Neeraj Verma",
        email: "neeraj.verma@example.com",
        role: "Senior Product Manager",
        company: "Swiggy",
        linkedIn: "https://linkedin.com/in/neerajverma",
        experience: "8+ years",
        vertical: "Product Management",
        city: "Bangalore",
        format: "Workshop + Case walkthrough",
        topics: "Product metrics, prioritisation, go-to-market",
      },
      {
        name: "Sunita Rao",
        email: "sunita.rao@example.com",
        role: "Senior Manager",
        company: "Hindustan Unilever",
        linkedIn: "https://linkedin.com/in/sunitarao",
        experience: "10+ years",
        vertical: "Marketing",
        city: "Mumbai",
        format: "Guest lecture + Q&A",
        topics: "Brand management, rural marketing, FMCG careers",
      },
    ],
  });

  // Lecture requests.
  await prisma.lectureRequest.createMany({
    data: [
      {
        institute: "IIM Lucknow",
        name: "Prof. Arvind Krishnan",
        email: "arvind@iiml.ac.in",
        phone: "+91 9876543210",
        vertical: "Strategy",
        engagement: "Half-day workshop",
        format: "Offline",
        dates: "Next month",
        audienceSize: "80–100 students",
        budget: "Within standard academic rates",
        message: "Looking for a practical case-based workshop on market entry strategy.",
      },
      {
        institute: "SPJIMR Mumbai",
        name: "Dr. Priya Nair",
        email: "priya.nair@spjimr.org",
        phone: "+91 9988776655",
        vertical: "Marketing",
        engagement: "Guest lecture",
        format: "Hybrid",
        dates: "End of semester",
        audienceSize: "120 students",
        budget: "Honourarium + travel",
        message: "Would like an industry practitioner to speak on digital marketing trends.",
      },
    ],
  });

  // Orders.
  const marketingPb = await prisma.playbook.findUniqueOrThrow({
    where: { slug: "shop-marketing" },
  });
  const consultingPb = await prisma.playbook.findUniqueOrThrow({
    where: { slug: "shop-consulting" },
  });

  await prisma.order.createMany({
    data: [
      {
        userId: student.id,
        playbookId: marketingPb.id,
        amount: marketingPb.price,
        status: "paid",
        paymentId: "demo-payment-marketing-001",
      },
      {
        userId: riya.id,
        playbookId: consultingPb.id,
        amount: consultingPb.price,
        status: "pending",
      },
    ],
  });

  console.log("Seed completed.");
  console.log({
    adminEmail: admin.email,
    studentEmail: student.email,
    riyaEmail: riya.email,
    playbooks: await prisma.playbook.count(),
    mentors: await prisma.mentor.count(),
    competitions: await prisma.competition.count(),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
