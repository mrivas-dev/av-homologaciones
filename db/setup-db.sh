#!/bin/bash
set -e

# Move to the project root
cd "$(dirname "$0")/.."

echo "🚀 Setting up the Vehicle Homologation System with Docker..."

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo "❌ Error: backend/.env file not found. Please create it with the required database configuration."
    echo "Example configuration:"
    echo ""
    echo "# Database Configuration"
    echo "DB_HOST=localhost"
    echo "DB_PORT=3306"
    echo "DB_NAME=av_db"
    echo "DB_USER=root"
    echo "DB_PASSWORD=your_password"
    echo ""
    echo "# Server Configuration"
    echo "PORT=4000"
    exit 1
fi

# Load environment variables from backend/.env
export $(grep -v '^#' backend/.env | xargs)

# Update docker-compose with the correct environment variables
sed -i.bak "s/MYSQL_ROOT_PASSWORD:.*/MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}/" db/docker-compose.yml
sed -i.bak "s/MYSQL_DATABASE:.*/MYSQL_DATABASE: ${DB_NAME}/" db/docker-compose.yml
sed -i.bak "s/MYSQL_USER:.*/MYSQL_USER: ${DB_USER}/" db/docker-compose.yml
sed -i.bak "s/MYSQL_PASSWORD:.*/MYSQL_PASSWORD: ${DB_PASSWORD}/" db/docker-compose.yml

# Clean up backup files
rm -f db/docker-compose.yml.bak

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
cd ..

# Start Docker containers in detached mode
echo "🐳 Starting Docker containers..."
cd db
docker-compose up -d
cd ..

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
until docker-compose -f db/docker-compose.yml exec -T db mysql -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" &>/dev/null; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 2
done

# Set up Prisma
cd backend

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push the schema to the database
echo "🚀 Pushing database schema..."
npx prisma db push

# Run the database initialization script
if [ -f "scripts/init-db.ts" ]; then
    echo "🌱 Seeding initial data..."
    npx ts-node scripts/init-db.ts
fi

cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Services:"
echo "- MySQL: localhost:${DB_PORT}"
echo "- Database: ${DB_NAME}"
echo "- Adminer (database GUI): http://localhost:8080"
echo ""
echo "📝 Database credentials:"
echo "- Host: localhost"
echo "- Port: ${DB_PORT}"
echo "- Database: ${DB_NAME}"
echo "- Username: ${DB_USER}"
echo "- Password: ${DB_PASSWORD}"
echo ""
echo "To stop the services, run: docker-compose -f db/docker-compose.yml down"
