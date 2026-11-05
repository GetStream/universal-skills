# Go testing

How Go tests are written. The Go rules in [the parent skill](../SKILL.md) apply to tests too.

## Rules

- Group tests in a testify suite (`suite.Suite`). Shared setup lives in the suite, in one place.
- Never mock. An external provider is a stub that implements the same interface, or the real one behind an integration build tag; everything else (Postgres, Redis, the router) is real.
- Test behaviour through the outside. Assert on outputs and state, never on which method was called.
- Name a test as the sentence it proves: `TestAnIdAnotherSessionHasIsRefused`.
- Avoid table tests, common as they are in Go. Write one test per behaviour, each named for what it proves, and put what they share in the suite or a helper.
- Outside a suite, check with `require`, never `testify/assert`: a failed check stops the test there.
- Every skip says what keeps the test from running: the env var or tool that is missing, or what the provider cannot do. A skip with no such reason ("pending fixture") is a test to fix or delete.
- Integration tests only ever write to a database whose name ends in `_test`. Refuse or redirect anything else.

## Which kind of test

Read the file for what you are testing:

- [controllers.md](controllers.md): HTTP endpoints, run against the whole router with a real database. Who may call an endpoint, whose a resource is, fixtures, parallel suites.
- [store.md](store.md): models and queries, run against a real Postgres.
- [providers.md](providers.md): code that calls an outside service (payments, email, storage). One shared suite per interface, test file layout, integration tests.
- [fixtures.md](fixtures.md): writing and sharing the input tests read, including canned responses in `testdata/`.
