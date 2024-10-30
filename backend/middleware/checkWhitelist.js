const ipaddr = require('ipaddr.js');

// IP Whitelist
const whitelist = [
    '127.0.0.1', 
    '::1', // localhost IPv6
    '216.24.57.4', // https://www.ai-recognition-frontend.com // https://ai-recognition-frontend.onrender.com
    '0:0:0:0:0:ffff:d818:3904', // Ipv6 for https://www.ai-recognition-frontend.com // https://ai-recognition-frontend.onrender.com
    '216.24.57.1', // onrender DNS
    '0:0:0:0:0:ffff:d818:3901', // Ipv6 for onrender DNS

    '112.118.145.140', // macOS at home
    '112.118.109.225', // macOS at home
    '0:0:0:0:0:ffff:7076:6de1' // IPv6 for 112.118.109.225
]; // Example whitelist IPs

const normalizeIP = (ip) => {
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    try {
        return ipaddr.process(ip).toString();
    } catch (e) {
        return ip;
    }
};

// Function to check if an IP is in the 10.204.*.* range
const isInWhitelistedRange = (ip) => {
    const ipv4Range = '10.204.0.0/16';
    const ipv6Range = '0:0:0:0:0:ffff:a:cc00/112'; // Equivalent IPv6 range for 10.204.0.0/16
    
    try {
        const addr = ipaddr.parse(ip);
        if (addr.kind() === 'ipv4' && addr.match(ipaddr.parseCIDR(ipv4Range))) {
            return true;
        } else if (addr.kind() === 'ipv6' && addr.match(ipaddr.parseCIDR(ipv6Range))) {
            return true;
        }
    } catch (e) {
        console.error(`Error checking IP address range: ${e}`);
    }
    return false;
};

const checkWhitelist = (req, res, next) => {
    let clientIp = req.ip || req.connection.remoteAddress;
    clientIp = normalizeIP(clientIp);

    if (whitelist.includes(clientIp) || isInWhitelistedRange(clientIp)) {
        next();
    } else {
        console.error(`Unauthorized Public IP: ${clientIp}`);
        res.status(403).json({
            status: { code: 403 },
            error: `Unauthorized Public IP: ${clientIp}`
        });
    }
};

module.exports = checkWhitelist;