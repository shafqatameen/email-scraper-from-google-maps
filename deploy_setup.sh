#!/bin/bash

# Exit on error
set -e

echo "=================================================="
echo " Starting Email Scraper VPS Deployment Setup"
echo "=================================================="

# 1. Update system packages
echo "--> Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
sudo -E apt-get update
sudo -E apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# 2. Install curl, git, software-properties-common
echo "--> Installing basic utilities..."
sudo -E apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" curl git software-properties-common

# 3. Install Node.js (v20)
echo "--> Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# 4. Install Redis
echo "--> Installing Redis..."
sudo -E apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 5. Install PostgreSQL
echo "--> Installing PostgreSQL..."
sudo -E apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" postgresql postgresql-contrib

# Configure PostgreSQL Database and User
echo "--> Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE scraperdb;" || echo "Database may already exist."
sudo -u postgres psql -c "CREATE USER scraper_admin WITH PASSWORD 'ScraperAdminPass123';" || echo "User may already exist."
sudo -u postgres psql -c "ALTER USER scraper_admin WITH PASSWORD 'ScraperAdminPass123';"
sudo -u postgres psql -c "ALTER ROLE scraper_admin SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE scraper_admin SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE scraper_admin SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scraperdb TO scraper_admin;"
# For Prisma in newer Postgres versions:
sudo -u postgres psql -d scraperdb -c "GRANT ALL ON SCHEMA public TO scraper_admin;"

echo "--> Updating pg_hba.conf to allow scraper_admin connections..."
PG_CONF=$(sudo -u postgres psql -t -P format=unaligned -c "show hba_file;")
if [ ! -z "$PG_CONF" ]; then
    # Insert the trust rule at the top of the file so it takes precedence
    sudo sed -i '1s/^/local   all             scraper_admin                                   trust\n/' $PG_CONF
    sudo sed -i '1s/^/host    all             scraper_admin           127.0.0.1\/32            trust\n/' $PG_CONF
    sudo sed -i '1s/^/host    all             scraper_admin           ::1\/128                 trust\n/' $PG_CONF
    sudo systemctl restart postgresql
fi

# 6. Install Nginx
echo "--> Installing Nginx..."
sudo -E apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx

# 7. Setup Application Directory
echo "--> Cloning the repository..."
APP_DIR="/var/www/email-scraper"
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

if [ -d "$APP_DIR" ]; then
    echo "Directory exists. Pulling latest code..."
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/shafqatameen/email-scraper-from-google-maps.git $APP_DIR
    cd $APP_DIR
fi

# 8. Setup Environment Variables
echo "--> Setting up .env file..."
SOCKET_DIR=$(sudo -u postgres psql -t -P format=unaligned -c "show unix_socket_directories;" | awk -F',' '{print $1}' | tr -d '[:space:]')
if [ -z "$SOCKET_DIR" ]; then
    SOCKET_DIR="/var/run/postgresql"
fi

DB_PORT=$(sudo -u postgres psql -t -P format=unaligned -c "show port;" | tr -d '[:space:]')
if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
fi

cat <<EOF > .env
DATABASE_URL="postgresql://scraper_admin:ScraperAdminPass123@localhost:${DB_PORT}/scraperdb?host=${SOCKET_DIR}&schema=public"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
EOF

# 9. Install Dependencies
echo "--> Installing npm dependencies..."
npm install

# 10. Install Playwright Dependencies
echo "--> Installing Playwright dependencies..."
npx playwright install --with-deps

# 11. Run Prisma DB Push
echo "--> Syncing Database Schema..."
npx prisma db push

# 12. Build the Next.js App
echo "--> Generating Prisma Client..."
npx prisma generate

echo "--> Building the Next.js application..."
npm run build

# 13. Install PM2 and Start the Application
echo "--> Installing PM2 and starting the app..."
sudo npm install -g pm2
cd /var/www/email-scraper

# Start the application on a custom port because port 3000 is taken by another container
sudo pm2 delete all || true
sudo PORT=3050 pm2 start npm --name "email-scraper" -- start
sudo pm2 save
sudo pm2 startup systemd -u root --hp /root || true
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root || true

# 14. Open Firewall Port
echo "--> Opening firewall for port 3050..."
sudo ufw allow 3050/tcp || true

echo ""
echo "--- Deployment finished ---"
echo "You can now access your application at: http://194.233.90.130:3050"
echo "Note: Native Nginx proxy was skipped because Coolify/Traefik is already managing port 80 on this server."
