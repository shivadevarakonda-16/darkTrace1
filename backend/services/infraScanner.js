/**
 * Module 1: Infrastructure Leak Scanner (Simulated Engine)
 * 
 * Analyzes dark web .onion infrastructure metadata against known clearnet databases.
 * Employs an auditable rules engine for cert collisions, status page leaks, SSH host keys,
 * and server banner fingerprinting.
 */

export class InfraScanner {
  constructor(clearnetDb = []) {
    this.clearnetDb = clearnetDb;
  }

  /**
   * Set or update clearnet infrastructure reference dataset
   */
  setClearnetDb(db) {
    this.clearnetDb = db;
  }

  /**
   * Scan single onion infrastructure record against clearnet database
   */
  scanOnionRecord(onionRecord) {
    const findings = [];
    let matchScore = 0.05; // Base ambient noise
    let matchedClearnetHost = null;

    if (!onionRecord) {
      return {
        matched: false,
        score: 0.05,
        confidenceTier: 'NONE',
        findings: ['No infrastructure telemetry available'],
        indicators: {}
      };
    }

    // Match against clearnet DB
    for (const clearnet of this.clearnetDb) {
      const certMatch = onionRecord.ssl_cert?.sha256_fingerprint &&
        onionRecord.ssl_cert.sha256_fingerprint.toLowerCase() === clearnet.ssl_cert?.sha256_fingerprint?.toLowerCase();
      
      const sshMatch = onionRecord.ssh_host_key &&
        onionRecord.ssh_host_key === clearnet.ssh_host_key;

      const faviconMatch = onionRecord.favicon_hash &&
        onionRecord.favicon_hash === clearnet.favicon_hash;

      const bannerMatch = onionRecord.server_banner &&
        onionRecord.server_banner === clearnet.server_banner;

      // Rule 1: High Severity - Exposed Status Page + Cert Fingerprint Match
      if (onionRecord.status_page_exposed && certMatch) {
        matchScore = Math.max(matchScore, 0.95);
        matchedClearnetHost = clearnet;
        findings.push({
          rule: 'RULE_INFRA_01_CRITICAL',
          severity: 'CRITICAL',
          description: `Exposed status page leaked direct link to clearnet IP ${clearnet.ip} with matching SSL cert (${onionRecord.ssl_cert.sha256_fingerprint.substring(0, 16)}...)`,
          weight: 0.95
        });
      }
      // Rule 2: High Severity - Exact SSH Host Key Reuse
      else if (sshMatch) {
        matchScore = Math.max(matchScore, 0.88);
        matchedClearnetHost = clearnet;
        findings.push({
          rule: 'RULE_INFRA_02_SSH_KEY',
          severity: 'HIGH',
          description: `Identical SSH Host Key fingerprint [${onionRecord.ssh_host_key}] shared between .onion and clearnet node ${clearnet.hostname} (${clearnet.ip})`,
          weight: 0.88
        });
      }
      // Rule 3: High Severity - Exact Clearnet SSL Certificate presented on Tor Onion port
      else if (certMatch) {
        matchScore = Math.max(matchScore, 0.82);
        matchedClearnetHost = clearnet;
        findings.push({
          rule: 'RULE_INFRA_03_CERT_REUSE',
          severity: 'HIGH',
          description: `SSL certificate SHA-256 fingerprint matches clearnet domain ${clearnet.domain} (${clearnet.ip})`,
          weight: 0.82
        });
      }
      // Rule 4: Moderate - Favicon Hash + Specific Server Banner + Leaked Timezone
      else if (faviconMatch && bannerMatch) {
        matchScore = Math.max(matchScore, 0.58);
        matchedClearnetHost = clearnet;
        findings.push({
          rule: 'RULE_INFRA_04_BANNER_FAVICON',
          severity: 'MEDIUM',
          description: `Custom web asset (Favicon Murmur3: ${onionRecord.favicon_hash}) and HTTP banner [${onionRecord.server_banner}] match infrastructure in AS${clearnet.asn}`,
          weight: 0.58
        });
      }
    }

    // Secondary heuristic: Status page exposed with IP leak even if not in clearnet DB
    if (onionRecord.status_page_exposed && !matchedClearnetHost && onionRecord.clearnet_ip_leaked) {
      matchScore = Math.max(matchScore, 0.75);
      findings.push({
        rule: 'RULE_INFRA_05_IP_LEAK',
        severity: 'HIGH',
        description: `Tor Hidden Service misconfiguration: /server-status exposed clearnet origin IP: ${onionRecord.clearnet_ip_leaked}`,
        weight: 0.75
      });
    }

    if (findings.length === 0) {
      findings.push({
        rule: 'RULE_INFRA_CLEAN',
        severity: 'INFO',
        description: 'No clearnet infrastructure overlap or status page leaks detected (Tor OPSEC maintained)',
        weight: 0.05
      });
    }

    const confidenceTier = matchScore >= 0.8 ? 'HIGH' : matchScore >= 0.5 ? 'MEDIUM' : 'LOW';

    return {
      matched: matchScore > 0.4,
      score: parseFloat(matchScore.toFixed(3)),
      confidenceTier,
      matchedClearnetHost,
      findings,
      indicators: {
        statusPageExposed: !!onionRecord.status_page_exposed,
        certFingerprint: onionRecord.ssl_cert?.sha256_fingerprint || null,
        serverBanner: onionRecord.server_banner || 'Hidden',
        sshKey: onionRecord.ssh_host_key || null,
        leakedIp: onionRecord.clearnet_ip_leaked || matchedClearnetHost?.ip || null
      }
    };
  }

