// Time-of-day greeting for the Dashboard header.
// Pure helper: caller passes a Date (defaults to now). Deterministic —
// same moment in, same greeting out; no randomness, no persistence.
// Personalization (appending the student's name) lands with the Profile
// model in Sprint 06 — this returns only the greeting portion today.

export function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 5) return 'Good evening' // late night still reads evening
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
