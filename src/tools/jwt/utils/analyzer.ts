/**
 * JWT Security Analyzer
 * Analyzes JWT tokens for security best practices
 */

export type SeverityLevel = 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  recommendation: string;
}

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  exp?: number;
  iat?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  [key: string]: unknown;
}

export interface JwtInfo {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  isValid?: boolean;
}

// Security rule checks
const checkNoneAlgorithm = (jwt: JwtInfo): Finding | null => {
  if (jwt.header.alg === 'none') {
    return {
      id: 'JWT-NONE-ALG',
      title: 'Unsigned token (alg: none)',
      description: 'This token uses the "none" algorithm, which means it has no cryptographic signature for verification.',
      severity: 'high',
      recommendation: 'UNSIGNED TOKEN — do not accept in production. Always reject tokens with alg: none.'
    };
  }
  return null;
};

const checkExpiration = (jwt: JwtInfo): Finding | null => {
  const expTimestamp = jwt.payload.exp;
  
  if (!expTimestamp) {
    return {
      id: 'JWT-NO-EXP',
      title: 'No expiration claim (exp)',
      description: 'This token does not have an expiration time, which means it could be valid forever.',
      severity: 'medium',
      recommendation: 'Always include an "exp" claim to limit token lifetime. Short-lived tokens (< 1 hour) are recommended.'
    };
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (expTimestamp < now) {
    return {
      id: 'JWT-EXPIRED',
      title: 'Token has expired',
      description: `This token expired on ${new Date(expTimestamp * 1000).toLocaleString()}.`,
      severity: 'medium',
      recommendation: 'This token should be rejected by any verifier checking the exp claim.'
    };
  }
  
  // Check if the token expires more than 24 hours in the future
  const oneDayFromNow = now + (24 * 60 * 60);
  if (expTimestamp > oneDayFromNow) {
    const daysValid = Math.round((expTimestamp - now) / (24 * 60 * 60));
    return {
      id: 'JWT-LONG-EXP',
      title: `Long expiration time (${daysValid} days)`,
      description: `This token will be valid for ${daysValid} days, which is longer than recommended.`,
      severity: 'low',
      recommendation: 'Use shorter lived tokens, preferably less than 1 hour for sensitive operations.'
    };
  }
  
  return null;
};

const checkIssueTime = (jwt: JwtInfo): Finding | null => {
  const iatTimestamp = jwt.payload.iat;
  
  if (!iatTimestamp) {
    return {
      id: 'JWT-NO-IAT',
      title: 'No issued-at time (iat)',
      description: 'This token does not have an issued-at time, which makes it harder to determine token age.',
      severity: 'low',
      recommendation: 'Include an "iat" claim to enable precise token age calculation and revocation strategies.'
    };
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (iatTimestamp > now + 60) { // Allow 1 minute clock skew
    return {
      id: 'JWT-FUTURE-IAT',
      title: 'Token issued in the future',
      description: `This token claims to be issued at ${new Date(iatTimestamp * 1000).toLocaleString()}, which is in the future.`,
      severity: 'medium',
      recommendation: 'Check for clock skew between your servers or potential manipulation.'
    };
  }
  
  return null;
};

const checkNotBefore = (jwt: JwtInfo): Finding | null => {
  const nbfTimestamp = jwt.payload.nbf;
  
  if (nbfTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    if (nbfTimestamp > now + 60) { // Allow 1 minute clock skew
      return {
        id: 'JWT-FUTURE-NBF',
        title: 'Token not valid yet',
        description: `This token will become valid at ${new Date(nbfTimestamp * 1000).toLocaleString()}.`,
        severity: 'info',
        recommendation: 'The token should be rejected until the "nbf" time is reached.'
      };
    }
  }
  
  return null;
};

const checkWeakAlgorithm = (jwt: JwtInfo): Finding | null => {
  const weakAlgorithms: { [key: string]: SeverityLevel } = {
    'HS256': 'low',
    'RS256': 'info', // Still widely used but moving to PS or ES is better
  };
  
  const alg = jwt.header.alg;
  if (weakAlgorithms[alg]) {
    let description = '';
    let recommendation = '';
    
    if (alg === 'HS256') {
      description = 'This token uses HS256, which may be vulnerable if used with short or weak secrets.';
      recommendation = 'Consider using at least HS384 or HS512 with a strong secret (≥32 bytes), or switch to a public key algorithm like ES256.';
    } else if (alg === 'RS256') {
      description = 'This token uses RS256, which is common but has known issues with padding oracles.';
      recommendation = 'Consider using PS256 (RSA-PSS) or ES256 (ECDSA) for better security.';
    }
    
    return {
      id: `JWT-WEAK-ALG-${alg}`,
      title: `Potentially weak algorithm: ${alg}`,
      description,
      severity: weakAlgorithms[alg],
      recommendation
    };
  }
  
  return null;
};

const checkAudience = (jwt: JwtInfo): Finding | null => {
  if (!jwt.payload.aud) {
    return {
      id: 'JWT-NO-AUD',
      title: 'No audience claim (aud)',
      description: 'This token does not specify an intended audience, which may allow it to be accepted by unintended services.',
      severity: 'low',
      recommendation: 'Include an "aud" claim to restrict which services should accept this token.'
    };
  }
  
  return null;
};

const checkKid = (jwt: JwtInfo): Finding | null => {
  if (!jwt.header.kid && jwt.header.alg && !jwt.header.alg.startsWith('HS')) {
    return {
      id: 'JWT-NO-KID',
      title: 'Missing key identifier (kid)',
      description: 'This token uses an asymmetric algorithm but does not include a key identifier in the header.',
      severity: 'low',
      recommendation: 'Include a "kid" claim in the header to help recipients identify which key should be used for verification.'
    };
  }
  
  return null;
};

/**
 * Analyze a JWT token for potential security issues
 * @param jwt The parsed JWT information
 * @returns Array of security findings
 */
export const analyzeToken = (jwt: JwtInfo): Finding[] => {
  const findings: Finding[] = [];
  
  // Run all security checks
  const checks = [
    checkNoneAlgorithm,
    checkExpiration,
    checkIssueTime,
    checkNotBefore,
    checkWeakAlgorithm,
    checkAudience,
    checkKid,
  ];
  
  for (const check of checks) {
    const finding = check(jwt);
    if (finding) {
      findings.push(finding);
    }
  }
  
  return findings;
};

/**
 * Get severity emoji for a finding
 * @param severity The severity level
 * @returns Emoji representing the severity
 */
export const getSeverityEmoji = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟠';
    case 'low':
      return '🟡';
    case 'info':
    default:
      return 'ℹ️';
  }
};

/**
 * Get CSS class for a finding severity
 * @param severity The severity level
 * @returns CSS class name
 */
export const getSeverityClass = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};