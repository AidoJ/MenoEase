import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import './Layout.css'

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout




