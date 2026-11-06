---
name: infra
description: Infra and hosting best practices
---

First understand what the user's goal is
Do they want a quick preview to share that runs on their laptop
Or do they want hosting setup as a prototype, or production hosting (more expensive)

# Quick Preview

Use a quick cloudflare tunnel for previews that the user wants to share
https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/?utm_source=chatgpt.com

# Hosting - Prototype

For hosting a prototype railway is the fastest way to get it up and running

curl -fsSL agents.railway.com | sh
railway setup agent

# Hosting - Production

Planetscale for postgres
Google cloud for servers
K8, terraform and Helm