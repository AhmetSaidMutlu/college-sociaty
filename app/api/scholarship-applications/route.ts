import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const scholarshipApplications = await prisma.scholarshipApplication.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        siblings: true
      }
    })
    return NextResponse.json(scholarshipApplications)
  } catch (error) {
    console.error('Failed to fetch scholarship applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scholarship applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siblings, ...scholarshipData } = body

    const scholarshipApplication = await prisma.scholarshipApplication.create({
      data: {
        ...scholarshipData,
        siblings: {
          create: siblings
        }
      },
      include: {
        siblings: true
      }
    })

    return NextResponse.json(scholarshipApplication)
  } catch (error) {
    console.error('Failed to create scholarship application:', error)
    return NextResponse.json(
      { error: 'Failed to create scholarship application' },
      { status: 500 }
    )
  }
}

