const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('sudo -u postgres psql -t -P format=unaligned -c "show port;" && sudo -u postgres psql -t -P format=unaligned -c "show listen_addresses;" && sudo -u postgres psql -t -P format=unaligned -c "show unix_socket_directories;"', (err, stream) => {
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
