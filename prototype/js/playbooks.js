// Embark India — MBA stream playbooks. One entry per stream; playbooks.html
// renders the index, playbook.html renders a single stream from this data.
const PLAYBOOKS = [
  {
    slug: 'general-management',
    name: 'General Management',
    theme: 'dark',
    tagline: 'The generalist route: run businesses, not functions.',
    oneLiner: 'For people who want the whole P&L one day — leadership programmes, strategy roles, and the long game to business head.',
    forYouIf: [
      'You enjoy connecting dots across functions more than going deep in one',
      'You want leadership-programme routes (TAS, ABG, Mahindra GMC) or strategy roles',
      'You can live with slower early salary growth for faster later responsibility'
    ],
    study: ['Strategy', 'Organisational behaviour', 'Corporate finance', 'Operations', 'Marketing management', 'Negotiation', 'Business law', 'Leadership practicum'],
    roles: [
      { role: 'Leadership programme associate', desc: 'Rotations across functions and geographies in conglomerates — the classic GM track.', arc: 'Rotations → business analyst → chief of staff → P&L owner' },
      { role: 'Strategy / founder\'s office', desc: 'Close to the CEO agenda in startups and mid-size firms; broad exposure, high ambiguity.', arc: 'Associate → strategy manager → business head' },
      { role: 'Management consultant (generalist)', desc: 'Problem-solving across industries; a common launchpad into GM roles later.', arc: 'Consultant → engagement manager → industry exit' }
    ],
    recruiters: ['Tata Administrative Services', 'Aditya Birla Group', 'Mahindra GMC', 'Reliance', 'RPG Group', 'ITC', 'McKinsey & Company', 'Startups (founder\'s office)'],
    skills: [
      'Read a P&L and balance sheet without flinching',
      'Structure an ambiguous problem in under five minutes',
      'Run a meeting that ends with owners and dates',
      'Build a one-page business review from raw data',
      'Tell a company\'s strategy back to it better than its own website',
      'Interview stakeholders and synthesise what they actually said',
      'Present to seniors: one slide, one message, no filler'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Read one annual report a week. Learn Excel properly. Know why you want GM, in one honest sentence — panels ask.' },
      { phase: 'Term 1–2', detail: 'Grades matter for leadership-programme shortlists. Join one committee that runs real budgets, not five that don\'t.' },
      { phase: 'Summer internship', detail: 'Pick breadth over brand if you must choose — a real project with a measurable outcome beats coffee runs at a famous logo.' },
      { phase: 'Term 3–4', detail: 'Case competitions in strategy and general management; a national final is a resume line recruiters actually check.' },
      { phase: 'Final year', detail: 'Convert your summer or build the story of why not. Practise "walk me through your internship" until it is a two-minute film.' },
      { phase: 'Placements', detail: 'Leadership programmes interview for ownership and composure, not frameworks. Bring three stories where you owned an outcome end to end.' }
    ],
    signals: {
      do: ['Own one visible campus outcome (fest P&L, committee budget)', 'Show range: one finance, one ops, one people story', 'Know two industries deeply enough to discuss margins'],
      dont: ['Say "I\'m flexible" when asked what you want — it reads as unprepared', 'Collect committee titles with no outcomes attached', 'Ignore academics: LP shortlists often cut on grades first']
    },
    colleges: ['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'XLRI Jamshedpur', 'FMS Delhi']
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    theme: 'orange',
    tagline: 'Build brands people choose without thinking.',
    oneLiner: 'The FMCG brand-management track, plus the newer digital and growth routes — for people who love consumers, distribution and creative judgement with numbers behind it.',
    forYouIf: [
      'You notice why a shampoo shelf is arranged the way it is',
      'You want the brand-manager track (FMCG) or growth roles in consumer tech',
      'You like creative work but want the numbers to have the final word'
    ],
    study: ['Consumer behaviour', 'Brand management', 'Sales & distribution', 'Marketing research', 'Digital marketing', 'Pricing', 'Retail & e-commerce', 'Integrated marketing communication'],
    roles: [
      { role: 'Sales officer / ASM (FMCG entry)', desc: 'Everyone\'s first posting: a territory, a target, and a van. Where marketing careers are actually made.', arc: 'ASM → brand executive → brand manager → marketing head' },
      { role: 'Brand management', desc: 'Own a brand\'s P&L, positioning, media and innovation pipeline.', arc: 'Brand exec → BM → senior BM → category head' },
      { role: 'Growth / performance marketing', desc: 'Consumer-tech route: funnels, CAC, retention — marketing with a dashboard.', arc: 'Growth analyst → growth manager → head of growth' }
    ],
    recruiters: ['Hindustan Unilever', 'P&G', 'ITC', 'Nestlé', 'Marico', 'Dabur', 'Coca-Cola', 'Swiggy', 'Flipkart', 'Nykaa'],
    skills: [
      'Explain a brand\'s positioning in one sentence a rickshaw driver would get',
      'Read a Nielsen/Kantar share report and find the story',
      'Design and defend a pricing decision',
      'Run a structured market visit: shelf, shopper, retailer margin',
      'Build a simple media plan and justify the split',
      'A/B test copy and actually change your mind on the data',
      'Present a brand plan in seven slides'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Work retail shelves with your eyes: pick two brands and track everything they do for a month. Start a swipe file.' },
      { phase: 'Term 1–2', detail: 'Marketing club, but more importantly: win one live project with a real company. FMCG shortlists love evidence over enthusiasm.' },
      { phase: 'Summer internship', detail: 'FMCG summer = sales stint. Embrace the territory; the best PPOs go to people who loved the market, not survived it.' },
      { phase: 'Term 3–4', detail: 'Brand-track case competitions (HUL L.I.M.E., P&G CEO Challenge class of contests). One national final changes your shortlists.' },
      { phase: 'Final year', detail: 'Build your brand POV: three brands you\'d fix and how. Panels ask "which campaign did you like recently" — have a real answer.' },
      { phase: 'Placements', detail: 'Marketing interviews test consumer empathy + commercial sense. Every answer should end in shopper, share or margin.' }
    ],
    signals: {
      do: ['Do the market visit before the interview and mention what you saw', 'Quantify creative instincts: "this claim, because this insight"', 'Know distribution — it wins Indian marketing wars'],
      dont: ['Confuse liking ads with liking marketing', 'Dodge the sales stint — it is the credential', 'Present digital-only knowledge to an FMCG panel']
    },
    colleges: ['FMS Delhi', 'IIM Calcutta', 'XLRI Jamshedpur', 'SPJIMR Mumbai', 'IIM Bangalore']
  },
  {
    slug: 'finance',
    name: 'Finance',
    theme: 'green',
    tagline: 'Where the numbers stop being homework and start being money.',
    oneLiner: 'Investment banking, corporate finance, markets and fintech — for people who want to be trusted with capital and can defend a valuation at 2 a.m.',
    forYouIf: [
      'Valuation feels like a puzzle, not a chore',
      'You want IB/PE/markets, corporate treasury, or fintech strategy',
      'You can handle front-loaded hours in exchange for front-loaded learning'
    ],
    study: ['Corporate finance', 'Valuation', 'Financial markets', 'Derivatives', 'Financial statement analysis', 'M&A', 'Fixed income', 'Fintech & payments'],
    roles: [
      { role: 'Investment banking analyst/associate', desc: 'Deals: pitchbooks, models, diligence. Brutal hours, unmatched compression of learning.', arc: 'Associate → VP → director / PE exit' },
      { role: 'Corporate finance / treasury', desc: 'Inside companies: capital allocation, FP&A, investor relations. Saner hours, real influence.', arc: 'Analyst → FP&A manager → finance controller → CFO track' },
      { role: 'Markets / asset management', desc: 'Research and portfolio roles; your calls are scored in public every day.', arc: 'Research associate → analyst → fund manager' }
    ],
    recruiters: ['Goldman Sachs', 'J.P. Morgan', 'Avendus', 'Kotak Investment Banking', 'ICICI Bank', 'HDFC Bank', 'Axis Capital', 'Big 4 (deals)', 'Razorpay', 'CRED'],
    skills: [
      'Build a three-statement model from scratch',
      'Value a company three ways and explain why the answers differ',
      'Read an annual report\'s notes — where the bodies are buried',
      'Explain a deal from the news in three minutes',
      'Excel keyboard fluency (no mouse for an hour)',
      'Write a one-page investment memo',
      'Track one sector well enough to have a view'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Accounting basics before day one — finance electives assume it. Start following two sectors and one deal a week.' },
      { phase: 'Term 1–2', detail: 'Grades gate IB shortlists at most campuses. Join the finance club for the network, do the modelling course for the skill.' },
      { phase: 'Summer internship', detail: 'IB summers are won in October: CV points frozen early. If not IB, corporate finance at a serious firm beats "finance-ish" at a brand.' },
      { phase: 'Term 3–4', detail: 'CFA L1 if markets-bound. Stock-pitch and M&A case competitions; one good memo circulates further than you think.' },
      { phase: 'Final year', detail: 'Deal journal: ten deals, one page each, your view included. Panels can smell a memorised DCF from a real one.' },
      { phase: 'Placements', detail: 'Technicals are table stakes; differentiation is judgement. "Would you do this deal?" needs an actual answer with a number.' }
    ],
    signals: {
      do: ['Have a view on a live deal, with numbers', 'Know your own CV\'s every number cold', 'Show stamina evidence — finance panels look for it'],
      dont: ['Say "I like numbers" as your motivation', 'Fumble accounting basics while claiming IB ambitions', 'Chase the label: fintech strategy ≠ finance track']
    },
    colleges: ['IIM Ahmedabad', 'IIM Calcutta', 'FMS Delhi', 'SPJIMR Mumbai', 'IIM Bangalore']
  },
  {
    slug: 'operations-supply-chain',
    name: 'Operations & Supply Chain',
    theme: 'orange',
    tagline: 'The stream that moves atoms, not slides.',
    oneLiner: 'From quick-commerce dark stores to factory floors — for people who get satisfaction from a process running 4% better than yesterday.',
    forYouIf: [
      'You want measurable, physical outcomes — trucks, SKUs, throughput',
      'E-commerce ops, manufacturing excellence or supply-chain consulting appeal to you',
      'You like being where the business actually happens'
    ],
    study: ['Operations management', 'Supply chain design', 'Logistics', 'Lean & six sigma', 'Procurement', 'Demand forecasting', 'Project management', 'Service operations'],
    roles: [
      { role: 'E-commerce / quick-commerce ops', desc: 'Run fulfilment centres, last-mile networks, dark stores. India\'s fastest-growing ops playground.', arc: 'Ops manager → city head → regional ops head' },
      { role: 'Supply chain (FMCG / manufacturing)', desc: 'Plan demand, source materials, move goods; own service levels and cost.', arc: 'SC analyst → planning manager → supply chain head' },
      { role: 'Ops consulting', desc: 'Fix other companies\' factories and networks; travel-heavy, exposure-rich.', arc: 'Consultant → manager → ops excellence leader' }
    ],
    recruiters: ['Amazon', 'Flipkart', 'Swiggy', 'Zepto', 'Tata Steel', 'Asian Paints', 'Maersk', 'Delhivery', 'Accenture Ops', 'Hindustan Unilever (SC)'],
    skills: [
      'Map a process end-to-end and find the bottleneck',
      'Basic queuing and inventory maths without a formula sheet',
      'Read a warehouse: layout, pick paths, idle time',
      'Build a demand forecast and know when to distrust it',
      'Negotiate with a vendor using cost structure, not volume threats',
      'Run a root-cause analysis that survives the third "why"',
      'SQL well enough to pull your own data'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Visit any warehouse or plant you can. Watch how a food-delivery order actually reaches you; write down every handoff.' },
      { phase: 'Term 1–2', detail: 'Ops electives early. Live projects with e-commerce firms are abundant — take one and produce a number ("reduced X by Y%").' },
      { phase: 'Summer internship', detail: 'Choose a role with a floor, not just a dashboard. The intern who stood in the FC at 6 a.m. converts.' },
      { phase: 'Term 3–4', detail: 'Six sigma green belt if your college offers it. Supply-chain case competitions (ISCM, company-run challenges).' },
      { phase: 'Final year', detail: 'Build one ops story with baseline → intervention → result. Numbers are the language of this stream.' },
      { phase: 'Placements', detail: 'Panels give guesstimates and process cases. Practise thinking aloud in units: orders, minutes, rupees per shipment.' }
    ],
    signals: {
      do: ['Speak in metrics: fill rate, TAT, cost per order', 'Show comfort with fieldwork and odd hours', 'Bring one process you personally improved, however small'],
      dont: ['Treat ops as the fallback stream — panels can tell', 'Hide from data questions; modern ops is analytical', 'Confuse supply chain buzzwords with understanding flow']
    },
    colleges: ['IIM Calcutta', 'IIM Indore', 'SPJIMR Mumbai', 'IIM Bangalore', 'XLRI Jamshedpur']
  },
  {
    slug: 'human-resources',
    name: 'Human Resources',
    theme: 'green',
    tagline: 'The people P&L: talent is the hardest supply chain.',
    oneLiner: 'HR leadership programmes and business-partner roles — for people who can hold both the employee\'s story and the company\'s spreadsheet at once.',
    forYouIf: [
      'Organisational problems interest you more than market problems',
      'You want HRLP routes or the HR business partner track',
      'You can be trusted with hard conversations and confidential rooms'
    ],
    study: ['Organisational behaviour', 'Talent management', 'Compensation & benefits', 'Labour law & IR', 'HR analytics', 'Learning & development', 'Change management', 'Performance systems'],
    roles: [
      { role: 'HR leadership programme', desc: 'Rotations across talent, C&B, IR and plant HR in large groups — the premium HR entry.', arc: 'HRLP → HRBP → HR head (unit) → CHRO track' },
      { role: 'HR business partner', desc: 'Embedded with a business unit; translate business goals into people decisions.', arc: 'HRBP → senior HRBP → business HR head' },
      { role: 'Specialist (C&B / analytics / L&D)', desc: 'Go deep in one lever: pay design, people data, capability building.', arc: 'Analyst → specialist lead → CoE head' }
    ],
    recruiters: ['Aditya Birla Group', 'Tata Group', 'RPG', 'Unilever', 'ITC', 'Deloitte', 'Accenture', 'Mahindra', 'Larsen & Toubro', 'Amazon'],
    skills: [
      'Read attrition data and find the real reason, not the exit-form reason',
      'Design a simple incentive plan and predict how it will be gamed',
      'Facilitate a discussion between people who disagree',
      'Know the basics of Indian labour law that actually bite',
      'Build an HR dashboard a business head would read',
      'Interview for competence, not confidence',
      'Write a difficult message that is honest and humane'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Read one serious book on organisations (not pop-psych). Talk to two HR professionals about their worst week.' },
      { phase: 'Term 1–2', detail: 'OB and IR courses seriously — HR panels test fundamentals. Take a live project involving real employee data.' },
      { phase: 'Summer internship', detail: 'Prefer a project with a measurable people-outcome (attrition, hiring funnel, engagement) over a shadowing role.' },
      { phase: 'Term 3–4', detail: 'HR case competitions (Tata Steel-a-thon, XLRI events). Learn HR analytics properly — it is the differentiator this decade.' },
      { phase: 'Final year', detail: 'Form views: moonlighting, hybrid work, AI in hiring. Panels ask current-affairs-of-work questions and expect a position.' },
      { phase: 'Placements', detail: 'HR interviews are values-probing and situational. Prepare stories where you balanced person vs organisation and can defend the call.' }
    ],
    signals: {
      do: ['Bring numbers to a people conversation', 'Show one experience of handling conflict directly', 'Know the difference between HR ops, HRBP and CoE roles'],
      dont: ['Say "I like people" — the panel has heard it 400 times', 'Ignore IR/labour law; plant HR is where HRLPs start', 'Treat HR as the softer option; the good tracks are brutally selective']
    },
    colleges: ['XLRI Jamshedpur', 'TISS Mumbai', 'MDI Gurgaon', 'IIM Ranchi', 'SCMHRD Pune']
  },
  {
    slug: 'business-analytics',
    name: 'Business Analytics',
    theme: 'dark',
    tagline: 'Decisions, with evidence attached.',
    oneLiner: 'Analytics consulting, product analytics and data-driven strategy — for people who want to sit between the data team and the decision.',
    forYouIf: [
      'You ask "how do we know that?" in every meeting',
      'Analytics consulting, product analytics or data-led strategy roles appeal',
      'You are willing to code a little to be trusted a lot'
    ],
    study: ['Statistics & econometrics', 'Machine learning for managers', 'SQL & data management', 'Experimentation / A-B testing', 'Data visualisation', 'Product analytics', 'Forecasting', 'Decision science'],
    roles: [
      { role: 'Analytics consultant', desc: 'Client problems solved with models and storytelling — ZS, Mastercard, AmEx class of firms.', arc: 'Analyst → engagement lead → analytics practice head' },
      { role: 'Product / growth analyst', desc: 'Inside consumer tech: metrics, experiments, and the "should we ship it" call.', arc: 'Analyst → senior analyst → analytics manager → head of data' },
      { role: 'Strategy with data (corporate)', desc: 'FP&A-plus roles where the model is yours and so is the recommendation.', arc: 'Analyst → insights manager → strategy head' }
    ],
    recruiters: ['Mastercard', 'American Express', 'ZS Associates', 'Tiger Analytics', 'Mu Sigma', 'Flipkart', 'Swiggy', 'Walmart Global Tech', 'EXL', 'Fractal'],
    skills: [
      'SQL joins and window functions without Googling',
      'Design an A/B test and know what invalidates it',
      'Regression: run it, read it, and say what it does not prove',
      'Turn a messy business question into a measurable one',
      'One chart, one message — visualisation discipline',
      'Python/R enough to clean data and prototype',
      'Explain a model to someone who distrusts models'
    ],
    plan: [
      { phase: 'Before the MBA', detail: 'Finish a real SQL course and one statistics refresher. Kaggle once, badly — you learn what data cleaning actually is.' },
      { phase: 'Term 1–2', detail: 'Take the quant electives others avoid. Build one public project: a dashboard or analysis of a dataset you care about.' },
      { phase: 'Summer internship', detail: 'Analytics summers test tools on day one. Rehearse SQL before the interview, not after the shortlist.' },
      { phase: 'Term 3–4', detail: 'Analytics case competitions and datathons. Add experimentation depth — most candidates stop at dashboards.' },
      { phase: 'Final year', detail: 'Portfolio over certificates: three analyses with business recommendations beats five course completions.' },
      { phase: 'Placements', detail: 'Expect a case + technical screen. The winning move is translating analysis into a decision, not showing off methods.' }
    ],
    signals: {
      do: ['Show one end-to-end project: question → data → decision', 'Say "the data can\'t answer that" when true — it builds trust', 'Know the business metric behind every technical metric'],
      dont: ['List tools you can\'t interview on', 'Hide from coding rounds; managers who can\'t query get filtered', 'Present correlation with a causal straight face']
    },
    colleges: ['IIM Calcutta', 'IIM Bangalore', 'ISB Hyderabad', 'IIM Lucknow', 'MDI Gurgaon']
  }
];
