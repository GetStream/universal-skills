# DB model and state testing

Models and queries, tested against a real Postgres: rows in, rows and aggregates out.

## Rules

- Put a test next to the file it tests: `sessions.go` is tested in `sessions_test.go`.
- Every integration test is a method on one `StoreSuite`, so the schema is migrated once and every file shares its helpers.
- Assert on what a query returns, never on the SQL it ran. Reach for the raw DB handle only to set up a state the API cannot make, such as backdating `updated_at`.
- Pin time to a fixed base (`s.base`, the start of a fixed hour), so hourly and daily buckets fall where the test expects.

## The store suite

`SetupSuite` opens a database of the suite's own, because dropping the schema and truncating tables is not something to do to a database another package's suite is reading while `go test` runs them side by side. It refuses any database whose name does not end in `_test`, drops the schema and runs the project's real migrations, so the migrations are what the tests exercise. `SetupTest` truncates the tables, so each test starts empty and fixed ids are safe here, unlike in controller tests.

A table a test writes to must be in that `TRUNCATE` list, or rows leak from one test into the next.

## Helpers

A helper makes one row, defaulting the fields a test does not care about, and takes a function to change the ones it does:

```go
func (s *StoreSuite) TestSavingASessionTwiceIsOneConversation() {
	s.opened("one", "app", s.base, func(session *Session) { session.Title = "first" })
	s.opened("one", "app", s.base, func(session *Session) { session.Title = "renamed" })

	found, err := s.store.Session(s.ctx, "app", "one")
	s.Require().NoError(err)
	s.Equal("renamed", found.Title)
}
```

## Scoping

Every query that takes a tenant gets a test that another tenant's rows are invisible to it, both fetched by id and listed.

## Without Postgres

Logic decided before any SQL runs, such as validation or which query a call picks, goes in `<file>_unit_test.go` with no build tag and plain `require`.
