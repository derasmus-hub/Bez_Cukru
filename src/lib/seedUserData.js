import { supabase } from './supabase'

export async function seedUserData(userId) {
  // Seed 30 challenge days
  const challengeRows = Array.from({ length: 30 }, (_, i) => ({
    user_id: userId,
    challenge_name: '30 Dni Bez Cukru',
    day_number: i + 1,
    completed: false,
  }))
  await supabase.from('challenge_days').insert(challengeRows)

  // Seed 28 activity log rows (4 weeks × 7 days)
  const activityRows = []
  for (let week = 1; week <= 4; week++) {
    for (let day = 0; day <= 6; day++) {
      activityRows.push({
        user_id: userId,
        week_number: week,
        day_of_week: day,
        exercise: false,
      })
    }
  }
  await supabase.from('activity_logs').insert(activityRows)
}
