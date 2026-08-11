export interface Role {
  role: string;
  desc: string;
  arc: string;
}

export interface PlanPhase {
  phase: string;
  detail: string;
}

export interface Signals {
  do: string[];
  dont: string[];
}

export interface PlaybookContent {
  tagline: string;
  oneLiner: string;
  forYouIf: string[];
  study: string[];
  roles: Role[];
  recruiters: string[];
  skills: string[];
  plan: PlanPhase[];
  signals: Signals;
  colleges: string[];
}
