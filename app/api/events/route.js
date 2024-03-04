import {NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from 'googleapis';

export async function GET(request) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return new Response("No token", { status: 401 });
    }

    // Use the access token from the JWT
    const accessToken = token;

    // Set up the OAuth2 client
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: accessToken });

    // Create a Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Specify the calendar ID you want to fetch events from
    console.log("Fetching calendar ID");
    const selectedCalendars = request.nextUrl.searchParams ? request.nextUrl.searchParams.get('calendars') : null;
    const calendarId = selectedCalendars ? selectedCalendars.split(',') : ['primary'];
    console.log(calendarId);

    // Fetch events from the specified calendar
    const eventsResponse = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(), // Set the start time to the current date
      maxResults: 100, // You can adjust the number of events to fetch
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items;


    // Return the list of events
    return new Response(JSON.stringify(events), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error retrieving events:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
