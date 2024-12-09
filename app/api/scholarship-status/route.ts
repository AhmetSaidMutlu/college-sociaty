import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'scholarshipEnabled' },
    })

    return NextResponse.json({ isEnabled: setting?.value === 'true' })
  } catch (error) {
    console.error('Error fetching scholarship status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isEnabled } = await request.json()

    await prisma.setting.upsert({
      where: { key: 'scholarshipEnabled' },
      update: { value: isEnabled.toString() },
      create: { key: 'scholarshipEnabled', value: isEnabled.toString() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating scholarship status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

