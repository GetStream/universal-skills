# Test fixtures

A fixture is the input a test works from: a request, a document, a canned response, a set of rows. Write it once and let every test read it.

## Rules

- Name a fixture for what it is and write it once, in the suite's `fixtures.go`: `standardOrder`, `refundRequest`. Tests read fixtures and never change them. A test that needs a variation copies the value and changes the copy (`order := standardOrder; order.Quantity = 2`).
- Pick input whose expected result is unambiguous, so a failure means the code under test is wrong, not that the fixture could be read two ways.
- Build anything costly (an encoded file, a large payload, a signed token) once in `SetupSuite`, not in each test.
- Put canned wire responses from an external service in `testdata/`, embed them with `//go:embed`, and name each file for what it is (`charge_declined.json`). Don't inline them as strings in each test.
- Add a fixture when a second test needs the same data. Until then, keep the value in the test.

Fixtures made of database rows, shared by several suites, are covered in [controllers.md](controllers.md#fixtures).
