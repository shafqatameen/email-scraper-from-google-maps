const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const scriptContent = `#!/bin/bash
set -e

echo "=================================================="
echo " Starting Application Update..."
echo "=================================================="

# Go to app directory
cd /var/www/email-scraper || exit

# Stash any local changes that might block a pull
git stash

# Pull the latest changes from GitHub
echo "--> Pulling latest code..."
git pull origin main

# Install dependencies in case they changed
echo "--> Installing dependencies..."
npm install

# Run database migrations
echo "--> Applying database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "--> Generating Prisma client..."
npx prisma generate

# Build the Next.js app
echo "--> Building the Next.js app..."
npm run build

# Restart the PM2 process
echo "--> Restarting the application..."
pm2 restart email-scraper

echo "=================================================="
echo " Update complete!"
echo "=================================================="
`;
  
  conn.exec(`sudo bash -c "cat > /var/www/email-scraper/update.sh" << 'EOF'
${scriptContent}
EOF
sudo chmod +x /var/www/email-scraper/update.sh
`, (err, stream) => {
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
