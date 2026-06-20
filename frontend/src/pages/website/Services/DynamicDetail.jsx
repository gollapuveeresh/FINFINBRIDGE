import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Landmark, Percent, Rocket, LineChart, 
  Compass, BookOpen, Award, Lightbulb, Building, Users, Target, CheckCircle2 
} from 'lucide-react';

const slugData = {
  // --- COMPANY ---
  "mission-vision": {
    title: "Mission & Vision",
    tag: "FINBRIDGE TRUST",
    subtitle: "Defining our commitment to financial growth, transparency, and executive integrity.",
    description: "Our mission is to establish a secure gateway of trust between businesses and institutional capitals. We envision a globally integrated digital ecosystem where small-to-medium enterprises and startups can scale without administrative friction.",
    icon: Target,
    metrics: [{ label: "Target Ecosystem size", value: "₹5,000 Cr+" }, { label: "Client-Centricity Score", value: "98.9%" }],
    benefits: ["Meticulous auditing integrity", "Democratization of institutional funding resources", "Transparency at every milestone", "Regulatory excellence compliance standards"],
    strategicSteps: ["Phase 1: Scale local advisory network", "Phase 2: Launch fully integrated portal", "Phase 3: Connect global VC networks"]
  },
  "leadership-team": {
    title: "Our Leadership Team",
    tag: "FINBRIDGE TRUST",
    subtitle: "Meet our senior advisors, CFAs, risk officers, and global partners.",
    description: "FinBridge is led by seasoned investment bankers, chartered accountants, and risk compliance executives with decades of combined experience across Wall Street, London, and Indian financial sectors.",
    icon: Users,
    metrics: [{ label: "CFA/CA Advisors", value: "45+" }, { label: "Average Team Experience", value: "16 Yrs" }],
    benefits: ["Decades of deal-making experience", "Broad venture capital relationships", "Strong regulatory advisory depth", "Custom strategy configurations"],
    strategicSteps: ["CFA-led investment reviews", "CA-managed corporate auditing compliance", "Dedicated fractional CFO availability"]
  },
  "why-finbridge": {
    title: "Why Choose FinBridge",
    tag: "FINBRIDGE TRUST",
    subtitle: "Our commitment to quality service standards and compliance.",
    description: "Unlike automated software or traditional static firms, FinBridge provides an active, digital-first relationship manager backed by advanced calculators, deep sector analytics, and hands-on advisory.",
    icon: Award,
    metrics: [{ label: "Client Retention Rate", value: "98%" }, { label: "Advisory Success Rate", value: "94.6%" }],
    benefits: ["Active relationship manager assigned instantly", "Proprietary tax and EMI calculation engines", "Direct connections to global lending pools", "24/7 client portal accessibility"],
    strategicSteps: ["Rigorous discovery assessment", "Custom strategy modeling", "Milestone-driven deal execution"]
  },

  // --- INDUSTRIES ---
  "industry-technology": {
    title: "Technology & SaaS Sector",
    tag: "INDUSTRY SECTOR",
    subtitle: "IP valuations, tax optimizations, and capital scaling for high-tech ventures.",
    description: "We help SaaS founders and technology innovators model recurring revenue streams, structure IP holdings legally, and build robust spreadsheets for venture capital validation.",
    icon: Landmark,
    metrics: [{ label: "SaaS Clients Funded", value: "120+" }, { label: "Total Tech Deal Capital", value: "₹1,200 Cr+" }],
    benefits: ["IP valuation defense reporting", "Subscription model cash flow optimization", "R&D tax credits claims support", "Cap-table dilution modeling"],
    strategicSteps: ["Evaluate recurring revenue metrics", "Establish valuation foundations", "Formulate VC pitching collateral"]
  },
  "industry-healthcare": {
    title: "Healthcare & Pharmaceuticals",
    tag: "INDUSTRY SECTOR",
    subtitle: "Compliance, risk controls, and valuations for clinical networks.",
    description: "Supporting private hospitals, labs, and biomedical startups in navigating strict regulatory compliance requirements, capital asset modeling, and clinical deal structures.",
    icon: Landmark,
    metrics: [{ label: "Clinical Networks Advised", value: "35+" }, { label: "Average Efficiency Gains", value: "18.4%" }],
    benefits: ["Equipment financing structures", "Strict healthcare regulatory compliance", "Asset valuation auditing", "Strategic healthcare mergers advisory"],
    strategicSteps: ["Audit regulatory compliance positions", "Structure capital equipment loans", "Forecast operational metrics"]
  },
  "industry-manufacturing": {
    title: "Manufacturing & Heavy Industries",
    tag: "INDUSTRY SECTOR",
    subtitle: "Capital restructuring, asset valuations, and modeling for industrial firms.",
    description: "Helping factory owners and manufacturing companies optimize supply chain debt, structure asset-backed loans, and calculate factory depreciation tax offsets.",
    icon: Landmark,
    metrics: [{ label: "Factories Advised", value: "64" }, { label: "Asset Value Managed", value: "₹2,500 Cr+" }],
    benefits: ["Asset depreciation tax optimization", "Supply chain invoice factoring", "Machinery capital expenditure loans", "Operational cost reviews"],
    strategicSteps: ["Conduct heavy equipment appraisals", "Implement tax depreciation schedules", "Arrange machinery debt lines"]
  },
  "industry-retail": {
    title: "Retail & Consumer Brands",
    tag: "INDUSTRY SECTOR",
    subtitle: "Growth strategies, M&A, and cash flow structures for high-end consumer brands.",
    description: "Guiding retail chains and consumer brands through inventory financing, omnichannel expansion plans, and strategic mergers to accelerate market penetration.",
    icon: Landmark,
    metrics: [{ label: "Retail Brands Scaled", value: "88" }, { label: "Working Capital Optimized", value: "₹450 Cr" }],
    benefits: ["Inventory working capital structuring", "Omnichannel expansion financial modeling", "Strategic retail acquisitions", "Lease agreement optimizations"],
    strategicSteps: ["Analyze stock turnover velocities", "Model franchise expansion returns", "Secure inventory funding backing"]
  },
  "industry-education": {
    title: "Education & EdTech",
    tag: "INDUSTRY SECTOR",
    subtitle: "Capital budget planning and improvement for universities and platforms.",
    description: "Providing capital budgeting support, endowment management strategies, and merger advisory for educational institutions and digital EdTech entities.",
    icon: Landmark,
    metrics: [{ label: "Institutions Supported", value: "22" }, { label: "Endowment Value Managed", value: "₹600 Cr" }],
    benefits: ["Endowment capital optimization", "EdTech software IP valuation", "Infrastructure debt restructuring", "Student loan system integrations"],
    strategicSteps: ["Review institutional endowment allocations", "Valuate software learning systems", "Renegotiate infrastructure bond debt"]
  },
  "industry-financial-services": {
    title: "Financial Services & FinTech",
    tag: "INDUSTRY SECTOR",
    subtitle: "Trust structures, capital advisory, and asset management support.",
    description: "Advising wealth firms, regional cooperatives, and FinTech platforms on licensing requirements, liquidity audits, and joint venture deals.",
    icon: Landmark,
    metrics: [{ label: "FinTechs Advised", value: "40" }, { label: "Total Assets Under Advisory", value: "₹3,400 Cr" }],
    benefits: ["Liquidity management audits", "Joint venture trust structures", "Regulatory sandbox positioning", "Asset-backed securities advisory"],
    strategicSteps: ["Audit capital reserves compliance", "Draft cross-border JV agreements", "Design asset-backed security pools"]
  },

  // --- NETWORK ---
  "network-partners": {
    title: "Global Financial Partners",
    tag: "NETWORK ECOSYSTEM",
    subtitle: "Our relationships with global banks, institutional pools, and legal partners.",
    description: "FinBridge maintains close relationships with premier global investment banks, institutional credit pools, and major domestic corporate legal networks to accelerate client deal closures.",
    icon: Users,
    metrics: [{ label: "Banking Partners", value: "18+" }, { label: "Partner Legal Networks", value: "12" }],
    benefits: ["Faster corporate loan matching", "Direct access to international capital", "Accelerated due diligence execution", "Streamlined cross-border transactions"],
    strategicSteps: ["Establish partner criteria", "Integrate credit match APIs", "Execute global syndication protocols"]
  },
  "network-ecosystem": {
    title: "The FinBridge Ecosystem",
    tag: "NETWORK ECOSYSTEM",
    subtitle: "Connecting advisors, CA associations, and fractional executive networks.",
    description: "We host a collaborative ecosystem where independent chartered accountants, legal specialists, and fractional CFOs pool resources to support our clients' multi-disciplinary needs.",
    icon: Users,
    metrics: [{ label: "Ecosystem Members", value: "1,200+" }, { label: "Client Transactions Facilitated", value: "₹4,200 Cr" }],
    benefits: ["Instant specialist match", "Coordinated accounting-legal reviews", "Access to fractional financial experts", "Comprehensive corporate advisory"],
    strategicSteps: ["Screen independent specialists", "Onboard onto portal sandbox", "Coordinate client deal-team structures"]
  },
  "network-investors": {
    title: "Investor & Venture Network",
    tag: "NETWORK ECOSYSTEM",
    subtitle: "Introductions to VC firms, angel networks, and family offices.",
    description: "We connect high-growth enterprises and startups directly with vetted venture capitals, angel syndicates, and legacy family offices matching their sector profile.",
    icon: Users,
    metrics: [{ label: "Vetted VC Partners", value: "75+" }, { label: "Active Angel Investors", value: "320+" }],
    benefits: ["Direct partner-level introductions", "Pre-screened funding matches", "Pitch optimization reviews", "Term sheet negotiation support"],
    strategicSteps: ["Assess startup readiness level", "Target matching investor lists", "Arrange executive-level pitches"]
  },

  // --- WHAT WE DO / CONSULTING ---
  "financial-planning": {
    title: "Strategic Financial Planning",
    tag: "FINANCIAL ADVISORY",
    subtitle: "Custom forecasting models, budgeting, and performance analytics.",
    description: "We configure strategic projections, cash flow budgets, and operational spreadsheets to provide management with deep foresight and a resilient financial base.",
    icon: Landmark,
    metrics: [{ label: "Planning Clients", value: "340+" }, { label: "Avg Profit Increase", value: "22%" }],
    benefits: ["3-Year cash flow projection modeling", "Scenario-based budget stress testing", "Departmental cost allocation matrices", "Capital spending advisory"],
    strategicSteps: ["Audit historical accounting data", "Build dynamic Excel projection models", "Configure quarterly budget review systems"]
  },

  // --- TAX ---
  "tax-planning": {
    title: "Corporate & Personal Tax Planning",
    tag: "TAX ADVISORY & COMPLIANCE",
    subtitle: "Year-round strategic tax advice to legally minimize liabilities.",
    description: "We evaluate corporate structures, international transactions, and individual investments to create a tax structure that minimizes overall liabilities while ensuring compliance.",
    icon: Percent,
    metrics: [{ label: "Average Tax Savings", value: "28%" }, { label: "Audit-free Filings Rate", value: "99.8%" }],
    benefits: ["Corporate group tax consolidations", "Strategic director compensation models", "Deductions optimization analyses", "Advance tax forecasting engines"],
    strategicSteps: ["Review entity legal structure", "Identify unutilized tax credits", "Formulate seasonal advance tax projections"]
  },
  "tax-optimization": {
    title: "Tax Optimization Frameworks",
    tag: "TAX ADVISORY & COMPLIANCE",
    subtitle: "Optimizing international tax structures and transactional flows.",
    description: "Helping clients structure cross-border royalties, transfer pricing agreements, and intellectual property layouts to ensure efficient tax allocation.",
    icon: Percent,
    metrics: [{ label: "Cross-Border Deals Advised", value: "55" }, { label: "Average Net Tax Reduction", value: "14%" }],
    benefits: ["IP royalties tax optimization", "Transfer pricing documentation compliance", "Double tax avoidance treaty application", "Export incentive utilization"],
    strategicSteps: ["Model cross-border transaction taxes", "Draft formal transfer pricing policies", "Establish overseas subsidiary frameworks"]
  },
  "compliance-management": {
    title: "Regulatory Compliance & Audit Preparedness",
    tag: "TAX ADVISORY & COMPLIANCE",
    subtitle: "Staying compliant with GST, income tax, and corporate laws.",
    description: "Our dedicated CA compliance team manages GST returns, TDS filings, and corporate audits so you don't face penalties or operational disruptions.",
    icon: Percent,
    metrics: [{ label: "On-Time Compliance filings", value: "100%" }, { label: "Penalties Avoided", value: "₹18 Lakhs/avg" }],
    benefits: ["Automated GST reconciliations", "Quarterly corporate tax compliance reviews", "Direct liaison with audit officers", "Legal representation support"],
    strategicSteps: ["Sync portal transactions with tax databases", "Verify TDS calculations", "Conduct mock audit checks"]
  },
  "tax-reporting": {
    title: "Financial & Tax Reporting Services",
    tag: "TAX ADVISORY & COMPLIANCE",
    subtitle: "Filing corporate returns and structuring transparent disclosures.",
    description: "We assemble high-integrity financial disclosure statements, corporate tax returns, and capital asset depreciation schedules for management and shareholders.",
    icon: Percent,
    metrics: [{ label: "Disclosure Statements Filed", value: "900+" }, { label: "Reporting Errors Rate", value: "0.0%" }],
    benefits: ["Board-ready financial statements", "Filing corporate income tax returns", "Depreciation schedule calculators", "Accurate stakeholder disclosures"],
    strategicSteps: ["Reconcile general ledger balances", "Compute deferred tax balances", "Submit final tax disclosures electronically"]
  },

  // --- INVESTMENTS ---
  "portfolio-analysis": {
    title: "Advanced Portfolio Analysis",
    tag: "WEALTH MANAGEMENT",
    subtitle: "Evaluating asset classes, historical returns, and risk exposures.",
    description: "We review existing equity, debt, real estate, and alternative assets to evaluate performance, highlight cost drags, and identify hidden risk concentrations.",
    icon: LineChart,
    metrics: [{ label: "Portfolios Assessed", value: "₹1,800 Cr" }, { label: "Average Cost Savings", value: "1.2%/yr" }],
    benefits: ["Identification of high-fee product drags", "Sector concentration risk assessments", "Historical attribution analyses", "Liquidity profiling diagnostics"],
    strategicSteps: ["Ingest global brokerage statements", "Run stress testing models", "Deliver rebalancing recommendations report"]
  },
  "wealth-planning": {
    title: "Comprehensive Wealth Planning",
    tag: "WEALTH MANAGEMENT",
    subtitle: "Custom wealth plans for business owners and family offices.",
    description: "Creating comprehensive, long-term wealth maps integrating personal tax strategies, estate planning structures, and customized asset allocations.",
    icon: LineChart,
    metrics: [{ label: "Family Offices Supported", value: "32" }, { label: "Average Wealth Plan Horizon", value: "25 Yrs" }],
    benefits: ["Inter-generational estate structures", "Business exit tax structuring", "Philanthropic fund setups", "Custom cash flow generation systems"],
    strategicSteps: ["Define retirement and transfer goals", "Draft trust and estate documents", "Deploy capital to target allocations"]
  },
  "investment-strategy": {
    title: "Custom Investment Strategies",
    tag: "WEALTH MANAGEMENT",
    subtitle: "Deploying institutional-grade asset allocation plans.",
    description: "We design tailored portfolios matching your risk appetite, combining public market equities, fixed income securities, gold hedges, and private equity access.",
    icon: LineChart,
    metrics: [{ label: "Active Custom Strategies", value: "150+" }, { label: "Avg Annual Return Target", value: "12-15%" }],
    benefits: ["Multi-asset class allocation access", "Low-correlation hedge integrations", "Direct equity strategy options", "Automatic rebalancing parameters"],
    strategicSteps: ["Assess investor risk tolerance profile", "Construct custom asset allocation policy", "Implement core-satellite investing model"]
  },
  "risk-analysis": {
    title: "Asset Risk & Attribution Analysis",
    tag: "WEALTH MANAGEMENT",
    subtitle: "Stress testing portfolios against inflation and macro shifts.",
    description: "Ensuring wealth preservation by modeling how your investments will perform in inflation spikes, interest rate changes, and geopolitical shocks.",
    icon: LineChart,
    metrics: [{ label: "Stress Scenarios Modeled", value: "10" }, { label: "Risk Mitigation Index", value: "+30%" }],
    benefits: ["Inflation risk attribution reports", "Geopolitical shock stress tests", "Liquidity constraint analyses", "Hedging cost-efficiency reviews"],
    strategicSteps: ["Extract real-time asset pricing data", "Inject stress testing factors", "Adjust hedging positions accordingly"]
  },

  // --- STARTUPS ---
  "investor-connect": {
    title: "Strategic Investor Connect",
    tag: "STARTUP STRATEGY & FUNDING",
    subtitle: "Warm introductions to institutional venture capital and angels.",
    description: "We use our investor network to introduce tech startups and growth ventures to partners who fit their funding stage, ticket size, and sector.",
    icon: Rocket,
    metrics: [{ label: "Capital Raised", value: "₹450 Cr+" }, { label: "Investor Network Size", value: "400+" }],
    benefits: ["Direct partner-level introductions", "Reduced fundraising timelines", "Access to strategic co-investors", "Global family office reach"],
    strategicSteps: ["Filter startup investor matching list", "Draft clean executive summary briefs", "Coordinate pitch sessions"]
  },
  "funding-assistance": {
    title: "Funding Readiness & Assistance",
    tag: "STARTUP STRATEGY & FUNDING",
    subtitle: "Pitch deck reviews, valuation models, and cap tables.",
    description: "We help founders compile investor-ready pitch collateral, build detailed 5-year financial spreadsheets, and structure clean capitalization tables.",
    icon: Rocket,
    metrics: [{ label: "Investor decks Approved", value: "85+" }, { label: "Average Pre-Money Valuation", value: "₹40 Cr" }],
    benefits: ["Vetted financial projection spreadsheets", "Clean cap-table dilution schedules", "Professional pitch deck structuring", "Data room checklist validation"],
    strategicSteps: ["Draft operational projections", "Build standard dilution tables", "Organize institutional data rooms"]
  },
  "growth-capital": {
    title: "Growth Capital Structures",
    tag: "STARTUP STRATEGY & FUNDING",
    subtitle: "Advising on venture debt, equity rounds, and bridge loans.",
    description: "We evaluate your options between VC equity dilution, venture debt lines, and strategic bridge financing to minimize funding costs while scaling operations.",
    icon: Rocket,
    metrics: [{ label: "Debt Facilities Arranged", value: "₹180 Cr" }, { label: "Avg Cost of Capital Saved", value: "3.5%" }],
    benefits: ["Venture debt facility access", "Bridge loan term sheets reviews", "Optimal capital structure analyses", "Non-dilutive financing plans"],
    strategicSteps: ["Evaluate debt capacity", "Draft term sheet negotiations", "Coordinate transaction closure"]
  },
  "business-planning": {
    title: "Business Planning & Modeling",
    tag: "STARTUP STRATEGY & FUNDING",
    subtitle: "Building practical GTM models and unit economics spreadsheets.",
    description: "We define, model, and stress-test your startup's unit economics, Customer Acquisition Cost (CAC), Lifetime Value (LTV), and market launch budgets.",
    icon: Rocket,
    metrics: [{ label: "Startups Scaled", value: "70+" }, { label: "Unit Margin Improvement", value: "+18%" }],
    benefits: ["Unit economics calculations reviews", "CAC/LTV projection databases", "Go-To-Market budget modeling", "Burn-rate runway trackers"],
    strategicSteps: ["Define core billing variables", "Model CAC and expansion margins", "Deploy burn-rate reporting dashboard"]
  },

  // --- THINKING / INSIGHTS ---
  "market-insights": {
    title: "Market Insights",
    tag: "MARKET OUTLOOK",
    subtitle: "Weekly analysis of corporate earnings, VC trends, and IPO volumes.",
    description: "Read our chartered analysts' weekly commentary on sector valuations, public market interest shifts, venture capital deal flow velocities, and upcoming public listings.",
    icon: Compass,
    metrics: [{ label: "Weekly Readers", value: "12,000+" }, { label: "Analyst Reviews", value: "50/yr" }],
    benefits: ["Attributions of sector multiple shifts", "VC deal volume monitoring", "Pre-IPO valuation reviews", "Corporate earnings analytics summaries"],
    strategicSteps: ["Gather private and public indices data", "Summarize valuation trends", "Publish weekly briefing dashboard"]
  },
  "economic-outlook": {
    title: "Global Economic Outlook",
    tag: "MARKET OUTLOOK",
    subtitle: "Navigating central bank rates, trade changes, and global inflation.",
    description: "Get regular macro reports detailing central bank monetary decisions, regional inflation markers, yield curves, and international trade policy shifts.",
    icon: Compass,
    metrics: [{ label: "Macro Factors Tracked", value: "24" }, { label: "Quarterly Forecast Accuracy", value: "96.4%" }],
    benefits: ["Interest rate trend projections", "Inflation metrics impact assessments", "Trade tariff exposure guides", "Global currency flow analyses"],
    strategicSteps: ["Analyze reserve bank publications", "Run global econometric models", "Generate quarterly macro outlook report"]
  },
  "financial-trends": {
    title: "Financial & Asset Class Trends",
    tag: "MARKET OUTLOOK",
    subtitle: "Tracking emerging investment formats, yields, and alternative structures.",
    description: "Evaluating the rise of alternative investment platforms, private debt yields, real estate fractions, and tokenized assets relative to standard equities.",
    icon: Compass,
    metrics: [{ label: "Asset Classes Monitored", value: "12" }, { label: "Emerging Yields Assessment", value: "Vetted" }],
    benefits: ["Private debt platforms assessments", "Fractional property return audits", "REIT and InvIT yield reviews", "Commodities hedging allocation advice"],
    strategicSteps: ["Audit alternative platforms", "Compare net yields with public fixed income", "Publish quarterly asset classes reviews"]
  },
  "industry-reports": {
    title: "In-Depth Industry Reports",
    tag: "MARKET OUTLOOK",
    subtitle: "Valuation trends and profit maps across core sectors.",
    description: "Read our comprehensive sector profiles detailing business value/EBITDA multiples, supply chains, regulatory hurdles, and profit pools in healthcare, manufacturing, and tech.",
    icon: Compass,
    metrics: [{ label: "Sectors Covered", value: "6 Core" }, { label: "Report Page Length", value: "45 pgs" }],
    benefits: ["Business value multiples benchmarking", "Supply chain bottleneck analyses", "Sector margins compression alerts", "Strategic positioning matrices"],
    strategicSteps: ["Collect sector operational data", "Model baseline multiple trends", "Distribute comprehensive sector profiles"]
  },

  // --- KNOWLEDGE ---
  "business-guides": {
    title: "FinBridge Business Guides",
    tag: "RESOURCES & GUIDES",
    subtitle: "Practical financial playbooks for managing corporate growth.",
    description: "A comprehensive digital library of operational guides on managing working capital, structuring partner buyouts, calculating equity splits, and arranging debt.",
    icon: BookOpen,
    metrics: [{ label: "Guides Available", value: "80+" }, { label: "Total Downloads", value: "45,000+" }],
    benefits: ["Working capital optimization strategies", "Founders equity allocation guidelines", "Corporate restructuring roadmaps", "Commercial debt acquisition playbooks"],
    strategicSteps: ["Collate advisory case guidelines", "Structure actionable playbooks", "Publish resources regularly"]
  },
  "tax-strategies": {
    title: "Advanced Tax Strategies",
    tag: "RESOURCES & GUIDES",
    subtitle: "Practical guides to legally minimizing corporate tax exposures.",
    description: "Educational briefs and strategy papers covering how to use holding companies, defer capital gains, and structure international transactions.",
    icon: BookOpen,
    metrics: [{ label: "Strategy Papers", value: "35+" }, { label: "Avg tax savings potential", value: "20-30%" }],
    benefits: ["Holding company structure guides", "Capital gains roll-over strategies", "Corporate gift tax guidelines", "R&D tax credits setup papers"],
    strategicSteps: ["Analyze tax law updates", "Draft structural flowcharts", "Distribute structural optimization papers"]
  },
  "investment-resources": {
    title: "Investment Resources & Tools",
    tag: "RESOURCES & GUIDES",
    subtitle: "Excel models, CAGR calculators, and valuation sheets.",
    description: "Downloadable spreadsheets, valuation templates, debt-to-equity models, and CAGR calculators vetted by our CFAs for business analysis.",
    icon: BookOpen,
    metrics: [{ label: "Downloadable Models", value: "24" }, { label: "Calculators Online", value: "8" }],
    benefits: ["Vetted valuation spreadsheets templates", "Interactive CAGR calculators", "Debt-to-equity analysis models", "Retirement planning worksheets"],
    strategicSteps: ["Design model mathematical frameworks", "Build responsive web interfaces", "Verify calculator output precision"]
  },
  "financial-planning-guide": {
    title: "Corporate Financial Planning Guide",
    tag: "RESOURCES & GUIDES",
    subtitle: "Step-by-step handbooks for compiling corporate budgets.",
    description: "A comprehensive handbook detailing how to organize internal finance teams, set up automated accounting pipelines, and compile baseline budgets.",
    icon: BookOpen,
    metrics: [{ label: "Manual Chapters", value: "12" }, { label: "Corporate Users", value: "2,400+" }],
    benefits: ["Internal budget setup instructions", "Accounting software reviews", "Cash burn management rules", "Audit checklist timelines"],
    strategicSteps: ["Outline accounting control steps", "Document general ledger setups", "Draft audit-ready template manuals"]
  },

  // --- CASES ---
  "startup-success-stories": {
    title: "Startup Funding Success Stories",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Venture capital deal studies: Seed to Series A.",
    description: "Read detailed accounts of how we helped high-growth SaaS, FinTech, and healthcare startups compile financials, pitch venture partners, and secure funding.",
    icon: Award,
    metrics: [{ label: "Capital Raised Success", value: "₹450 Cr" }, { label: "Client Retainer Satisfy", value: "98%" }],
    benefits: ["SaaS round advisory briefings", "Valuation multiple defenses cases", "Term sheet negotiation analyses", "Cap-table cleanup solutions"],
    strategicSteps: ["Assess startup baseline financials", "Implement pitch optimization strategies", "Negotiate institutional funding terms"]
  },
  "funding-case-studies": {
    title: "Funding & Restructuring Case Studies",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Analyzing M&A and corporate debt restructuring transactions.",
    description: "Detailed accounts of how we structured commercial loans, coordinated company acquisitions, and optimized debt costs for enterprise clients.",
    icon: Award,
    metrics: [{ label: "Debt Restructured", value: "₹280 Cr" }, { label: "Average Yield Savings", value: "2.8%" }],
    benefits: ["Debt syndication case reviews", "Strategic mergers deal analyses", "Working capital restructure briefs", "Corporate refinancing models"],
    strategicSteps: ["Analyze client debt liabilities", "Refinance with low-cost institutions", "Close transaction agreements"]
  },
  "client-transformations": {
    title: "Client Financial Improvements",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Corporate turnaround briefs and margin improvements.",
    description: "Read how our consultants audited operational budgets, optimized cash collections, and reduced cost overheads to drive client profitability.",
    icon: Award,
    metrics: [{ label: "Avg EBITDA Increase", value: "+32%" }, { label: "Operating Cost Savings", value: "₹85 Lakhs/avg" }],
    benefits: ["Turnaround margin diagnostics", "Overhead expense cuts cases", "Working capital velocity gains", "Fractional CFO impact reviews"],
    strategicSteps: ["Audit current overhead allocations", "Deploy margin expansion protocols", "Measure monthly profit attributes"]
  },
  "business-growth-stories": {
    title: "Enterprise Growth & Scaling Stories",
    tag: "CLIENT CASE STUDIES",
    subtitle: "How we helped mid-market firms scale their footprints.",
    description: "Case studies detailing capital structures, international tax plans, and inventory debt lines that powered geographic expansions.",
    icon: Award,
    metrics: [{ label: "Enterprise Scale Ups", value: "45" }, { label: "New Market Entries", value: "14" }],
    benefits: ["Expansion capital setups", "Holding structure implementations", "Inventory debt financing facilities", "JV financial frameworks"],
    strategicSteps: ["Map growth market metrics", "Structure overseas holding units", "Establish scalable capital pools"]
  },

  // --- INNOVATION ---
  "ai-in-finance": {
    title: "AI in Finance & Predictive Modeling",
    tag: "FINTECH & AI",
    subtitle: "Using algorithms for cash flow modeling and valuations.",
    description: "Explore our research and deployments of machine learning and natural language processing tools in corporate budgeting, cash flow forecasting, and automated audits.",
    icon: Lightbulb,
    metrics: [{ label: "Forecast Speedup", value: "10x" }, { label: "Predictive Confidence", value: "98.8%" }],
    benefits: ["Automated forecasting models", "Audit pattern anomalies detection", "Natural language financial audits", "Sentiment-guided market trackers"],
    strategicSteps: ["Sync transaction logs into ML engine", "Execute predictive modeling scripts", "Generate automatic anomaly alerts"]
  },
  "fintech-trends": {
    title: "FinTech Trends & Open Banking",
    tag: "FINTECH & AI",
    subtitle: "DeFi protocols, digital ledgers, and API banking pools.",
    description: "Analyzing the integration of regional banking APIs, unified payment gateways, and asset-backed smart contracts into corporate cash collections.",
    icon: Lightbulb,
    metrics: [{ label: "Payment Speedup", value: "Real-time" }, { label: "Integration Timelines", value: "4 Wks" }],
    benefits: ["Direct banking API integrations", "Corporate cash reconciliation systems", "Smart contract asset records", "Unified payment collection rails"],
    strategicSteps: ["Audit payment pipeline points", "Deploy custom bank API relays", "Integrate automated ledgers updates"]
  },
  "future-of-finance": {
    title: "The Future of Finance & Enterprise Tech",
    tag: "FINTECH & AI",
    subtitle: "Next-gen banking, compliance databases, and SaaS tools.",
    description: "Evaluating SaaS accounting tools, distributed finance ledgers, and cloud compliance databases that are redefining the role of corporate finance directors.",
    icon: Lightbulb,
    metrics: [{ label: "Software Systems Tested", value: "35+" }, { label: "IT cost reduction", value: "24%" }],
    benefits: ["Decentralized financial ledgers reviews", "Cloud-native compliance setups", "Automated accounts payables tools", "Mobile dashboard monitoring"],
    strategicSteps: ["Model software compatibility points", "Migrate systems to cloud-native platforms", "Establish mobile-accessible data views"]
  },
  "digital-transformation-guide": {
    title: "Digital Finance Upgrade",
    tag: "FINTECH & AI",
    subtitle: "Migrating legacy systems and databases to secure clouds.",
    description: "Our practical playbook for helping mid-market firms decommission legacy servers, audit local files, and securely migrate files to modern cloud ledgers.",
    icon: Lightbulb,
    metrics: [{ label: "Successful Migrations", value: "52" }, { label: "Zero-Data-Loss Rate", value: "100%" }],
    benefits: ["Legacy database audits", "Secure cloud accounting deployments", "Finance team onboarding manuals", "Multi-factor authentication setups"],
    strategicSteps: ["Appraise legacy server databases", "Structure secure cloud frameworks", "Execute automated database migration"]
  },

  // --- CUSTOM CLIENT CASES ---
  "success-stories": {
    title: "All Client Success Stories",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Explore our successful investment raises, M&A integrations, and cost optimizations.",
    description: "FinBridge works across various high-growth industries like Technology/SaaS, Healthcare, Manufacturing, and Retail. Our chartered consultants and CFAs configure practical plans, structure debt facilities, audit compliance positions, and increase business value.",
    icon: Award,
    metrics: [{ label: "Total Assets Advised", value: "₹5,000 Cr+" }, { label: "Client Satisfaction", value: "98%" }],
    benefits: [
      "TechNova Solutions: $245M Series C Funding successfully completed",
      "MediCore Health: $87M Strategic M&A Acquisition successfully closed",
      "Comprehensive compliance and tax modeling preventing major penalties",
      "Strategic geographic franchise expansions and inventory debt setups"
    ],
    strategicSteps: [
      "Rigorous operational audit and financial discovery",
      "Custom corporate modeling and projection stress testing",
      "Direct syndication and closing with institutional networks"
    ]
  },
  "technova-solutions": {
    title: "TechNova Solutions: $245M Series C SaaS Funding",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Structuring detailed 5-year recurring revenue projections and defense valuation reports.",
    description: "TechNova Solutions, a high-growth SaaS platform, required capital to scale global operations. FinBridge prepared robust IP valuation defense documents, cleaned up historical cap table dilutions, and directly facilitated deals with top global venture capitals.",
    icon: Award,
    metrics: [{ label: "Series C Funding", value: "$245M" }, { label: "Valuation Multiple", value: "3.2x" }],
    benefits: [
      "CFA-backed recurring revenue projection modeling",
      "Vetted IP valuation compliance report defending high multiples",
      "Restructured offshore corporate entities to optimize global tax drag",
      "Warm introductions to global Tier-1 SaaS venture partners"
    ],
    strategicSteps: [
      "Assess metrics (CAC, LTV, Net Retention, Churn)",
      "Model multi-scenario valuation benchmarks (DCF & comps)",
      "Facilitate term sheet review and negotiation to secure deal"
    ]
  },
  "medicore-health": {
    title: "MediCore Health: $87M Strategic M&A Acquisition",
    tag: "CLIENT CASE STUDIES",
    subtitle: "Comprehensive healthcare asset valuation and regulatory mergers advisory.",
    description: "MediCore Health sought acquisition by a global pharmaceutical leader. FinBridge managed the end-to-end M&A sell-side process, including appraisal of multi-specialty clinical assets and structuring tax-efficient transaction agreements.",
    icon: Award,
    metrics: [{ label: "Acquisition Value", value: "$87M" }, { label: "M&A Duration", value: "90 Days" }],
    benefits: [
      "Appraised complex medical assets and clinical real estate holdings",
      "Ensured zero compliance penalties during due diligence transitions",
      "Optimized transaction setup to minimize capital gains liabilities",
      "Secured structured performance earn-out clauses for core shareholders"
    ],
    strategicSteps: [
      "Audit operational assets and health insurance pipelines",
      "Structure tax-efficient asset vs. stock purchase layouts",
      "Close final acquisition covenants and transition reviews"
    ]
  }
};

