export interface ResourceMappingTemplateRow {
  rowKey: string;
  paper: string;
  subject: string;
  part: string;
}

export const RESOURCE_MAPPING_TEMPLATE: ResourceMappingTemplateRow[] = [
  { rowKey: 'gs1-history-ancient', paper: 'GS 1', subject: 'History', part: 'Ancient' },
  { rowKey: 'gs1-history-medieval', paper: 'GS 1', subject: 'History', part: 'Medieval' },
  { rowKey: 'gs1-history-modern', paper: 'GS 1', subject: 'History', part: 'Modern' },
  { rowKey: 'gs1-history-art-culture', paper: 'GS 1', subject: 'History', part: 'Art & Culture' },
  { rowKey: 'gs1-history-world', paper: 'GS 1', subject: 'History', part: 'World History' },
  { rowKey: 'gs1-history-post-independence', paper: 'GS 1', subject: 'History', part: 'Post Independence' },
  { rowKey: 'gs1-geography-indian', paper: 'GS 1', subject: 'Geography', part: 'Indian' },
  { rowKey: 'gs1-geography-world', paper: 'GS 1', subject: 'Geography', part: 'World' },
  { rowKey: 'gs1-geography-map', paper: 'GS 1', subject: 'Geography', part: 'Map' },
  { rowKey: 'gs1-society', paper: 'GS 1', subject: 'Society', part: 'Core' },
  { rowKey: 'gs2-polity-constitution', paper: 'GS 2', subject: 'Polity', part: 'Constitution' },
  { rowKey: 'gs2-polity-governance', paper: 'GS 2', subject: 'Polity', part: 'Governance' },
  { rowKey: 'gs2-polity-ir', paper: 'GS 2', subject: 'Polity', part: 'International Relations' },
  { rowKey: 'gs2-social-justice', paper: 'GS 2', subject: 'Social Justice', part: 'Core' },
  { rowKey: 'gs3-economy', paper: 'GS 3', subject: 'Economy', part: 'Core' },
  { rowKey: 'gs3-agriculture', paper: 'GS 3', subject: 'Agriculture', part: 'Core' },
  { rowKey: 'gs3-internal-security', paper: 'GS 3', subject: 'Internal Security', part: 'Core' },
  { rowKey: 'gs3-science-tech', paper: 'GS 3', subject: 'Science & Tech', part: 'Core' },
  { rowKey: 'gs3-environment-ecology', paper: 'GS 3', subject: 'Environment & Ecology', part: 'Core' },
  { rowKey: 'gs3-disaster-management', paper: 'GS 3', subject: 'Disaster Management', part: 'Core' },
  { rowKey: 'gs4-ethics-theory', paper: 'GS 4', subject: 'Ethics', part: 'Theory' },
  { rowKey: 'gs4-ethics-case-studies', paper: 'GS 4', subject: 'Ethics', part: 'Case Studies' },
  { rowKey: 'csat-quant', paper: 'CSAT', subject: 'CSAT', part: 'Quant' },
  { rowKey: 'csat-reasoning', paper: 'CSAT', subject: 'CSAT', part: 'Reasoning' },
  { rowKey: 'csat-comprehension', paper: 'CSAT', subject: 'CSAT', part: 'Comprehension' },
  { rowKey: 'optional', paper: 'Optional', subject: 'Optional', part: 'Core' },
  { rowKey: 'current-affairs', paper: 'Current Affairs', subject: 'Current Affairs', part: 'Core' },
];

export const PRELIMS_PYQ_OPTIONS = ['Tookit PYQ book', '21000 PYQ Book', 'Any Other'] as const;
export const PRELIMS_TEST_SERIES_OPTIONS = ['PTP', 'Any Other'] as const;
export const MAINS_TEST_SERIES_OPTIONS = ['MTP', 'Any Other'] as const;
