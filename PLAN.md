# plan

## phase 0: align v1 scope and assumptions

### 0.1 clarify open questions
#### tasks
- [ ] decide the v1 time-loss estimate rule
- [ ] decide whether onboarding is skippable
- [ ] decide whether categories are v1 or post-v1
- [ ] decide whether data is local-only or sync-ready
#### learnings
- [ ] learn which estimate feels honest and simple
- [ ] learn which onboarding length feels acceptable
- [ ] learn if categories are needed for clarity
- [ ] learn if local-only storage is acceptable

### 0.2 define success metrics
#### tasks
- [ ] confirm v1 success metrics from the prd
- [ ] decide whether to track any analytics in v1
- [ ] set target ranges for early retention and usage
#### learnings
- [ ] learn which metrics best reflect perceived value
- [ ] learn which minimal signals can be measured safely

## phase 1: foundation and scaffolding

### 1.1 scaffold the app
#### tasks
- [ ] create expo app with typescript
- [ ] add expo router and navigation shell
- [ ] add linting and formatting defaults
#### learnings
- [ ] learn the minimal navigation structure needed
- [ ] learn if web and android parity is smooth

### 1.2 data model and storage
#### tasks
- [ ] define log entry schema and day_key logic
- [ ] implement local persistence with async storage
- [ ] add migration strategy for future fields
#### learnings
- [ ] learn if storage stays simple under real usage
- [ ] learn if day grouping logic is reliable

### 1.3 base ui system
#### tasks
- [ ] define typography, spacing, and color tokens
- [ ] build reusable button and card components
- [ ] implement basic layout for mobile and web
#### learnings
- [ ] learn if the one-tap action feels instant
- [ ] learn if the layout stays clear on small screens

## phase 2: logging flow

### 2.1 one-tap logging
#### tasks
- [ ] implement the primary tap action
- [ ] persist a timestamped log entry
- [ ] show immediate visual confirmation
#### learnings
- [ ] learn if the tap action feels frictionless
- [ ] learn which confirmation feedback is enough

### 2.2 edit and delete logs
#### tasks
- [ ] add log list for the current day
- [ ] enable edit and delete actions
- [ ] handle accidental taps gracefully
#### learnings
- [ ] learn the most common edit behavior
- [ ] learn whether delete needs an undo step

### 2.3 resilience and edge cases
#### tasks
- [ ] handle timezone changes and day rollover
- [ ] handle empty state for no logs
- [ ] ensure deleted logs no longer affect summaries
#### learnings
- [ ] learn which edge cases show up early
- [ ] learn if users expect cross-day corrections

## phase 3: daily summary and insight

### 3.1 daily aggregation
#### tasks
- [ ] compute tap count per day
- [ ] compute estimated time lost per day
- [ ] show a compact daily summary card
#### learnings
- [ ] learn if the estimate feels believable
- [ ] learn if summary data is enough without detail

### 3.2 insight rules
#### tasks
- [ ] implement a small set of insight rules
- [ ] ensure only one insight is shown per day
- [ ] write neutral, non-judgmental insight copy
#### learnings
- [ ] learn which insight types feel most useful
- [ ] learn if rule priority feels fair

### 3.3 daily dashboard view
#### tasks
- [ ] add a simple timeline or pattern view
- [ ] surface one insight prominently
- [ ] provide a path to history
#### learnings
- [ ] learn if the timeline aids understanding
- [ ] learn if the dashboard feels uncluttered

## phase 4: history and pattern review

### 4.1 history list
#### tasks
- [ ] list past days with key metrics
- [ ] allow selection of a past day
- [ ] show the selected day summary
#### learnings
- [ ] learn which history summary fields matter
- [ ] learn how far back users browse

### 4.2 compare patterns
#### tasks
- [ ] add simple day-to-day comparison
- [ ] surface recurring time windows
- [ ] keep comparisons minimal and clear
#### learnings
- [ ] learn if comparisons feel helpful or noisy
- [ ] learn the best time window granularity

### 4.3 editing in history
#### tasks
- [ ] enable edits for past-day logs
- [ ] keep summaries consistent after edits
- [ ] confirm delete rules across days
#### learnings
- [ ] learn how often users back-edit
- [ ] learn if history edits are confusing

## phase 5: onboarding and product polish

### 5.1 onboarding flow
#### tasks
- [ ] explain what driftr does
- [ ] explain the one-tap action
- [ ] explain the daily insight
#### learnings
- [ ] learn if onboarding should be skippable
- [ ] learn if the insight explanation is clear

### 5.2 copy and empty states
#### tasks
- [ ] add non-guilt copy across the app
- [ ] design empty states for no logs
- [ ] add brief tooltips only where needed
#### learnings
- [ ] learn which copy reduces friction
- [ ] learn if empty states motivate logging

### 5.3 accessibility and performance
#### tasks
- [ ] check tap targets and contrast
- [ ] ensure animations stay minimal
- [ ] optimize first load time
#### learnings
- [ ] learn where friction appears on low-end devices
- [ ] learn if web performance matches mobile

## phase 6: v1 readiness

### 6.1 test pass
#### tasks
- [ ] add smoke tests for core flows
- [ ] run basic manual qa on android and web
- [ ] fix high-impact bugs
#### learnings
- [ ] learn which flows break most often
- [ ] learn the minimum test coverage needed

### 6.2 privacy and data handling
#### tasks
- [ ] document local data storage behavior
- [ ] add a simple privacy statement
- [ ] confirm no analytics or minimal analytics
#### learnings
- [ ] learn if users expect data export
- [ ] learn if privacy copy needs clarification

### 6.3 release prep
#### tasks
- [ ] prepare android build
- [ ] prepare web build
- [ ] validate v1 success metrics tracking
#### learnings
- [ ] learn if build steps are stable
- [ ] learn which release checks are essential
