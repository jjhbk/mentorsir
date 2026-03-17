export interface ResourceMappingTemplateRow {
  rowKey: string;
  paper: string;
  subject: string;
  part: string;
}

export const RESOURCE_MAPPING_TEMPLATE: ResourceMappingTemplateRow[] = [
  { rowKey: "gs1-history-ancient", paper: "GS 1", subject: "History", part: "Ancient" },
  { rowKey: "gs1-history-medieval", paper: "GS 1", subject: "History", part: "Medieval" },
  { rowKey: "gs1-history-modern", paper: "GS 1", subject: "History", part: "Modern" },
  { rowKey: "gs1-history-art-culture", paper: "GS 1", subject: "History", part: "Art & Culture" },
  { rowKey: "gs1-history-world", paper: "GS 1", subject: "History", part: "World History" },
  { rowKey: "gs1-history-post-independence", paper: "GS 1", subject: "History", part: "Post Independence" },
  { rowKey: "gs1-geography-indian", paper: "GS 1", subject: "Geography", part: "Indian" },
  { rowKey: "gs1-geography-world", paper: "GS 1", subject: "Geography", part: "World" },
  { rowKey: "gs1-geography-map", paper: "GS 1", subject: "Geography", part: "Map" },
  { rowKey: "gs1-society", paper: "GS 1", subject: "Society", part: "Core" },
  { rowKey: "gs2-polity-constitution", paper: "GS 2", subject: "Polity", part: "Constitution" },
  { rowKey: "gs2-polity-governance", paper: "GS 2", subject: "Polity", part: "Governance" },
  { rowKey: "gs2-polity-ir", paper: "GS 2", subject: "Polity", part: "International Relations" },
  { rowKey: "gs2-social-justice", paper: "GS 2", subject: "Social Justice", part: "Core" },
  { rowKey: "gs3-economy", paper: "GS 3", subject: "Economy", part: "Core" },
  { rowKey: "gs3-agriculture", paper: "GS 3", subject: "Agriculture", part: "Core" },
  { rowKey: "gs3-internal-security", paper: "GS 3", subject: "Internal Security", part: "Core" },
  { rowKey: "gs3-science-tech", paper: "GS 3", subject: "Science & Tech", part: "Core" },
  { rowKey: "gs3-environment-ecology", paper: "GS 3", subject: "Environment & Ecology", part: "Core" },
  { rowKey: "gs3-disaster-management", paper: "GS 3", subject: "Disaster Management", part: "Core" },
  { rowKey: "gs4-ethics-theory", paper: "GS 4", subject: "Ethics", part: "Theory" },
  { rowKey: "gs4-ethics-case-studies", paper: "GS 4", subject: "Ethics", part: "Case Studies" },
  { rowKey: "csat-quant", paper: "CSAT", subject: "CSAT", part: "Quant" },
  { rowKey: "csat-reasoning", paper: "CSAT", subject: "CSAT", part: "Reasoning" },
  { rowKey: "csat-comprehension", paper: "CSAT", subject: "CSAT", part: "Comprehension" },
  { rowKey: "optional", paper: "Optional", subject: "Optional", part: "Core" },
  { rowKey: "current-affairs", paper: "Current Affairs", subject: "Current Affairs", part: "Core" },
];

export const PRELIMS_PYQ_OPTIONS = [ "Tookit PYQ book","21000 PYQ Book", "Any Other PYQ"] as const;

export const PRELIMS_TEST_SERIES_OPTIONS = ["PTP", "Any Other"] as const;

export const MAINS_TEST_SERIES = ["MTP", "Any Other"] as const;

export const OPTIONAL_SUBJECT_OPTIONS = [
  "Agriculture",
  "Animal Husbandry and Veterinary Science",
  "Anthropology",
  "Botany",
  "Chemistry",
  "Civil Engineering",
  "Commerce and Accountancy",
  "Economics",
  "Electrical Engineering",
  "Geography",
  "Geology",
  "History",
  "Law",
  "Management",
  "Mathematics",
  "Mechanical Engineering",
  "Medical Science",
  "Philosophy",
  "Physics",
  "Political Science and International Relations",
  "Psychology",
  "Public Administration",
  "Sociology",
  "Statistics",
  "Zoology",
  "Literature",
] as const;

export const RESOURCE_OPTIONS_BY_ROW: Record<string, string[]> = {
  "gs1-history-ancient": [
    "Notes",
    "Neeraj Rao lectures",
    "RS Sharma (terms at chapter end)",
  ],
  "gs1-history-medieval": ["Toolkit PYQ book"],
  "gs1-history-modern": ["PYQ PDFs", "Akarsh Soni IRS PYQ notes"],
  "gs1-history-art-culture": ["PYQ PDFs", "Akarsh Soni IRS PYQ notes"],
  "gs1-geography-indian": [
    "NCERT 11",
    "Samkalp notes",
    "Sudarshan Gujjar lectures",
  ],
  "gs1-geography-map": ["PYQ map marking"],
  "gs1-society": ["Vision IAS Smriti Sharma lectures"],
  "gs2-polity-constitution": ["Laxmikant prioritization"],
  "gs2-social-justice": ["Vision lectures notes"],
  "gs3-economy": ["Shivin lectures"],
  "gs3-environment-ecology": ["PYQ", "Map practice", "Akarsh PYQ notes"],
  "gs4-ethics-theory": ["Smriti ma'am notes", "MTP practice"],
  "gs4-ethics-case-studies": ["MTP2.0 practice"],
  "csat-quant": ["FAST TRACK", "Feel Free to Learn lectures"],
  "csat-comprehension": ["PTP (Abhishek Tiwari Sir)"],
  optional: [...OPTIONAL_SUBJECT_OPTIONS],
};
