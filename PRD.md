# Driftr Product Requirements Document

## 1. Product Overview

Driftr is a lightweight time loss tracker that helps users see where their time goes, how often distractions happen, and how much time is likely being lost across the day.

## 2. Problem Statement

Users often know that they lose time during the day, but they do not know:

* where the time was lost
* how often it happens
* when the loss happens most
* what pattern connects the losses

This creates frustration and guilt because the day feels wasted, but the cause is not visible.

## 3. Product Vision

Driftr makes time loss visible in the simplest possible way. The user taps once whenever they notice a distraction, and Driftr turns those taps into a clear end-of-day view with one useful insight.

## 4. Goals

* Help users track when they lose time
* Help users understand how much time they lose
* Reduce the uncertainty and guilt around untracked time loss
* Keep logging fast and frictionless
* Surface one clear insight at the end of the day

## 5. Non-Goals

Driftr v1 will not try to be:

* a full habit tracker
* a to-do app
* a screen-time blocker
* a social productivity app
* a monetized product
* an advanced AI coach
* an automated distraction detector

## 6. Target Users

Primary audience:

* any user who wants to understand time leakage across the day

Secondary audience:

* students
* working professionals
* users who feel distracted in short bursts
* users who prefer simple tracking instead of complex productivity systems

## 7. Core User Need

The user wants a fast way to record distraction moments without stopping their flow for too long.

## 8. Core Product Experience

The core loop is:

1. User notices distraction
2. User taps one button
3. Driftr records the event
4. Driftr groups events across the day
5. Driftr shows the total loss and one insight at the end of the day

## 9. V1 Scope

### Included

* one-tap distraction logging
* timestamped entries
* daily dashboard
* one insight per day
* history view
* editing logs
* deleting logs
* onboarding
* Android support
* web support

### Excluded

* reminders
* auto-detection of distractions
* monetization
* paid plans
* social sharing
* calendar integrations
* screen-time API integrations
* advanced analytics

## 10. Functional Requirements

### 10.1 Logging

* The user must be able to log a distraction with one tap.
* Each log must store a timestamp.
* Logs must be editable.
* Logs must be deletable.

### 10.2 Daily Summary

* The app must show a summary for the day.
* The summary must include total distraction count.
* The summary must include estimated time lost.
* The summary must include one insight.

### 10.3 History

* The app must allow users to review previous days.
* The app must allow users to compare recurring patterns across days.

### 10.4 Onboarding

* The app must explain what Driftr does.
* The app must explain how to use the tap action.
* The app must explain what the daily insight means.
* Onboarding should be short and optional if possible.

## 11. Assumptions for V1

These assumptions are used because some product details are still undecided:

* One tap means one distraction event.
* Time lost is estimated from the logs rather than measured exactly.
* The daily insight is rule-based in V1.
* The product stays free in V1.
* Notifications are not required in V1.

## 12. Distraction Definition

A distraction is any moment when the user realizes attention has shifted away from the intended task.

Examples may include:

* opening social media unexpectedly
* checking messages without intent
* browsing randomly
* losing focus during work or study
* switching away from the main task for no clear reason

## 13. Data Collected

For each log, Driftr should store:

* timestamp
* optional edit history
* optional day grouping

Optional future fields, not required in V1:

* category
* duration estimate
* context tag

## 14. Insight Engine

Driftr should generate only one insight per day.

Recommended V1 insight types:

* peak distraction window
* most frequent distraction pattern
* repeated burst behavior
* time of day with highest loss
* day-of-week pattern

### Insight Rules

* The insight should be easy to understand.
* The insight should avoid overwhelming detail.
* The insight should feel specific enough to be useful.
* The insight should not sound judgmental.

## 15. Estimating Time Lost

Because the product is built around a one-tap flow, the exact time lost may not always be directly measured.

Recommended v1 approach:

* show estimated time lost
* explain that the estimate is based on distraction logs and patterns
* keep the estimate simple and consistent

## 16. UX Principles

* one tap first
* analysis second
* minimal friction
* no clutter
* no guilt-heavy language
* no over-explaining
* clear feedback after every tap

## 17. Dashboard Requirements

The daily dashboard should show:

* number of distraction taps
* estimated time lost
* one daily insight
* a simple timeline or pattern view
* access to history

## 18. Editing and Deletion Rules

* users can edit logs
* users can delete logs
* the app should handle accidental taps gracefully
* deleted logs should no longer affect daily summaries

## 19. Platform Requirements

V1 platforms:

* Android
* Web

Not required in V1:

* iOS
* desktop app
* browser extension
* smartwatch app

## 20. Success Metrics

Suggested early metrics:

* daily active users
* taps logged per active day
* 7-day retention
* percentage of users who open the daily insight
* percentage of users who return to view history

## 21. Risks

* users may not know exactly what counts as a distraction
* the estimated time lost may feel inaccurate if not explained well
* the product may feel too simple without strong insight quality
* users may stop logging if the flow is not instant

## 22. Product Principles

* make awareness effortless
* avoid complexity in the logging flow
* keep the product honest about what it measures
* prioritize clarity over feature depth
* help users reflect without making them feel worse

## 23. Open Questions that are TBD

These are still undecided and can be refined later:

* exact method for calculating estimated time lost
* whether categories should be added in V1 or later
* whether onboarding should be mandatory or skippable
* whether any background tracking should ever be introduced

## One-Sentence Summary

Driftr is a one-tap distraction tracker that helps users see where their time goes and understand the patterns behind it.
