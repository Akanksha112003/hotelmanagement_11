import React, { createContext, useContext, useEffect, useState } from "react";
import { getHotelProfileDoc } from "../api/hotelProfile";

const HotelProfileContext = createContext();

export const DEFAULT_HOTEL_PROFILE = {
  name: "Azure Coast Resort & Spa",
  logo: "",
  address: "100 Hospitality Blvd, Ocean View Drive",
  city: "Miami",
  state: "Florida",
  country: "United States",
  zipCode: "33139",
  phone: "+1 (800) 555-HOTEL",
  email: "contact@azurecoastresort.com",
  website: "https://azurecoastresort.com",
  taxNumber: "TX-882901",
  currency: "USD",
  timeZone: "America/New_York",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  description:
    "Luxury seaside hotel and resort offering premium guest accommodations, world-class amenities, and executive hospitality management.",
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
