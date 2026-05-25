# release checklist (v1)

## android build (eas)
- set the android package name in app/app.json (expo.android.package)
- run npm run build:android for production or npm run build:android:preview for internal testing
- confirm the build completes in the eas dashboard

## web export
- run npm run export:web from the app/ folder
- output is written to dist/ (ignored by git)

## verification
- local data persists: add a log, close the app, reopen, confirm today count and history entries remain
- analytics opt-in: with analytics off, do a tap, open history, open a day detail, finish onboarding; confirm no [driftr] analytics logs. turn analytics on and repeat; confirm a log appears with counts
