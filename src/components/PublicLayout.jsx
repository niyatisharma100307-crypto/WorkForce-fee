import { Outlet } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';

export default function PublicLayout() {
  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  );
}
