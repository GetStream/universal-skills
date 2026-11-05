# Controller testing

HTTP endpoints, tested through the router: HTTP in, status and body out.

## Rules

- Put a test next to the controller it tests: `session_create.go` is tested in `session_create_test.go`.
- One suite per controller: `SessionCreateSuite`, `SessionListSuite`.
- An external provider is a stub registered where the real one would be. Keep the stubs in one file (`stubs_test.go`) and wire them in the shared suite.
- Every controller test is an integration test against the whole router. No in-memory server tests: a controller asserted against a router with no database is a controller asserted against a deployment nobody runs.
- Use fresh UUIDs for everything a test makes, and never clean up. Unique ids are what keep tests apart, not deleting rows.

## The router suite

Controller suites embed one shared `RouterSuite`. It runs the whole router against Postgres and Redis with the same auth as production. A suite's `SetupTest` picks the fixture its clients call:

```go
func (s *SessionCreateSuite) SetupTest() {
	s.useFixture("standard")
}
```

Give the suite, for each test:

- One client per sort of caller: unauthenticated, an end user, another end user, the app's own backend, and whatever other roles the API has.
- `s.utils.uuid()`: a fresh UUID.
- `s.data.createUser()`, `createApp()` and so on: helpers that make a new row and return a client or id for it.
- Direct handles on the real Postgres and Redis, for seeding a row no endpoint writes.

Clients call the API by name and fail the test unless it succeeds: `s.client.createSession(...)`, `getSession`, `deleteSession`. To assert on a status, use a low-level `do`:

```go
func (s *SessionCreateSuite) TestAnIdThatIsNotAUUIDIsRefused() {
	id := "my-session"

	s.Equal(http.StatusBadRequest, s.client.do(http.MethodPost, "/v1/sessions", newSession(&id), nil))
}
```

Add a helper to the client or to `s.data` when a second test needs it, not to each test.

## Security posture

Every endpoint gets a test saying who may call it, and every resource one saying whose it is. Write shared assertions for it once:

```go
func (s *SessionCreateSuite) TestAnyoneHoldingTheAppsKeyMayCreateASession() {
	s.assertPosture(anyAppCaller, func(as *testClient) int {
		return as.do(http.MethodPost, "/v1/sessions", newSession(nil), nil)
	})
}
```

- `assertPosture(admits, call)` makes the call as every sort of caller. The admitted ones must get a 2xx; the rest are refused, unauthenticated with a 401 and everyone else with a 403.
- `assertOwnedBy(id, owner)`: the owner reaches the resource, and nobody else does.
- `assertHiddenFromOtherTenants(call)`: another tenant making the call must get a 404. Anything else, including a 403, tells a stranger the id is real.
- A caller who does not own a resource is told it does not exist (404), never that it is forbidden.

If the API has an OpenAPI spec, add one test that calls every operation as every sort of caller and checks it against the access the spec declares, so a new endpoint is covered without its own posture test. Each suite still writes the posture of its own endpoint, because that is the line somebody will move by accident.

## Fixtures

A fixture is data that many tests read, loaded once: `s.useFixture(name)` loads it for the first test that asks, and every later test in the run gets the same one.

- Start with one `standard` fixture: a tenant, its credentials and a user.
- Tests never change a fixture's data. Making rows of their own in it is fine.
- Tests sharing a fixture see each other's rows. Find your own by a UUID you made.
- A test that needs an empty tenant, like one listing everything, makes its own.
- Add a fixture when several tests need the same read-only data. Build it with `s.data`, so it is made the way tests make things.

## Running suites in parallel

Start every suite with a `runSuite` helper that calls `t.Parallel()` and then `suite.Run`:

- Suites run in parallel; the tests inside one run in order, because they share the suite's clients.
- Cap each suite's connection pool so the parallel suites stay under the database's connection limit.
- Run migrations once per run, not once per suite.
- Load fixtures once, behind a lock.
- Give each suite its own Redis database or key prefix.
- Nothing may be shared but the database and fixtures. No package-level state a test writes, and no fixed ids.
- A stub is shared by every test in its suite. Name what a test sends with a UUID and read back that one, rather than resetting the stub between tests.
- Run with `-race` when you touch the harness. Every race report must come from the code under test, never from the suite.

## Waiting

Work done off the request path is waited for with `s.Require().Eventually`. Inside the condition use plain Go (`slices.Contains`), never `s.Contains`: an assertion there records a failure on every poll that has not caught up yet.
