"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

export default function Home() {
  const { data: session, status, update } = useSession();
  const [calendars, setCalendars] = useState("");
  const [providers, setProviders] = useState(null);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [localsession, setLocalSession] = useState(null);
  const [events, setEvents] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedChars, setSelectedChars] = useState(null);
  const [context, setContext] = useState("");
  const [selectedContext, setSelectedContext] = useState([]);
  const [report, setReport] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  useEffect(() => {
    const visibilityHandler = () => {
      if (document.visibilityState === "visible" && update()) {
        if (localsession !== null) {
          const localData = localStorage.getItem("userSession");
          if (localData) {
            setLocal();
          } else {
            setLocalSession(null);
            setCalendars("");
            setEvents("");
            setContext(null);
          }
        }
      }
    };
    window.addEventListener("visibilitychange", visibilityHandler, false);
    return () =>
      window.removeEventListener("visibilitychange", visibilityHandler, false);
  }, [localsession]);

  const toggleEventSelection = async (eventId) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  useEffect(() => {
    let charcount = 0;
    for (let i = 0; i < selectedEvents.length; i++) {
      const selectedEvent = events.find((event) => event.id === selectedEvents[i]);
      if (selectedEvent) {
        charcount += countCharacters(selectedEvent.summary, selectedEvent.description);
      }
    }
    setSelectedChars(50000 - charcount);
  }, [selectedEvents, events]);

  const handleFetchCalendarData = async () => {
    const userSession = JSON.parse(localStorage.getItem("userSession"));
    const queryParams = new URLSearchParams({ token: JSON.stringify(userSession.accessToken) });
    const url = `/api/calendar?${queryParams.toString()}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const calendarData = data;
      setCalendars(calendarData);
      const updatedSession = { ...localsession, calendars: calendarData };
      localStorage.setItem("userSession", JSON.stringify(updatedSession));
      setLocal();
      console.log("Calendars:", calendarData);
    }
  };

  const fetchEvents = async () => {
    const userSession = JSON.parse(localStorage.getItem("userSession"));
    console.log("Selected Calendars:", selectedCalendars);
    const queryParams = new URLSearchParams({
      calendars: selectedCalendars,
      token: JSON.stringify(userSession.accessToken),
    });

    const response = await fetch(`/api/events?${queryParams}`);
    if (response.ok) {
      const data = await response.json();
      const eventData = data;
      setEvents(eventData);
      const updatedSession = { ...localsession, events: eventData };
      localStorage.setItem("userSession", JSON.stringify(updatedSession));
      setLocal();
    }
  };

  const generateReport = async () => {

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: context}),
    });
    const data = await response.json();

    console.log("data.result.content", data.result.content);
    const reportData = data.result.content;
    setReport(reportData);
    console.log(report);
  };

  const fetchContext = async () => {
    console.log("Selected Events:", selectedEvents);

    const scontext = selectedEvents.map((eventId) =>
      events.find((event) => event.id === eventId)
    ).filter(Boolean);
    console.log(scontext);
    setContext(scontext);
    console.log(context);
    const updatedSession = { ...localsession, context: scontext };
    localStorage.setItem("userSession", JSON.stringify(updatedSession));
    setLocal();
  };

  const countCharacters = (eventName, description) => {
    const eventNameLength = eventName.length;
    const descriptionLength = description ? description.length : 0;
    return eventNameLength + descriptionLength;
  };

  const storeSession = () => {
    localStorage.setItem("userSession", JSON.stringify(session));
    setLocalSession(JSON.parse(localStorage.getItem("userSession")));
  };

  const handleChange = async (contextData) => {
    prevContext = context;
    setContext((prevContext) => {
      return prevContext.map((event) => {
        if (event.id === selectedContext.id) {
          return { ...event, description: contextData };
        } else {
          return event;
        }
      });
    });
  };

  const setLocal = () => {
    const localData = localStorage.getItem("userSession");
    if (localData) {
      const lsession = JSON.parse(localData);

      setLocalSession(lsession);
      setCalendars(lsession.calendars);
      setEvents(lsession.events);
      setContext(lsession.context);
    }
  };

  return (
    <main className="w-full">
      <div className="flex justify-center">
        <div className="rounded-rectangle m-10 flex items-center justify-center">
          {session && !localsession && storeSession()}

          {report ? (
            <div>
              {localsession ? (
                <>
                  <div className="overflow-y-auto border border-gray-300 p-5 bg-white h-dvh w-4.5">
                    <div dangerouslySetInnerHTML={{ __html: report }} />
                  </div>
                  <button className="border border-gray-300 rounded-lg bg-white p-4 shadow-md hover:shadow-lg" onClick={generateReport}>
                    <h2 className="text-2xl">Regenerate</h2>
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <>
              {context ? (
                <div>
                  {localsession ? (
                    <>
                      <h2>Edit Context</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1 overflow-y-auto max-h-96">
                          {Array.isArray(context) && context.length > 0 && (
                            <div>
                              {context.map((event) => (
                                <div
                                  key={event[0]}
                                  className={`p-2 mb-4 cursor-pointer rounded-lg ${
                                    selectedContext === event ? "bg-blue-500" : "bg-white"
                                  }`}
                                  onClick={() => setSelectedContext(event)}
                                >
                                  <p className="text-sm">{event.summary}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 overflow-auto max-h-96">
                          <div
                            contentEditable="true"
                            className="border border-gray-300 p-5 min-h-50 bg-white"
                            onChange={(e) => handleChange(e.target.textContent)}
                          >
                            {selectedContext.description}
                          </div>
                        </div>
                      </div>
                      <button className="border border-gray-300 rounded-lg bg-white p-4 shadow-md hover:shadow-lg" onClick={generateReport}>
                        <h2 className="text-2xl">Proceed</h2>
                      </button>
                    </>
                  ) : null}
                </div>
              ) : (
                <>
                  {events ? (
                    <>
                      <div>
                        {localsession ? (
                          <>
                            <h2>Select Events</h2>
                            <div className="overflow-y-auto max-h-96">
                              {events && (
                                <div>
                                  {events.map((event) => (
                                    <div
                                      key={event.id}
                                      className={`p-2 mb-4 cursor-pointer rounded-lg ${
                                        selectedEvents.includes(event.id) ? "bg-blue-500" : "bg-white"
                                      }`}
                                      onClick={() => toggleEventSelection(event.id)}
                                    >
                                      <p className="text-sm">{event.summary}</p>
                                      <p>{countCharacters(event.summary, event.description)}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p>Character Limit: {selectedChars}</p>
                            <button className="border border-gray-300 rounded-lg bg-white p-4 shadow-md hover:shadow-lg" onClick={fetchContext}>
                              <h2 className="text-2xl">Proceed</h2>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      {calendars ? (
                        <>
                          <div>
                            {localsession ? (
                              <>
                                <h2>Select Calendar</h2>
                                <div className="overflow-y-auto max-h-96">
                                  {calendars && (
                                    <div>
                                      {calendars.map((calendar) => (
                                        <div
                                          key={calendar.id}
                                          className={`p-2 mb-4 cursor-pointer rounded-lg ${
                                            selectedCalendars === calendar.id ? "bg-blue-500" : "bg-white"
                                          }`}
                                          onClick={() => setSelectedCalendars(calendar.id)}
                                        >
                                          <p className="text-sm">{calendar.summary}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button className="border border-gray-300 rounded-lg bg-white p-4 shadow-md hover:shadow-lg" onClick={fetchEvents}>
                                  <h2 className="text-2xl">Proceed</h2>
                                </button>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid justify-center text-center">
                            <div>
                              <h1>SAYA</h1>
                            </div>
                            <div>
                              <h2>Your Personal</h2>
                              <h2>AI Assistant</h2>
                            </div>
                            <div className="m-5">
                              {localsession ? (
                                <div>
                                  <button className="border border-gray-300 rounded-lg bg-white p-4 shadow-md hover:shadow-lg" onClick={handleFetchCalendarData}>
                                    <h2 className="text-2xl">Proceed</h2>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {providers &&
                                    Object.values(providers).map((provider) => (
                                      <button
                                        type="button"
                                        key={provider.name}
                                        onClick={() => {
                                          signIn(provider.id);
                                        }}
                                        className="shadow-md hover:shadow-lg"
                                      >
                                        <img src="/sign_in2.svg" width="280" height="65" alt="Sign-In button" />
                                      </button>
                                    ))}
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