  /**
   * Compare infrastructure correlation between two actors (A and B)
   */
  compareActorInfra(actorA, actorB) {
    const scanA = this.scanOnionRecord(actorA.infrastructure);
    const scanB = this.scanOnionRecord(actorB.infrastructure);

    let crossMatchScore = 0.05;
    const crossFindings = [];

    // Check direct infrastructure sharing between Actor A and Actor B
    const aOnion = actorA.infrastructure || {};
    const bOnion = actorB.infrastructure || {};

    const sameCert = aOnion.ssl_cert?.sha256_fingerprint &&
      bOnion.ssl_cert?.sha256_fingerprint &&
      aOnion.ssl_cert.sha256_fingerprint.toLowerCase() === bOnion.ssl_cert.sha256_fingerprint.toLowerCase();

    const sameSSH = aOnion.ssh_host_key && bOnion.ssh_host_key && aOnion.ssh_host_key === bOnion.ssh_host_key;
    const sameLeakedIp = (aOnion.clearnet_ip_leaked || scanA.matchedClearnetHost?.ip) &&
      (bOnion.clearnet_ip_leaked || scanB.matchedClearnetHost?.ip) &&
      (aOnion.clearnet_ip_leaked || scanA.matchedClearnetHost?.ip) === (bOnion.clearnet_ip_leaked || scanB.matchedClearnetHost?.ip);

    const sameFavicon = aOnion.favicon_hash && bOnion.favicon_hash && aOnion.favicon_hash === bOnion.favicon_hash;

    if (sameCert && sameLeakedIp) {
      crossMatchScore = 0.94;
      crossFindings.push(`Direct shared origin IP (${aOnion.clearnet_ip_leaked || scanA.matchedClearnetHost.ip}) and SSL certificate fingerprint.`);
    } else if (sameCert) {
      crossMatchScore = 0.86;
      crossFindings.push(`Both actors operate hidden services utilizing identical SSL certificate (${aOnion.ssl_cert.sha256_fingerprint.substring(0, 16)}...).`);
    } else if (sameSSH) {
      crossMatchScore = 0.88;
      crossFindings.push(`Both services share identical SSH host key fingerprint.`);
    } else if (sameLeakedIp) {
      crossMatchScore = 0.80;
      crossFindings.push(`Both onion portals resolve/leak to the same clearnet server IP.`);
    } else if (sameFavicon && aOnion.server_banner === bOnion.server_banner) {
      crossMatchScore = 0.52;
      crossFindings.push(`Custom darknet web assets and HTTP server stack match.`);
    } else {
      // If one of them has an isolated clearnet leak and the other has similar subnet
      crossMatchScore = Math.max(0.05, (scanA.score * 0.5) * (scanB.score * 0.5));
      if (crossMatchScore < 0.15) {
        crossFindings.push('No direct infrastructure, SSL certificate, or host key correlation detected between personas.');
      }
    }

    return {
      score: parseFloat(crossMatchScore.toFixed(3)),
      scanA,
      scanB,
      crossFindings,
      isDirectOverlap: sameCert || sameSSH || sameLeakedIp || (sameFavicon && crossMatchScore > 0.5)
    };
  }
}

export const defaultInfraScanner = new InfraScanner();
