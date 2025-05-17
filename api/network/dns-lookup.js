// Serverless function for DNS lookup
import { promises as dns } from 'dns';

export default async function handler(req, res) {
  // Set CORS headers to allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get the domain from the request
  const { domain, recordType } = req.query;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }
  
  try {
    // Format domain (remove protocol if present)
    let formattedDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove path and query parameters if present
    formattedDomain = formattedDomain.split('/')[0];

    // Perform the DNS lookup based on the record type
    const result = await lookupDnsRecords(formattedDomain, recordType || 'ALL');

    // Cache results for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(result);
    
  } catch (error) {
    return res.status(500).json({ 
      error: `Error performing DNS lookup: ${error.message}`, 
      domain 
    });
  }
}

async function lookupDnsRecords(domain, recordType) {
  const records = [];
  const typeHandlers = {
    'A': async () => {
      try {
        const addresses = await dns.resolve4(domain);
        return addresses.map(value => ({
          type: 'A',
          name: domain,
          value,
          ttl: 0 // TTL requires a different API call, simplified here
        }));
      } catch (error) {
        return [];
      }
    },
    'AAAA': async () => {
      try {
        const addresses = await dns.resolve6(domain);
        return addresses.map(value => ({
          type: 'AAAA',
          name: domain,
          value,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'CNAME': async () => {
      try {
        const addresses = await dns.resolveCname(domain);
        return addresses.map(value => ({
          type: 'CNAME',
          name: domain,
          value,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'MX': async () => {
      try {
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords.map(mx => ({
          type: 'MX',
          name: domain,
          value: `${mx.priority} ${mx.exchange}`,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'NS': async () => {
      try {
        const nameservers = await dns.resolveNs(domain);
        return nameservers.map(value => ({
          type: 'NS',
          name: domain,
          value,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'TXT': async () => {
      try {
        const txtRecords = await dns.resolveTxt(domain);
        return txtRecords.map(txt => ({
          type: 'TXT',
          name: domain,
          value: txt.join(' '),
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'SOA': async () => {
      try {
        const soa = await dns.resolveSoa(domain);
        return [{
          type: 'SOA',
          name: domain,
          value: `${soa.nsname} ${soa.hostmaster} ${soa.serial} ${soa.refresh} ${soa.retry} ${soa.expire} ${soa.minttl}`,
          ttl: soa.minttl
        }];
      } catch (error) {
        return [];
      }
    },
    'PTR': async () => {
      try {
        // Only works for IP addresses, simplified implementation
        const ptrRecords = await dns.reverse(domain).catch(() => []);
        return ptrRecords.map(value => ({
          type: 'PTR',
          name: domain,
          value,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    },
    'SRV': async () => {
      try {
        const srvRecords = await dns.resolveSrv(domain);
        return srvRecords.map(srv => ({
          type: 'SRV',
          name: domain,
          value: `${srv.priority} ${srv.weight} ${srv.port} ${srv.name}`,
          ttl: 0
        }));
      } catch (error) {
        return [];
      }
    }
  };

  // If record type is ALL, fetch all record types
  if (recordType === 'ALL') {
    // Run all lookups in parallel
    const recordTypes = Object.keys(typeHandlers);
    const results = await Promise.all(
      recordTypes.map(type => typeHandlers[type]())
    );
    
    // Flatten results
    records.push(...results.flat());
  } else if (typeHandlers[recordType]) {
    // Fetch specific record type
    const result = await typeHandlers[recordType]();
    records.push(...result);
  }

  return {
    domain,
    records
  };
}