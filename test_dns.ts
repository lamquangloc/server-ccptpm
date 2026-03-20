import dns from 'dns';

const hostname = '_mongodb._tcp.cluster0.y7sro.mongodb.net';

dns.resolveSrv(hostname, (err, addresses) => {
  if (err) {
    console.error('DNS SRV Resolution Error:', err);
  } else {
    console.log('DNS SRV Resolution Success:', addresses);
  }
});
