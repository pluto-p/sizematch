import { type NextRequest, NextResponse } from "next/server"

// Mock session storage (in production this would be a database)
const MOCK_SESSIONS: { [key: string]: any } = {}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    const { userId, sessionId } = sessionData

    console.log(`[Mock API] Storing session for user: ${userId}`)

    // Store session data
    MOCK_SESSIONS[sessionId] = {
      ...sessionData,
      storedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Session data stored successfully",
    })
  } catch (error) {
    console.error("[Mock API] Error storing session:", error)
    return NextResponse.json({ error: "Failed to store session data" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const sessionData = MOCK_SESSIONS[sessionId]

    if (sessionData) {
      return NextResponse.json({
        found: true,
        data: sessionData,
      })
    } else {
      return NextResponse.json({
        found: false,
        message: "Session not found",
      })
    }
  } catch (error) {
    console.error("[Mock API] Error retrieving session:", error)
    return NextResponse.json({ error: "Failed to retrieve session data" }, { status: 500 })
  }
}
