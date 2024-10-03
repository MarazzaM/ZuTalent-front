"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy, useLinkAccount } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
// Import new components
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SparklesCore } from "@/components/ui/sparkles";
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket, Plus, LogOut } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Loader2 } from 'lucide-react';

const DynamicWrapper = dynamic(() => import('@/components/zupass/POD/Wrapper'), {
  ssr: false,
});

// Function to fetch passport data
const fetchPassport = async (walletAddress: string, getAccessToken: () => Promise<string | null>) => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Failed to get access token');
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_JUPITER_API_URL}/score/passport/${walletAddress}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Network response was not ok');
  }
  
  return data;
};

function Page() {
  const { login, ready, authenticated, user, logout, getAccessToken } = usePrivy();
  const [showZupass, setShowZupass] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZupassLoading, setIsZupassLoading] = useState(false);
  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [ready]);

  // Updated query for fetching passport data
  const { data: passportData, isLoading: isPassportLoading, error: passportError } = useQuery({
    queryKey: ['passport', user?.wallet?.address],
    queryFn: async () => {
      const address = user?.wallet?.address;
      if (!address) {
        throw new Error('Wallet address not available');
      }
      const token = await getAccessToken();
      setAccessToken(token);
      return fetchPassport(address, getAccessToken);
    },
    enabled: !!user?.wallet?.address && authenticated, // Only run the query if we have a wallet address and the user is authenticated
  });
  const score = passportData?.passport.score;

  const { linkEmail } = useLinkAccount({
    onSuccess: (user, linkMethod, linkedAccount) => {
      console.log('Email linked successfully:', linkedAccount);
      Swal.fire({
        title: 'Success',
        text: 'Email linked successfully. You can now get your hackathon ticket.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Proceed to get the hackathon ticket
        handleGetHackathonTicketAfterEmailLink();
      });
    },
    onError: (error, details) => {
      console.error('Error linking email:', error, details);
      Swal.fire({
        title: 'Error',
        text: 'Failed to link email. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });

  const handleGetHackathonTicket = async () => {
    if (!user?.email) {
      try {
        await linkEmail();
        // The success and error handling will be done in the callbacks
      } catch (error) {
        console.error('Error initiating email link:', error);
      }
    } else {
      handleGetHackathonTicketAfterEmailLink();
    }
  };

  const handleGetHackathonTicketAfterEmailLink = async () => {
    try {
      if (!user || !user?.email?.address) {
        throw new Error('User email not available');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_JUPITER_API_URL}/attendees/${user.email.address}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          Swal.fire({
            title: 'You are eligible for a Zupass!',
            text: 'Would you like to open the Zupass link?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Open Zupass',
            cancelButtonText: 'Close'
          }).then((result) => {
            if (result.isConfirmed) {
              window.open(data.url, '_blank');
            }
          });
        } else {
          throw new Error('URL not found in response');
        }
      } else {
        Swal.fire({
          title: 'Not Registered',
          text: 'You didn\'t register for the hackathon!',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error checking hackathon registration:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to check hackathon registration. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleShowZupass = () => {
    setIsZupassLoading(true);
    setShowZupass(true);
  };

  useEffect(() => {
    if (showZupass) {
      // Set a timeout to simulate the loading time of the DynamicWrapper
      const timer = setTimeout(() => {
        setIsZupassLoading(false);
      }, 3000); // Adjust this time as needed

      return () => clearTimeout(timer);
    }
  }, [showZupass]);

  return (
    <div className="bg-zupass min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-zupass"
          >
            <motion.div
              animate={{
                scale: [1, 2, 2, 1, 1],
                rotate: [0, 0, 270, 270, 0],
                borderRadius: ["20%", "20%", "50%", "50%", "20%"],
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: 0,
              }}
              className="w-32 h-32 bg-accentdark"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col min-h-screen bg-zupass text-white"
      >
        <BackgroundBeams />
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full absolute top-0 left-0 pointer-events-none"
        />

        <header className="relative z-10 p-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <Image
              src="/zutalent.png"
              alt="ZuTalent Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="text-3xl font-bold text-accentdark">ZuTalent</span>
          </motion.div>
          {authenticated && (
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {ProfileAvatar(user?.wallet?.address || 'Unknown')}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Plus className="mr-2 h-4 w-4" />
                    <span onClick={handleGetHackathonTicket}>Get Hackathon ticket</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-8 text-center">
          {!authenticated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Image
                src="/zutalent.png"
                alt="ZuTalent Logo"
                width={150}
                height={150}
                className="mx-auto mb-8"
              />
              <h1 className="text-6xl font-bold mb-8 text-accentdark">
                <TextGenerateEffect words="Welcome to ZuTalent" />
              </h1>
              <p className="text-2xl mb-12 text-accentdark">Unlock your potential with ZuTalent</p>
              <Button
                onClick={() => login()}
                className="bg-accentdark text-zupass text-xl py-4 px-10 rounded-full hover:bg-accentdarker transition-all hover:scale-105"
              >
                Connect Wallet
              </Button>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold mb-8 text-accentdark">Talent Dashboard</h1>
              {isPassportLoading ? (
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accentdark"></div>
              ) : passportError ? (
                <p className="text-red-500">Error loading passport: {(passportError as Error).message}</p>
              ) : passportData ? (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-primarydark to-accentdark rounded-2xl p-8 shadow-lg flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-2xl mb-2 text-zupass">Your ZuTalent Score</p>
                      <p className="text-6xl font-bold text-zupass">{score}</p>
                    </div>
                    <div className="w-32 h-32">
                      <CircularProgressbar
                        value={score}
                        maxValue={100}
                        text={`${score}%`}
                        styles={buildStyles({
                          textColor: '#ffffff',
                          pathColor: '#ffd700',
                          trailColor: 'rgba(255,255,255,0.2)',
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-8">
                    {!showZupass ? (
                      <Button onClick={handleShowZupass} className="bg-accentdark text-zupass text-xl py-4 px-10 rounded-full hover:bg-accentdarker transition-colors">
                        Connect Zupass
                      </Button>
                    ) : isZupassLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading Zupass integration...</span>
                      </div>
                    ) : (
                      user?.wallet?.address && accessToken && <DynamicWrapper wallet={user.wallet.address} token={accessToken} />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </main>

        <footer className="relative z-10 p-6 text-center text-accentdark">
          <p>&copy; 2024 ZuTalent. All rights reserved.</p>
        </footer>
      </motion.div>
    </div>
  );
}

export default Page;