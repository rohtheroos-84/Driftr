# plan

driftr v1 ships as a single expo codebase for android and web, with local-only storage, a fixed minutes-per-tap estimate, mandatory onboarding, and minimal opt-in analytics. the phases below are specific about what each phase delivers and how it gets built.

## phase 0: lock v1 rules and measurement

### 0.1 finalize product rules and copy
#### tasks
- [x] set the fixed estimate to 5 minutes per tap, store it as a single constant for easy tuning
- [x] write a one-line estimate disclaimer for the dashboard and onboarding (example: "time lost is an estimate based on your taps")
- [x] define insight tone rules (short, neutral, non-judgmental) and store them as copy guidelines
- [x] list minimal analytics events and payload fields (no personal data)
#### learnings
- [x] learn if the 5-minute estimate feels honest during a 2-day internal trial
- [x] learn if the disclaimer reduces perceived inaccuracy
- [x] learn if the insight tone feels supportive
``
### 0.2 define success metrics and measurement
#### tasks
- [x] map metrics to events: tap_logged, insight_opened, history_opened, onboarding_complete
- [x] define metric windows: daily active use and 7-day retention
- [x] decide how to store event counts locally when offline and flush later if opted in
- [x] decide if analytics is opt-in in settings (default off)
#### learnings
- [x] learn if these events reflect user value without extra data

## phase 1: foundation and scaffolding

### 1.1 scaffold the app
#### tasks
- [x] create an expo app with typescript
- [x] add expo router and a simple route structure: onboarding, home, history, day detail
- [x] set up linting and formatting defaults
- [x] create a basic folder structure that separates ui, data, and domain logic
#### learnings
- [x] learn if android and web run smoothly from one codebase
- [x] learn if navigation stays stable across both platforms

### 1.2 data model and local storage
#### tasks
- [x] define log entry fields: id, timestamp_iso, edited_at, deleted_at, day_key
- [x] compute day_key with local timezone using date-fns formatting
- [x] implement storage helpers: create, update, soft delete, query by day_key
- [x] add a storage version flag to enable future migrations
#### learnings
- [x] learn if day_key grouping matches user expectations around midnight
- [x] learn if storage remains fast with 30+ logs per day

### 1.3 base ui system
#### tasks
- [ ] define spacing scale, typography, and color tokens
- [ ] build a primary tap button with clear pressed state
- [ ] build a card component for summary and insight
- [ ] set responsive layout rules for narrow and wide screens
#### learnings
- [ ] learn if the primary tap feels instant and obvious
- [ ] learn if the layout stays readable on small screens

## phase 2: logging flow

### 2.1 one-tap logging flow
#### tasks
- [ ] place a large primary button on the home screen
- [ ] on tap, create a log entry, persist it, and update in-memory state
- [ ] show immediate feedback (haptic on android, subtle toast on web)
- [ ] allow a brief undo window after a tap
#### learnings
- [ ] learn if the tap flow adds less than 1 second of friction
- [ ] learn if the feedback is enough without being noisy

### 2.2 edit and delete logs
#### tasks
- [ ] show today’s logs with time labels
- [ ] allow editing the timestamp with a simple time picker
- [ ] allow delete with an undo action
- [ ] ensure edits and deletes re-run day aggregation
#### learnings
- [ ] learn how often users edit versus delete
- [ ] learn if undo is enough to handle accidental taps

### 2.3 resilience and edge cases
#### tasks
- [ ] handle day rollover by reloading and regrouping on app resume
- [ ] handle timezone changes by recomputing day_key on startup
- [ ] define empty states for no logs
- [ ] ensure deleted logs never affect summaries
#### learnings
- [ ] learn which edge cases show up after a day of real use
- [ ] learn if users expect cross-day corrections

## phase 3: daily summary and insight

