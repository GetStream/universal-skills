---
name: new-project
description: Set up a new project - AGENTS.md, a features folder, the default stack and services, and the skills to install. Use when starting a new project.
---

# New project

In a new project setup AGENTS.md with the following instructions.
Install the required skills after setting up AGENTS.md
Also create the features folder where we will store the markdown files

## Features

Keep markdown files of what you're building in a features folder
So myproject/features

If you're producing SDKs or other things where the instructions change over time.
Simply store a copy of the markdown file so you can easily compare new vs old

At the end of your work update the features folder with what the goal is.
Keep it short and to the point.

## Skills

Design -> npx skills add https://github.com/GetStream/universal-skills/ --skill design
React -> npx skills add https://github.com/GetStream/universal-skills/ --skill react
Backend -> npx skills add https://github.com/GetStream/universal-skills/ --skill go
Infra -> npx skills add https://github.com/GetStream/universal-skills/ --skill infra

## Design

If DESIGN.md is present follow those guidelines instead of the design skill

## External skills

The external skills mentioned in those skills are

- Stream getstream.io/SKILL.md
- npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
- npx skills add https://github.com/addyosmani/web-quality-skills --skill performance
- npx skills add https://github.com/leonxlnx/taste-skill --skill design-taste-frontend
- npx skills add vercel-labs/vgpu
- cloudflare security: https://github.com/cloudflare/security-audit-skill

So ensure those are installed

## Services

React, Go, Postgres 18 and Valkey by default please
Stream (getstream.io) for chat, video, moderation, activity feeds and AI agents
Resend for email
Planetscale for the postgres database
Cloudflare for other things

