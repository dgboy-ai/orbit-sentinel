export interface SentinelConfig {
  gitlabHost: string;
  groupPath: string;
  orbitApiEndpoint: string;
  orbitTokenEnvVar: string;
  maxTraversalDepth: number;
  maxHistoricalMatches: number;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  simulationDefaults: {
    maxPathDepth: number;
    neighborMaxDepth: number;
  };
}

const config: SentinelConfig = {
  gitlabHost: process.env.GITLAB_HOST ?? "gitlab.com",
  groupPath: process.env.ORBIT_GROUP_PATH ?? "",
  orbitApiEndpoint: process.env.ORBIT_API_ENDPOINT ?? "https://gitlab.com/api/v4/orbit",
  orbitTokenEnvVar: "GITLAB_ACCESS_TOKEN",
  maxTraversalDepth: 5,
  maxHistoricalMatches: 10,
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.85,
  },
  simulationDefaults: {
    maxPathDepth: 4,
    neighborMaxDepth: 3,
  },
};

export function getConfig(): SentinelConfig {
  return config;
}