### 3.1 daily aggregation
#### tasks
- [ ] compute daily tap count from logs
- [ ] estimate time lost as count * 5 minutes
- [ ] display a summary card with count and estimate
- [ ] keep aggregation in a pure function for testing
#### learnings
- [ ] learn if the estimate feels believable with real logs
- [ ] learn if summary data is enough without detail

### 3.2 insight rules
#### tasks
- [ ] implement a small rule engine with priority order
- [ ] add rule examples: burst behavior (3+ taps in 30 minutes), peak window (one hour holds 40%+ of taps), scattered pattern (no hour above 25%)
- [ ] ensure only one insight renders per day
- [ ] draft 1-2 sentence insight templates per rule
#### learnings
- [ ] learn which rule feels most useful
- [ ] learn if rule thresholds need tuning

### 3.3 daily dashboard view
#### tasks
- [ ] layout summary, insight, and timeline on a single screen
- [ ] implement a simple hourly histogram from tap counts
- [ ] add a link to the history view
- [ ] keep dashboard load under 200ms after storage load
#### learnings
- [ ] learn if the timeline helps pattern recognition
- [ ] learn if the screen feels uncluttered

## phase 4: history and pattern review

### 4.1 history list
#### tasks
- [ ] group logs by day_key and list recent days (default last 14)
- [ ] show key metrics per day: tap count, estimate, insight title
- [ ] open a day detail view with summary and timeline
#### learnings
- [ ] learn how far back users browse
- [ ] learn which summary fields they rely on

### 4.2 pattern comparison
#### tasks
- [ ] show a simple comparison: today vs yesterday
- [ ] highlight the top hour across the last 7 days
- [ ] keep comparisons minimal and avoid extra charts
#### learnings
- [ ] learn if comparisons add clarity or noise
- [ ] learn the best time window granularity

### 4.3 editing in history
#### tasks
- [ ] allow editing and deleting logs from past days
- [ ] recompute affected day summaries
- [ ] show a brief "updated" notice after changes
#### learnings
- [ ] learn how often users edit past logs
- [ ] learn if history edits affect trust

## phase 5: onboarding and product polish

### 5.1 mandatory onboarding flow
#### tasks
- [ ] build a 3-screen onboarding flow: what driftr is, how to tap, what insights mean
- [ ] gate the home screen until onboarding is completed
- [ ] store onboarding completion locally
#### learnings
- [ ] learn if the flow is short enough to avoid drop-off
- [ ] learn if the insight explanation is clear

### 5.2 copy and empty states
#### tasks
- [ ] apply neutral, non-judgmental copy across screens
- [ ] design empty states that encourage a first tap
- [ ] add microcopy after tap and after insight
#### learnings
- [ ] learn which copy reduces friction and guilt
- [ ] learn if empty states motivate logging

### 5.3 accessibility and performance
#### tasks
- [ ] ensure tap targets are at least 44px
- [ ] verify contrast and text scaling
- [ ] minimize animations to reduce distraction
- [ ] lazy-load history data for faster first load
#### learnings
- [ ] learn if lower-end devices still feel responsive
- [ ] learn if web performance matches mobile

## phase 6: v1 readiness

### 6.1 test pass
#### tasks
- [ ] add unit tests for day_key grouping, estimate calculation, and insight selection
- [ ] run a manual smoke test for logging, editing, history, onboarding
- [ ] fix any high-impact bugs
#### learnings
- [ ] learn which flows break most often
- [ ] learn the minimum test coverage needed

### 6.2 privacy and minimal analytics
#### tasks
- [ ] add a short privacy statement explaining local storage
- [ ] implement an opt-in toggle for analytics
- [ ] send only the minimal events defined in phase 0.2 with no personal data
#### learnings
- [ ] learn if the privacy explanation is clear
- [ ] learn if analytics opt-in is understood

### 6.3 release prep
#### tasks
- [ ] create an android build via eas
- [ ] export a static web build
- [ ] verify local data persists across restarts
- [ ] verify analytics events fire only when enabled
#### learnings
- [ ] learn if release steps are stable and repeatable
- [ ] learn which release checks are essential