const DynamicDetail = () => {
  const location = useLocation();
  const path = location.pathname.substring(1); // remove leading slash
  const data = slugData[path];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A192F] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold font-serif text-[#D4AF37] mb-4">Topic Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">The requested category view could not be located or may have moved.</p>
        <Link to="/" className="btn btn-primary bg-[#D4AF37] text-[#0A192F] px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const TopicIcon = data.icon || Compass;

  return (
    <div className="min-h-screen bg-[#0A192F] text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-[#0A1230]/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        

        {/* Hero Section */}
        <div className="grid md:grid-cols-12 gap-8 items-start mb-16">
          <div className="md:col-span-8">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full">
              {data.tag}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight mt-5 text-white leading-tight">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light mt-4 leading-relaxed">
              {data.subtitle}
            </p>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-xl shadow-[#D4AF37]/5">
              <TopicIcon className="w-10 h-10 md:w-14 md:h-14" />
            </div>
          </div>
        </div>

        {/* Content Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Main Description & Benefits */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-2xl font-bold text-white mb-4 font-serif border-b border-white/5 pb-3">
              Operational Focus & Capabilities
            </h3>
            <p className="text-gray-400 leading-relaxed font-light text-base mb-8">
              {data.description}
            </p>

            <h4 className="text-lg font-semibold text-[#D4AF37] mb-4 font-sans">
              Key Value & Deliverables
            </h4>
            <ul className="space-y-3.5">
              {data.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics & Strategic Steps */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              {data.metrics.map((metric, index) => (
                <div key={index} className="bg-white/[0.04] border border-[#D4AF37]/20 rounded-2xl p-6 text-center shadow-lg hover:border-[#D4AF37]/40 transition-colors">
                  <div className="text-2xl md:text-3xl font-extrabold text-[#D4AF37] tracking-tight mb-1">
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Roadmap */}
            <div className="bg-[#0A1230]/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-5 font-serif border-b border-white/5 pb-3">
                Strategic Process
              </h3>
              <div className="space-y-5">
                {data.strategicSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-[#0A192F] font-bold text-xs flex items-center justify-center shrink-0">
                      0{index + 1}
                    </div>
                    <p className="text-xs text-gray-400 font-light leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Callback CTA */}
        <div className="bg-gradient-to-br from-[#0A1230] to-[#0A192F] border border-[#D4AF37]/30 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[80px]" />
          
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3">
              Need Specialized Advisory?
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Connect with a senior CFA or tax consultant to build a customized growth model tailored to these operational points
            </p>
          </div>

          <Link
            to="/contact"
            className="shrink-0 bg-gradient-to-r from-[#E6C46A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#AA7C11] text-[#15110a] font-semibold text-xs tracking-wider uppercase py-4 px-8 rounded-full shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2.5 transition-all duration-300 transform hover:-translate-y-0.5 mag"
          >
            Consult Our Experts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DynamicDetail;
