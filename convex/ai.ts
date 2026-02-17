"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const generateContract = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API key not configured");
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert legal contract drafter. 
Generates a professional contract template based on the user's request.
The output MUST be valid HTML content suitable for a rich text editor.
Use <h1> for the main title, <h2> for sections, <p> for paragraphs, and <ul>/<li> for lists.
Use placeholders in double curly braces like {{Client Name}}, {{Date}}, {{Payment Amount}} for variable parts.
Do NOT include any markdown code blocks (like \`\`\`html), just return the raw HTML string.
Keep the tone professional and legal.`
                },
                {
                    role: "user",
                    content: `Draft a contract for: ${args.prompt}`
                }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content || "";
        // Strip markdown code blocks if present
        return content.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    },
});
