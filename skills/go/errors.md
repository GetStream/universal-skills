# Errors

Read alongside [SKILL.md](SKILL.md).

## Make and check

- Return `error` last and a literal `nil` on success. Never return a typed nil pointer as an `error`: it is not `nil` to the caller. Check errors before using results that require success. For an `io.Reader`, consume any returned bytes first and preserve a bare `io.EOF` at the end of input.
- Use lowercase messages with the package and operation. Omit "failed to" and trailing punctuation. Write `store: save voice binding: connection refused`.
- Export a sentinel when callers need to recognize a condition, or a type when they need fields. Match with `errors.Is(err, ErrX)` or `errors.AsType[*XError](err)` (Go 1.26+, otherwise `errors.As`). Never compare a wrapped error with `==`, and never branch on error text.

## Wrap

- If the project attaches stack traces, attach one once, where the failure occurs or an external call returns it, then pass the error up unchanged. Capture a sentinel's stack at the return site, not where it is declared.
- Pass errors up unchanged unless you can add useful context. Use `fmt.Errorf("store: save voice binding: %w", err)` when callers may inspect the cause, `%v` when they must not. Translate private causes at package boundaries, e.g. `sql.ErrNoRows` to `store.ErrNoVoice`.
- Use `errors.Join` when multiple failures matter. An `errors.Is` match on one member does not classify the others.

## Handle and log

- Preserve the operation's error. A later `ctx.Err()` can mask a database failure. Stop quietly on caller cancellation. Report dependency deadlines that expire while the request is active. Retry only when safe and time remains.
- Log once where the outcome is decided. Never log an error and also return it. Use structured `slog` fields (`"error", err`) and redact sensitive values. Use error level when an operator must act and warn for degraded service. Explain discarded errors (`_ =`) in a comment.
- Give each goroutine an owner that checks the result of `group.Wait()` or reads its error channel. A worker that handles its own failure owns the log.

## HTTP

At the HTTP layer an error is translated, never wrapped: the caller gets a message we wrote, and the original error goes only to the log.

- Keep one API error type that carries a status, a stable `code` and a caller-safe message, and one envelope for every failure (`{"error": {"message", "type", "code"}}`). Its type sets the status.
- Map recognized failures to that type. Use 404 only for a confirmed missing resource and 503 for temporary outages. A database or network failure is never a 404 or a 400.
- Return unexpected errors unchanged to one middleware. It logs them with their stack under the request id (`X-Request-Id`, also sent to the caller) and answers a generic 500 `internal_error`. A handler does not log.
- Keep internal error text out of responses: never build a caller's message from `err.Error()` or `fmt.Sprintf("...: %v", err)` unless the error is a refusal your code wrote for the caller to correct. Driver, vendor and network errors carry hosts, ports, SQL, constraint names, URLs and response bodies. With the pure-Go resolver (`CGO_ENABLED=0`) a DNS failure names the DNS server, a `*net.OpError` names local and remote addresses, and a `*url.Error` names the method and full URL.
- An error kept for a later read (a job's or a webhook's last error) stores a fixed reason for the caller. The full text goes to the log.
- If streaming has started, signal failure through the protocol (an error event, a close reason) or end the stream. It carries the same caller-safe text an HTTP answer would.

## Panic and cleanup

- Reserve `panic` for broken invariants. Recover only where the work can safely end. In a deferred function in the same goroutine, capture `debug.Stack()` and report failure to the owner. A panic in a goroutine nothing recovers ends the process.
- Close resources on every path. Check `Flush`, `Close`, and `Commit` when success depends on them. If both writing and closing fail, preserve both errors with `errors.Join`. Check `rows.Err()` after SQL iteration.

## Tests

- Test the answer, not the call: run the real handler against a broken dependency (an unreachable database, a local `httptest` server answering 500 with a body, a host under `.invalid`) and assert the status, the `code`, and that the body holds none of the cause's text while the log does.
- Pair each such test with one showing a refusal the caller can correct still answers its 400 with its text.
