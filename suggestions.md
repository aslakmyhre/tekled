# Suggestions

Open ideas, loose ends and known limitations in the prototype. Tick off or delete when handled.

## General
- [ ] Replace placeholder app name "Score" (`<title>`, `apple-mobile-web-app-title`, `manifest.webmanifest`) with the real app name.
- [ ] Set up git + GitHub repo + GitHub Pages so it can be added to the iPhone home screen (needs HTTPS).
- [ ] Test on a real iPhone via "Add to Home Screen". So far only checked in headless Chrome at 390px.

## Navbar
- [ ] Hamburger menu: decide contents and build the slide-out menu.
- [ ] User icon: build profile page.

## Score dial
- [ ] Respect iOS "Reduce Motion" (`prefers-reduced-motion`): show needle, band and number at the final value without animating.
- [ ] Needle passes over tick labels (e.g. "300") when pointing at them. Normal for a speedometer, but labels could move outside the arc if it bothers anyone.

## Boost your score (tips)
- [ ] Tapping a tip does nothing. Could open a detail page or start the activity.
- [ ] Gains are fixed, so with a random score near 1000 a tip can promise more than the score can rise. Could cap each gain at `1000 - score`.

## Last 7 days (metrics)
- [ ] Tapping a card does nothing. Could open a detail page per metric (longer history, explanation of why it matters).
- [ ] Chart tooltip covers the "vs last week" line while shown. Fine as a temporary overlay; could sit above the card instead.

## Leaderboard
- [ ] People and scores are fixed fictional data (`js/leaderboard-data.js`). Only "You" changes, from the random dial score.
- [ ] Sheet closes via ✕, backdrop tap or Esc, but not by swiping down like a native iOS sheet.
- [ ] Rank 2 ("silver") is only slightly lighter than the other grey ranks. Could use medal badges if top 3 should stand out more.
- [ ] Tapping a person does nothing. Could open a profile or compare page.
