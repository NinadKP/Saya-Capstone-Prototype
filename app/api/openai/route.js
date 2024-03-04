import {NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});
export const maxDuration = 300;

export async function POST(request) {
  const body = await request.json()
  console.log(reviewPrompt(body.data));

    const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview", // model: "gpt-3.5-turbo-0125", 
    messages: [{"role": "user", "content": reviewPrompt(body.data)}],
  });

  return NextResponse.json({ result: completion.choices[0].message }, { status: 200 });

}

function reviewPrompt(events) {

  return `
  schedule_input = ${JSON.stringify(events)}
  
  function_name: [analyze_context]
    input: ["JSON"]
    rule: [I want you to act as a productivity assistant and consultant. I will provide you with a calendar schedule.
     You take a JSON input containing a list of events with summaries and descriptions providing context about the tasks. 
     The assistant should generate a detailed report that breaks down the tasks into smaller sub-tasks, offers context-aware tips for completing each task, and suggests relevant resources to aid in task completion.
     The output report should include the following for each task:
      Task breakdown: Identify smaller sub-tasks and steps necessary to complete the main task. Estimate the time taken for each sub-task.
      Context-aware tips: Analyze the summary and description of the task, then suggest detailed tips to complete the task. 
      Resource suggestions: Recommend relevant tools, articles, or materials that can assist in completing the task effectively. Recommend books, youtube videos and other links that might assist with the task.
     Additionally, the report should conclude with some specific productivity tips based on the overall schedule and tasks listed in the JSON input.
      Output in the format of a nicely formatted HTML snippet report that is already within a body tag. Nice formatted involves using bold, italics and other font styles properly. It also involves using numbered and unordered bullet lists properly.
    ]
  
  analyze_context(schedule_input)
  `;

}
