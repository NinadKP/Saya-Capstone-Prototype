import {NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});


export async function POST(request) {
  const body = await request.json()
  console.log(reviewPrompt(body.data));

    const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    // "response_format": {"type": "json_object"},
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
      Task breakdown: Identify smaller sub-tasks or steps necessary to complete the main task.
      Context-aware tips: Offer productivity tips tailored to the specific task based on its summary and description. These tips should consider factors such as time constraints, complexity, and resources required.
      Resource suggestions: Recommend relevant tools, articles, or materials that can assist in completing the task effectively.
     Additionally, the report should conclude with some general productivity tips based on the overall schedule and tasks listed in the JSON input.
      Output in the format of a nicely formatted HTML snippet report that is already within a body tag.
    ]
  
  analyze_context(schedule_input)
  `;

}
