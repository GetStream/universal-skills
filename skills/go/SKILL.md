---
name: go
description: How Go is written in our projects - stack, errors, logging, spans, context, goroutines, comments, performance and tests. Read before writing or changing Go code or Go tests.
paths:
  - "**/*.go"
---

# Go

## Services/ Infra

Services we like to use:

- Stream: For Agents, Chat, Video and Moderation
- Planetscale: Postgres/database hosting
- Cloudflare: For storage, media etc
- Resend: Emails
- Stripe: Payments

## Packages

- rueidis for redis
- bun for postgres and ORM
- pressly/goose for migrations
- stretchr/testify for testing
- Huma for OpenAPI and Chi for routing
- Use OpenAPI for proper client side SDK generation
- koanf for yaml configs
- otel for monitoring
- Asynq for queuing if you need it

## Rules

- Check the `go` directive of the nearest `go.mod` before you use a newer feature. In a repo with several modules, each can pin a different version.
- Wrap an error with `%w`. Start the message with the package name and say what was being done, with no "failed to": `oauth2cc: token: %w`. Return the error as is when it already says enough. If the project attaches stack traces, do it once, where an error enters the code base, then pass it up unchanged.
- Handle an error once. Never log an error and also return it.
- Log with `log/slog`. Put the data in key-value fields, not in the message: `logger.Warn("could not store the subscription", "subscription", sub.ID, "error", err)`.
- An HTTP handler returns its error and does not log it. One request-logging middleware logs it, with its stack, and a 5xx at error level.
- Name a span in lowercase dotted words, the area then the step: `config.read`, `quota.allow`, `checkout.charge`.
- Pass `ctx context.Context` as the first parameter. Do not store a request's context in a struct. A long-lived service may hold a lifetime context made in `New`, together with its cancel function.
- Start no goroutine in `init()` or in a constructor. Start it in `Start(ctx)` or `Run(ctx)`, so the caller owns its lifetime.
- Return a nil slice for "none". A JSON response is the exception: it sends `[]`, not `null`.
- Defensive code (a retry, a fallback, a second check) gets a comment that names the concrete threat: concurrent writers, a network failure the caller retries, malformed input. If you cannot name one, do not add it.
- Every outbound call and stream has a timeout.

## Comments

- A comment says why, once, in the fewest words. Do not narrate what the code does.
- Write no new ticket, PR or plan reference in a comment: it belongs in the commit and the PR. Leave the ones already there.
- A link to a public, stable source (an RFC, an engine's documented limits) is fine. The comment still states the fact.

## Performance

- Redis client side caching is great for configs etc that don't change often.
- Check how many Redis and Postgres queries a given API call does. Watch for N+1 queries.
- Reducing queries or pipelining redis is often effective.
- sync.Pool can be important for hot allocations, see where you can use it.

## Tests

Before adding a test or a test suite, read [Go testing](testing/index.md). It links to the guide for each kind of test: HTTP controllers, the database store and fixtures.
