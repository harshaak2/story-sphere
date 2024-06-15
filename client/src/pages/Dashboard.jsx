import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom'

import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  useEffect(()=> {
    const urlParams = new URLSearchParams(location.search);
    //? console.log(location.search); -> ?tab=profile
    const tabFromURL = urlParams.get('tab');
    //? console.log(tabFromURL); -> profile
    if(tabFromURL){
      setTab(tabFromURL);
    }
  }, [location.search]);
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className='md:w-56' >
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* Profile */}
      {tab === 'profile' && <DashProfile />}
    </div>
  )
}
