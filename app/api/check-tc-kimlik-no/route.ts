import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const body = await request.json()
  const { tcKimlikNo } = body

  try {
    const existingApplication = await prisma.scholarshipApplication.findUnique({
      where: {
        tcKimlikNo: tcKimlikNo,
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'Bu TC Kimlik No ile daha önce başvuru yapılmış.' }, { status: 400 })
    }

    return NextResponse.json({ message: 'TC Kimlik No kullanılabilir.' })
  } catch (error) {
    console.error('Error checking TC Kimlik No:', error)
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

