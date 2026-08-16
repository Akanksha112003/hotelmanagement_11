import React, { createContext, useContext, useEffect, useState } from "react";
import { getHotelProfileDoc } from "../api/hotelProfile";

const HotelProfileContext = createContext();

export const DEFAULT_HOTEL_PROFILE = {
  name: "THE AURELIA GRAND",
  logo: "",
  address: "100 Hospitality Blvd, Heritage Precinct",
  city: "New Delhi",
  state: "Delhi",
  country: "India",
  zipCode: "110001",
  phone: "+91 (11) 2345-6789",
  email: "concierge@aureliagrand.com",
  website: "https://aureliagrand.com",
  taxNumber: "GSTIN-07AABCT8829Q1Z5",
  currency: "INR",
  timeZone: "Asia/Kolkata",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  description:
    "Classic Hospitality. Modern Excellence. The Aurelia Grand provides luxury guest accommodations, heritage hospitality, and executive management.",
  socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "" },
};

export function HotelProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_HOTEL_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await getHotelProfileDoc();
      if (res.data) {
        setProfile((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      // fallback to default profile if offline / error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfileState = (newProfile) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <HotelProfileContext.Provider
      value={{ profile, loading, refreshProfile: fetchProfile, updateProfileState }}
    >
      {children}
    </HotelProfileContext.Provider>
  );
}

export function useHotelProfile() {
  const context = useContext(HotelProfileContext);
  if (!context) {
    return {
      profile: DEFAULT_HOTEL_PROFILE,
      loading: false,
      refreshProfile: () => {},
      updateProfileState: () => {},
    };
  }
  return context;
}
