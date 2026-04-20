import { CreateEventForm } from "./components/CreateEventForm";
import { EventList } from "./components/EventList";
import { LiveNetworkStatus } from "./components/LiveNetworkStatus";
import { WalletSection } from "./components/WalletSection";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <h1>Blockchain based Event Management System</h1>
          <p className="header__tagline">
            Create, discover, register, and manage community events with secure
            wallet-based actions on blockchain.
          </p>
        </div>
        <LiveNetworkStatus />
      </header>

      <main className="main">
        <WalletSection />
        <section className="quick-guide">
          <h2>How to use</h2>
          <div className="quick-guide__steps">
            <p>
              <strong>1. Connect:</strong> Link your wallet and switch to a
              supported network.
            </p>
            <p>
              <strong>2. Create / RSVP:</strong> Publish your event or register
              for existing ones.
            </p>
            <p>
              <strong>3. Manage:</strong> Organizers can cancel their own events
              at any time.
            </p>
          </div>
        </section>
        <div className="grid">
          <CreateEventForm />
          <EventList />
        </div>
      </main>

      <footer className="footer">
        <p>
          Built for coursework: wallet actions are always explicit, status is
          shown in plain language, and nothing runs without your approval.
        </p>
      </footer>
    </div>
  );
}
