import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key to .env.local
})

export async function POST(request: Request) {
  try {
    const { command, applications } = await request.json()

    const prompt = `
      You are an assistant helping to analyze scholarship applications. 
      Each application has fields like "fullName", "email", "institution", 
      "studyField", "academicYear", "motivation", and "createdAt".

      Applications:
      ${JSON.stringify(applications, null, 2)}

      Command:
      "${command}"

      Provide your analysis based on the command.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500, // Adjust as needed
    })

    const message = response.choices[0]?.message?.content || 'No response'

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 })
  }
}
