import { postgres } from '@/lib/postgres/index'
import { daily_session } from '@/lib/postgres/schema'
import { sql } from 'drizzle-orm'
import { formatMessage } from '@/utils/formatMessage'
import { errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST() {
  try {
    await postgres
      .insert(daily_session)
      .values({ date: format(new Date(), 'yyyy-MM-dd'), sessions: 1 })
      .onConflictDoUpdate({
        target: daily_session.date,
        set: { sessions: sql`${daily_session.sessions} + 1` },
      })
  } catch (err) {
    const message = formatMessage(
      '@/app/api/metrics/daily_sessions/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ err: errorPostgres }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
