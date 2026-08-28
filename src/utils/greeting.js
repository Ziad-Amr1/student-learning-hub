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


// export function getGreeting(
//   date = new Date(),
//   username?: string
// ): string {
//   const hour = date.getHours()
//   const day = date.getDay()      // 0–6
//   const dateNum = date.getDate() // 1–31

//   // Deterministic rotation — same moment always yields the same greeting
//   const pick = (messages: string[]): string => {
//     const index = (day + hour + dateNum) % messages.length
//     return messages[index]
//   }

//   let greeting: string

//   if (hour < 5) {
//     // Late night (00:00–04:59)
//     greeting = pick([
//       'Good evening',
//       'Burning the midnight oil',
//       'The quiet hours are perfect for focus',
//       'Night owl mode activated',
//       'Still going strong',
//       'Late night, big dreams',
//     ])
//   } else if (hour < 12) {
//     // Morning (05:00–11:59)
//     greeting = pick([
//       'Good morning',
//       'Rise and shine',
//       'Fresh start, new goals',
//       'Morning momentum',
//       'Today is full of possibilities',
//       'Seize the day',
//     ])
//   } else if (hour < 18) {
//     // Afternoon (12:00–17:59)
//     greeting = pick([
//       'Good afternoon',
//       'Keep the rhythm going',
//       'Afternoon focus mode: on',
//       'Halfway there — stay consistent',
//       'Make this afternoon count',
//       'Productivity in progress',
//     ])
//   } else {
//     // Evening (18:00–23:59)
//     greeting = pick([
//       'Good evening',
//       'Finish the day strong',
//       'Evening reflection time',
//       'Wrap up or wind down',
//       'One more push before rest',
//       'Well done today',
//       'Hello Night Owl',
//     ])
//   }

//   const name = username?.trim()
//   if (name) {
//     greeting += `, ${name}`
//   }

//   return greeting
// }