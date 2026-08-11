// Embark India — unified mentor/professional profiles.
// One person, multiple services (mentorship / guest lectures) — the shared
// profile system. phases: 1 college, 2 start strong, 3 summers, 4 case comps, 5 final placement.
// stages derived from phases: aspirant(1), first-year(2,3,4), final-year(4,5).
const MENTORS = [
  {
    slug: 'kavitha-venkat', name: 'Kavitha Venkat', img: 'assets/people/p1.jpg',
    role: 'Marketing leader', company: 'HUL', college: 'IIM Bangalore', batch: "'14",
    tier: 'industry', phases: [3, 5], streams: ['Marketing'],
    rating: 4.9, sessions: 142, years: 12, price: 1499, guestLectures: true,
    expertise: ['Brand-track interviews', 'FMCG summers', 'PPO conversion'],
    bio: 'Twelve years across HUL brands, from ASM territories to national launches. Mentors the FMCG summer-to-PPO route — the exact climb she made.',
    review: { text: 'She rebuilt my internship plan around one metric my guide cared about. Converted the PPO in week nine.', who: 'PGP student, IIM Indore' }
  },
  {
    slug: 'abhinav-rathi', name: 'Abhinav Rathi', img: 'assets/people/p2.jpg',
    role: 'Strategy lead', company: 'McKinsey & Company', college: 'IIM Ahmedabad', batch: "'16",
    tier: 'industry', phases: [1, 4], streams: ['Consulting', 'Strategy'],
    rating: 4.8, sessions: 98, years: 10, price: 1999, guestLectures: true,
    expertise: ['WAT-PI for the old IIMs', 'Case competitions', 'Consulting prep'],
    bio: 'Interviewed for and got the IIM A call twice — once as a candidate, now as an alumni panellist. Coaches admissions interviews and case-competition finals.',
    review: { text: 'Three mocks with him were harder than my actual IIM A interview. That was the point.', who: 'Aspirant, converted IIM A' }
  },
  {
    slug: 'shruti-nambiar', name: 'Shruti Nambiar', img: 'assets/people/p3.jpg',
    role: 'Analytics director', company: 'Flipkart', college: 'IIM Calcutta', batch: "'15",
    tier: 'industry', phases: [3, 5], streams: ['Business Analytics'],
    rating: 4.9, sessions: 120, years: 11, price: 1499, guestLectures: true,
    expertise: ['Analytics interviews', 'SQL screens', 'Day-0 tech shortlists'],
    bio: 'Runs analytics hiring loops at Flipkart. Knows exactly what the technical screen filters for — because she wrote it.',
    review: { text: 'Mock SQL round on Tuesday, real one on Friday. Same question type appeared. Offer signed.', who: 'Final-year, IIM L' }
  },
  {
    slug: 'rohan-malhotra', name: 'Rohan Malhotra', img: 'assets/people/p4.jpg',
    role: 'Supply chain head', company: 'Zepto', college: 'XLRI Jamshedpur', batch: "'17",
    tier: 'industry', phases: [2, 3], streams: ['Operations & Supply Chain'],
    rating: 4.7, sessions: 76, years: 9, price: 1299, guestLectures: false,
    expertise: ['Ops summers', 'Committee strategy', 'Quick-commerce roles'],
    bio: 'Went from XLRI ops club junior to running dark-store networks. Mentors first-years on committees that compound and summers with a floor, not just a dashboard.',
    review: { text: 'Told me which committee to skip. That advice alone was worth the term.', who: 'First-year, XLRI' }
  },
  {
    slug: 'divya-krishnan', name: 'Divya Krishnan', img: 'assets/people/p5.jpg',
    role: 'Product director', company: 'Razorpay', college: 'ISB Hyderabad', batch: "'18",
    tier: 'industry', phases: [4, 5], streams: ['Product Management', 'Business Analytics'],
    rating: 4.8, sessions: 88, years: 10, price: 1699, guestLectures: true,
    expertise: ['Product interviews', 'Case-comp decks', 'Offer negotiation'],
    bio: 'Judges product case competitions and hires from them. Coaches finals rehearsals and the offer conversations nobody prepares for.',
    review: { text: 'She made us rehearse the finals Q&A five times. We won. The judges asked four of the five questions.', who: 'Case comp national finalist' }
  },
  {
    slug: 'arjun-mehta', name: 'Arjun Mehta', img: 'assets/people/p6.jpg',
    role: 'Finance VP', company: 'HDFC Bank', college: 'FMS Delhi', batch: "'13",
    tier: 'industry', phases: [1, 5], streams: ['Finance'],
    rating: 4.8, sessions: 105, years: 13, price: 1499, guestLectures: false,
    expertise: ['Finance placements', 'FMS/IIM interviews', 'Banking careers'],
    bio: 'Thirteen years in banking after FMS. Mentors finance aspirants through admissions and final-years through banking interview loops.',
    review: { text: 'He asked me why I wanted finance until my answer stopped being a brochure. Panels noticed.', who: 'Aspirant, converted FMS' }
  },
  {
    slug: 'ishita-sharma', name: 'Ishita Sharma', img: 'assets/people/p7.jpg',
    role: 'Associate consultant', company: 'Deloitte', college: 'IIM Indore', batch: "'25",
    tier: 'alumni', phases: [1, 2], streams: ['Consulting', 'General Management'],
    rating: 4.9, sessions: 64, years: 1, price: 699, guestLectures: false,
    expertise: ['Fresh admissions intel', 'First-year survival', 'Committee selection'],
    bio: 'Placement committee, batch of 2025 — the interview formats she coaches are the ones she sat through eighteen months ago. The freshest intel on the roster.',
    review: { text: 'She knew this year\'s WAT topics pattern better than my coaching institute did.', who: 'Aspirant, 3 calls converted' }
  },
  {
    slug: 'vivek-iyer', name: 'Vivek Iyer', img: 'assets/people/p8.jpg',
    role: 'Sales head', company: 'Amazon', college: 'IIM Lucknow', batch: "'16",
    tier: 'industry', phases: [2, 3], streams: ['Sales', 'Marketing'],
    rating: 4.7, sessions: 82, years: 10, price: 1299, guestLectures: true,
    expertise: ['Sales & GTM summers', 'E-commerce roles', 'GD prep'],
    bio: 'Hires summer interns at Amazon every season. Mentors company selection and the group discussions that gate the shortlists.',
    review: { text: 'His GD drills are chaos on purpose. The real one felt slow afterwards.', who: 'First-year, IIM K' }
  },
  {
    slug: 'ananya-rao', name: 'Ananya Rao', img: 'assets/people/p9.jpg',
    role: 'HR director', company: 'Deloitte', college: 'XLRI Jamshedpur', batch: "'12",
    tier: 'industry', phases: [1, 5], streams: ['Human Resources'],
    rating: 4.8, sessions: 91, years: 14, price: 1499, guestLectures: true,
    expertise: ['HR careers', 'XLRI/TISS admissions', 'Offer evaluation'],
    bio: 'Fourteen years in HR leadership — she has been the panel on hundreds of interviews. Mentors HR aspirants and anyone weighing competing offers.',
    review: { text: 'She evaluated my two offers on five dimensions I hadn\'t considered. Took the "smaller" one. Zero regrets.', who: 'Final-year, XLRI' }
  },
  {
    slug: 'karthik-menon', name: 'Karthik Menon', img: 'assets/people/p10.jpg',
    role: 'Management trainee', company: 'ITC', college: 'XLRI Jamshedpur', batch: "'24",
    tier: 'alumni', phases: [2, 4], streams: ['Marketing', 'General Management'],
    rating: 4.9, sessions: 71, years: 2, price: 699, guestLectures: false,
    expertise: ['Case competitions', 'Deck craft', 'First-year strategy'],
    bio: 'Won three national case competitions in two years, converted one into his ITC offer. Coaches teams stage by stage — shortlist deck to finals Q&A.',
    review: { text: 'We\'d never made a finals before. With his stage-wise plan we made two in one season.', who: 'Case comp team, SPJIMR' }
  }
];

// stage → phases mapping (single source of truth)
const STAGE_PHASES = {
  'aspirant': [1],
  'first-year': [2, 3, 4],
  'final-year': [4, 5]
};
