# AI provider and routing testing

External providers (LLM, STT, TTS, speech-to-speech, search and the like) and the routers that pick between them.

## One suite per kind of provider

Every provider of a kind is held to the same promises, so those promises are written once, in a shared suite (`<kind>suite`) that each provider's integration test embeds. For example, an LLM suite holds every provider to: a right answer that streams and is billed, history, truncation, a tool call and its result, stopping on close, and images or reasoning where the provider claims them.

A new provider gets all of that by embedding the suite and saying how to build itself. It never copies a test from another provider. A new kind gets a suite of its own: the shared behaviour in `<kind>suite.go`, the fixtures in `fixtures.go` and the tests in `tests.go`.

What a provider can do decides which tests run, and it is read from the provider rather than restated: run the image test only when the provider's capabilities say it accepts images. What the provider cannot report is a field on the suite, and a test it opts out of is skipped with the reason, never deleted.

## Fixtures

A fixture is what a test asks, named and written once in the suite's `fixtures.go`. Tests read them and never change them; a test that needs a variation copies the value.

- Pick a question with one answer the whole web and every model agree on, so a failure is the provider failing rather than the world or the model having an opinion.
- Anything costly to build, like an encoded image, is built once in `SetupSuite`.
- A provider's canned wire responses are files in `testdata/` embedded with `//go:embed` and named for what they are (`contents_not_found.json`), not strings inlined in each test.

## Never clean up

- The provider is built once in `SetupSuite` and never closed. Hanging up a session is different: that is the behaviour under test, not tidying up.
- A stub server in a unit suite starts once in `SetupSuite` and is never stopped. `SetupTest` sets what it answers with by default and forgets the last request, so each test sees only its own.
- No `s.T().Cleanup`, no `TearDownSuite`.

## Files

A provider package has up to three test files, in this order of value:

1. `<provider>_test.go`: no network. Feed server frames to the message handler and assert the events that come out.
2. `socket_test.go`: a fake server (`httptest`). Asserts what goes on the wire.
3. `<provider>_integration_test.go`: `//go:build integration`, against the real API, embedding the kind's suite.

Name an integration file for what it covers, never plain `integration_test.go`.

## An integration test

The suite embeds the kind's suite and sets only what this provider needs different from the defaults, saying why in the comment:

```go
// AcmeIntegrationSuite inherits what every provider owes a call from sttsuite. Acme
// ends a turn on about two seconds of silence of its own accord, so it is given more
// than that and the turn ends because Acme decided it had.
type AcmeIntegrationSuite struct {
	sttsuite.Suite
}

func TestAcmeIntegrationSuite(t *testing.T) {
	suite.Run(t, &AcmeIntegrationSuite{Suite: sttsuite.Suite{
		New: func() stt.STT {
			provider, err := New(Options{})
			require.NoError(t, err)
			return provider
		},
		Requires:  []string{"ACME_API_KEY"},
		SilenceMs: 3000,
	}})
}
```

- `New` builds an unstarted provider. `Requires` lists the env vars whose absence skips the suite.
- Only loosen a threshold when the provider genuinely cannot meet the default, and say why in a comment. Loosening one to make a test pass hides the regression it exists to catch.

Tests only this provider can pass go on the same suite, using the suite's helpers rather than driving the socket by hand. If a provider-specific test turns out to be true of every provider, move it into the suite.

## What the suites measure

- Audio is streamed at the pace a call delivers it, never all at once, because a model that sees the whole clip does not behave as it does on a call.
- Accuracy is the share of the fixture's reference words that come back, not a search for one phrase, which would pass a transcript missing half the sentence.
- Latency is measured the way the caller feels it: from the last word to the settled turn, and from the first word to the first result.
- Each threshold is the point past which the experience drags, loose enough that only a real regression trips it.

## Routers

A router is tested for the choice it makes, not for what the providers do: which candidate is tried, and what happens when one fails. Use a real provider for the one that works and a stub for the one that breaks, with provider names unique to each test so health from one test does not rank the next.
