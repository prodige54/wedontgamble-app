# Wedontgamble App – Operations Runbook

## Server
- IP: `34.230.36.194`
- User: `Frenel` (SSH key authentication)
- OS: Amazon Linux 2023

## Application paths
- Backend source: `/opt/mywebapp`
- Frontend build: `/var/www/html`
- Frontend source: `/opt/wedontgamble-frontend`
- Nginx config: `/etc/nginx/conf.d/wedontgamble.conf`
- SSL certs: `/etc/letsencrypt/live/wedontgamble.yulcyberhub.click/`

## Process management
- PM2 process name: `mywebapp`
- `pm2 list` – check status
- `pm2 logs mywebapp` – view logs
- `pm2 restart mywebapp` – restart

## Nginx
- `sudo nginx -t && sudo systemctl reload nginx`

## SSL renewal
- Automatic via systemd timer: `certbot-renew.timer`
- Manual dry run: `sudo certbot renew --dry-run --nginx`

## Monitoring
- Health check runs every 5 minutes via cron: `/opt/monitor/health.sh`
- Log: `/var/log/app-health.log`

## Deployment
- Script: `/opt/deploy.sh`
- Pulls latest from GitHub main branch, installs deps, rebuilds frontend, restarts PM2, reloads Nginx.

## Environment variables
- `.env` file in `/opt/mywebapp/` (not in repo). Contains MongoDB Atlas URI, JWT secret, email credentials, etc.

## Firewall / Security
- AWS Security Group allows 22, 80, 443.
- SELinux boolean `httpd_can_network_connect=1` (persistent).
- HSTS, X‑Frame‑Options, X‑Content‑Type‑Options enabled.
- Strong TLS ciphers (TLSv1.2/1.3).
