import './globals.css'
import Nav from "@components/Nav";
import Provider from "@components/Provider";

export const metadata = {
  title: 'Capstone Prototype',
  description: 'AI Productivity Asssistant by Ninad Patil',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <Provider>
        <main className='app'>
          <Nav />
          {children}
        </main>
      </Provider>
    </body>
    </html>
  )
}
