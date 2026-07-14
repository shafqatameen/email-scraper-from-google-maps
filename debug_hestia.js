const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('sudo /usr/local/hestia/bin/v-add-firewall-rule ACCEPT 0.0.0.0/0 3050 TCP email-scraper || true', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '194.233.90.130',
  port: 22,
  username: 'shafqat',
  password: 'System@123'
});
