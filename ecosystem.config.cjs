// PM2 Ecosystem Configuration for Hostinger VPS
module.exports = {
  apps: [{
    name: 'nonsatravels-api',
    cwd: '/var/www/nonsatravels/server',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    error_file: '/var/www/nonsatravels/logs/error.log',
    out_file: '/var/www/nonsatravels/logs/output.log',
    log_file: '/var/www/nonsatravels/logs/combined.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Performance
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=512',
    
    // Restart behavior
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }],

  // Deployment configuration (optional - for pm2 deploy)
  deploy: {
    production: {
      user: 'root',
      host: '72.60.92.188',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/nonsatravels.git',
      path: '/var/www/nonsatravels',
      'pre-deploy-local': '',
      'post-deploy': 'cd server && npm install --production && pm2 reload ecosystem.config.cjs --env production && cd ../client && npm install && npm run build',
      'pre-setup': ''
    }
  }
};
