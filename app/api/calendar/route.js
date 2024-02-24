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

    // Fetch list of calendars
    const calendarsResponse = await calendar.calendarList.list();
    const calendars = calendarsResponse.data.items;

    // console.log("List of Calendars:", calendars);

    // Return the list of calendars
    return new Response(JSON.stringify(calendars), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error retrieving calendars:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
