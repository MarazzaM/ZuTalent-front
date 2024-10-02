"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

const DynamicWrapper = dynamic(() => import('@/components/zupass/POD/Wrapper'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

// Function to fetch passport data
const fetchPassport = async (walletAddress: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_JUPITER_API_URL}/score/passport/${walletAddress}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function Page() {
  const { login, ready, authenticated, user } = usePrivy();
  const [showZupass, setShowZupass] = useState(false);

  // Query for fetching passport data
  const { data: passportData, isLoading: isPassportLoading, error: passportError } = useQuery({
    queryKey: ['passport', user?.wallet?.address],
    queryFn: () => fetchPassport(user?.wallet?.address || ''),
    enabled: !!user?.wallet?.address, // Only run the query if we have a wallet address
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Welcome to the App</h1>
        <Button onClick={() => login()}>Sign In with Privy</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Welcome</h1>
      {isPassportLoading ? (
        <p>Loading passport data...</p>
      ) : passportError ? (
        <p>Error loading passport: {(passportError as Error).message}</p>
      ) : passportData ? (
        <>
          <p>Passport data loaded successfully!</p>
          {passportData.score > 20 ? (
            <>
              {!showZupass ? (
                <Button onClick={() => setShowZupass(true)}>Connect Zupass</Button>
              ) : (
                user?.wallet?.address && <DynamicWrapper wallet={user.wallet.address} token={passportData} />
              )}
            </>
          ) : (
            <p>Your score is not high enough to connect Zupass.</p>
          )}
        </>
      ) : null}
    </div>
  );
}

export default Page;