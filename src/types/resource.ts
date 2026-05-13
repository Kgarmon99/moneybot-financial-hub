export type ResourceCategory = 
  | 'calculator' 
  | 'tool' 
  | 'resource' 
  | 'podcast' 
  | 'book' 
  | 'course';

export type ResourceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  level: ResourceLevel;
  tags: string[];
  free: boolean;
  author?: string;
  image?: string;
  dateAdded: string;
  featured?: boolean;
}

export interface ResourceSubmission {
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  level: ResourceLevel;
  tags: string[];
  free: boolean;
  author?: string;
  submittedBy: string;
  submittedAt: string;
}
