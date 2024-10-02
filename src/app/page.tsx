"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const DynamicWrapper = dynamic(() => import('@/components/zupass/POD/Wrapper'), {
  ssr: false,
  loading: () => <p>Loading...</p>
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
    if (data.statusCode === 400 && data.message.includes("Insufficient score")) {
      Swal.fire({
        title: 'Insufficient Score',
        text: 'Your score is not high enough. The minimum required score is 20.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
    throw new Error(data.message || 'Network response was not ok');
  }
  
  return data;
};

function Page() {
  const { login, ready, authenticated, user, logout, getAccessToken } = usePrivy();
  const [showZupass, setShowZupass] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zupass">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-accentdark"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zupass text-white">
      <header className="p-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-accentdark">ZuTalent</div>
        {authenticated && (
          <Button onClick={() => logout()} className="bg-accentdark text-zupass hover:bg-accentdarker transition-colors">
            Disconnect
          </Button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        {!authenticated ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-6xl font-bold mb-8 text-accentdark">Welcome to ZuTalent</h1>
            <p className="text-2xl mb-12 text-accentdark">Unlock your potential with ZuTalent</p>
            <Button onClick={() => login()} className="bg-accentdark text-zupass text-xl py-4 px-10 rounded-full hover:bg-accentdarker transition-colors">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-accentdark">Your ZuTalent Dashboard</h1>
            {isPassportLoading ? (
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accentdark"></div>
            ) : passportError ? (
              <p className="text-red-500">Error loading passport: {(passportError as Error).message}</p>
            ) : passportData ? (
              <div className="space-y-8">
                <div className="bg-primarydark rounded-lg p-8 shadow-lg">
                  <p className="text-3xl mb-4">Your ZuTalent Score</p>
                  <p className="text-6xl font-bold text-accentdark">{score}</p>
                </div>
                {score > 20 ? (
                  <div className="mt-8">
                    {!showZupass ? (
                      <Button onClick={() => setShowZupass(true)} className="bg-accentdark text-zupass text-xl py-4 px-10 rounded-full hover:bg-accentdarker transition-colors">
                        Connect Zupass
                      </Button>
                    ) : (
                      user?.wallet?.address && accessToken && <DynamicWrapper wallet={user.wallet.address} token={accessToken} />
                    )}
                  </div>
                ) : (
                  <p className="text-xl mt-8">Reach a score of 20 or higher to obtain a ZuTalent. Keep building your skills!</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-accentdark">
        <p>&copy; 2023 ZuTalent. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Page;