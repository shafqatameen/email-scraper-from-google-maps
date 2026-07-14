const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('sudo pm2 logs --nostream email-scraper', (err, stream) => {
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
