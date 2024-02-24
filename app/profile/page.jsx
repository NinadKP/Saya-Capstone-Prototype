"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Profile from "@components/Profile";

const MyProfile = (params) => {
  const router = useRouter();
  const { data: session } = useSession();
  if (session?.user.id) {const name = session.user.name;

  return (
    <Profile
      name={name+"'s"}
      desc={'Profile with context'}

    />
    
  );
  }
  {
    return (
      <Profile
        name={'Your'}
        desc={'Profile with context'}
  
      />
      
    );
  }
};

export default MyProfile;