import { Outlet } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  return (
    <>
      <Nav />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}
