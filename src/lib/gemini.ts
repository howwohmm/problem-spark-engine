
import axios from 'axios'

export async function summarize(title: string, body: string) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: `Return JSON: {problem,target_user,mvp_suggestion,tags[]}. \nTITLE:${title}\nBODY:${body}`
        }]
      }],
      generationConfig: { maxOutputTokens: 256 }
    }
  )
  const text = res.data.candidates[0].content.parts[0].text
  return JSON.parse(text)
}
