#!/bin/bash

# LeetCode CF Tracker Services Manager
# This script helps manage the PM2 services for the LeetCode CF Tracker app

case "$1" in
    start)
        echo "Starting LeetCode CF Tracker services..."
        pm2 start ecosystem.config.cjs
        ;;
    stop)
        echo "Stopping LeetCode CF Tracker services..."
        pm2 stop ecosystem.config.cjs
        ;;
    restart)
        echo "Restarting LeetCode CF Tracker services..."
        pm2 restart ecosystem.config.cjs
        ;;
    status)
        echo "LeetCode CF Tracker services status:"
        pm2 status
        ;;
    logs)
        echo "Showing logs for all services (Ctrl+C to exit):"
        pm2 logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Services managed:"
        echo "  - cpp-executor (port 8081)"
        echo "  - backend-server (port 3001)"
        echo "  - frontend-dev (port 5173)"
        echo ""
        echo "Auto-start: Services will start automatically on system boot"
        exit 1
        ;;
esac