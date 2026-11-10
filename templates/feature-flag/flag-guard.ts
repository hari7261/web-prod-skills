export interface FlagConfig {
  key: string;
  defaultEnabled: boolean;
  rolloutPercentage: number;
  killSwitch: boolean;
}

export function isFlagEnabled(config: FlagConfig, bucket0to99: number): boolean {
  if (!config.killSwitch) return false;
  if (bucket0to99 < 0 || bucket0to99 >= 100) return config.defaultEnabled;
  return bucket0to99 < config.rolloutPercentage;
}

