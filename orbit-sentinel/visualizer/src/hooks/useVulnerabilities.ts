import { useMemo, useCallback } from "react";
import type { GraphNode, GraphLink } from "../types";

interface VulnerabilityInfo {
  fileId: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  cve?: string;
  cvssScore?: number;
}

interface VulnerabilityMap {
  [fileId: string]: VulnerabilityInfo[];
}

export function useVulnerabilities(nodes: GraphNode[], links: GraphLink[]): {
  vulnerabilitiesByFile: VulnerabilityMap;
  criticalCount: number;
  highCount: number;
  hasVulnerabilities: boolean;
  getFileVulnerabilities: (fileId: string) => VulnerabilityInfo[];
} {
  const vulnerabilitiesByFile = useMemo((): VulnerabilityMap => {
    const map: VulnerabilityMap = {};
    
    for (const node of nodes) {
      if (node.type === "File" && node.properties) {
        const vulns: VulnerabilityInfo[] = [];
        
        if (node.properties.vulnerabilities) {
          const vulnData = node.properties.vulnerabilities as Array<{
            severity: string;
            title: string;
            description: string;
            cve?: string;
            cvss_score?: number;
          }>;
          
          for (const v of vulnData) {
            vulns.push({
              fileId: node.id,
              severity: (v.severity as "critical" | "high" | "medium" | "low") || "medium",
              title: v.title || "Security Finding",
              description: v.description || "",
              cve: v.cve,
              cvssScore: v.cvss_score,
            });
          }
        }
        
        if (node.properties.vulnerability_count && vulns.length === 0) {
          const count = Number(node.properties.vulnerability_count) || 0;
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              vulns.push({
                fileId: node.id,
                severity: "high" as const,
                title: `Security Finding ${i + 1}`,
                description: "Vulnerability detected in this file",
              });
            }
          }
        }
        
        if (vulns.length > 0) {
          map[node.id] = vulns;
        }
      }
    }
    
    return map;
  }, [nodes]);

  const criticalCount = useMemo(() => {
    let count = 0;
    for (const vulns of Object.values(vulnerabilitiesByFile)) {
      for (const v of vulns) {
        if (v.severity === "critical") count++;
      }
    }
    return count;
  }, [vulnerabilitiesByFile]);

  const highCount = useMemo(() => {
    let count = 0;
    for (const vulns of Object.values(vulnerabilitiesByFile)) {
      for (const v of vulns) {
        if (v.severity === "high") count++;
      }
    }
    return count;
  }, [vulnerabilitiesByFile]);

  const hasVulnerabilities = useMemo(() => {
    return Object.keys(vulnerabilitiesByFile).length > 0;
  }, [vulnerabilitiesByFile]);

  const getFileVulnerabilities = useCallback((fileId: string) => {
    return vulnerabilitiesByFile[fileId] || [];
  }, [vulnerabilitiesByFile]);

  return {
    vulnerabilitiesByFile,
    criticalCount,
    highCount,
    hasVulnerabilities,
    getFileVulnerabilities,
  };
}