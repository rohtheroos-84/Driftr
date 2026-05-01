# Driftr

## overview
driftr is a one-tap distraction tracker that makes time loss visible with a daily summary and a single clear insight.

## goals
- help users track when they lose time
- help users understand how much time they lose
- reduce uncertainty and guilt around untracked time loss
- keep logging fast and frictionless
- surface one clear insight at the end of the day

## non-goals
- full habit tracking
- to-do management
- screen-time blocking
- social features or monetization
- advanced ai coaching
- automated distraction detection

## v1 scope
### included
- one-tap distraction logging
- timestamped entries
- daily dashboard
- one insight per day
- history view
- edit and delete logs
- onboarding
- android and web support

### excluded
- reminders and notifications
- auto-detection of distractions
- paid plans and monetization
- social sharing
- calendar or screen-time integrations
- advanced analytics

## core loop
1. user notices distraction
2. user taps one button
3. driftr records the event
4. driftr groups events across the day
5. driftr shows total loss and one insight at the end of the day

## product principles
- one tap first
- analysis second
- minimal friction
- no clutter
- no guilt-heavy language
- honest about what is measured

## data model
- log entry: id, timestamp, optional edited_at, optional deleted_at, optional day_key
- derived per day: tap count, estimated time lost, one insight

## estimation and insight
- v1 uses a rule-based estimate derived from tap count and spacing
- v1 produces one insight per day from simple, non-judgmental rules
- exact rules are intentionally simple and can be refined after early learning

## platforms
- android and web in v1

## tech stack
- expo (react native) for a single android and web codebase
- typescript for safer data modeling
- expo router for navigation
- async storage for local persistence
- date-fns for date grouping and time windows
- jest and react native testing library for basic testing
- eslint and prettier for code quality
