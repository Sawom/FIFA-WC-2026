export interface Player {
  name: string;
  captain?: boolean;
}

export interface Goal {
  name: string;
  minute: string;
  penalty?: boolean;
  owngoal?: boolean;
}

export interface Substitution {
  on: string;
  off: string;
  minute: string;
}

export interface Booking {
  type: "Y" | "R" | string;
  name: string;
  minute: string;
}

export interface Lineup {
  starter: Player[];
  bench: Player[];
  subs: Substitution[];
}

export interface Referee {
  name: string;
  country: string;
}

export interface WorldCupMatch {
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  score: {
    ft: [number, number];
    ht: [number, number];
  };
  goals1: Goal[];
  goals2: Goal[];
  ground: string;
  attendance: number;
  lineup: [Lineup, Lineup];
  bookings: [Booking[], Booking[]];
  referees: Referee[];
}

export interface WorldCupData {
  name: string;
  matches: WorldCupMatch[];
}
