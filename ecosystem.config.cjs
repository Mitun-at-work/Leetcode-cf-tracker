module.exports = {
  apps: [
    {
      name: 'cpp-executor',
      script: './cpp-executor/build/cpp-executor',
      cwd: '/home/mitun/Desktop/WP/Leetcode-cf-tracker/cpp-executor/build',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'backend-server',
      script: 'npm run server:dev',
      cwd: '/home/mitun/Desktop/WP/Leetcode-cf-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'frontend-dev',
      script: 'npm run dev',
      cwd: '/home/mitun/Desktop/WP/Leetcode-cf-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};