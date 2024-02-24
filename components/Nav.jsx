"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

const Nav = () => {
  const { data: session, status, update } = useSession();
  const [localsession, setLocalSession] = useState(null);
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => update(), 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [update]);

  useEffect(() => {
    const visibilityHandler = () => {
      if (document.visibilityState === "visible" && update()) {
        const localData = localStorage.getItem('userSession');
        if (localData && localsession === null) {
          setLocalSession(JSON.parse(localData));
        } else if (!localData && localsession !== null) {
          setLocalSession(null);
        }
      }
    };
    window.addEventListener("visibilitychange", visibilityHandler);
    return () => window.removeEventListener("visibilitychange", visibilityHandler);
  }, [localsession, update]);

  useEffect(() => {
    const localData = localStorage.getItem('userSession');
    if (localData && localsession === null) {
      setLocalSession(JSON.parse(localData));
    } else if (!localData && localsession !== null) {
      setLocalSession(null);
    }
  },[]);

  const eraseLocalStorage = () => {
    localStorage.removeItem('userSession');
  };

  return (
    <nav className='flex justify-between w-full pt-3'>
      {localsession &&
        <Link href='/' className='flex gap-2 flex-center'>
          <h2>SAYA</h2>
        </Link>
      }

      {/* Desktop Navigation */}
      <div className=''>
        {localsession &&
          <div className='flex gap-3 md:gap-5'>
            <button type='button' onClick={() => {
              signOut();
              eraseLocalStorage();
            }} className='outline_btn'>
              <h2 className="text-2xl">Sign Out</h2>
            </button>

            <Link className="flex justify-between" href='/profile'>
              <Image
                src={localsession?.user.image}
                width={37}
                height={37}
                className='rounded-full'
                alt='profile'
              />
              <h2 className="text-lg">{localsession?.user.name}</h2>
            </Link>
          </div>
        }
      </div>
    </nav>
  );
};

export default Nav;
