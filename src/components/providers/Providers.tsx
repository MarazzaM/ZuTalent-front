'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function Providers({ children }: { children: React.ReactNode }) {
    // Get the chainId from environment variables and parse it as a number
    const queryClient = new QueryClient()
    
    const defaultChain = baseSepolia;
    const supportedChains =  [baseSepolia];
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            config={{
                defaultChain,
                supportedChains,
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'light',
                    accentColor: '#19473f',
                    logo: '/juno.svg',
                    landingHeader: `Welcome to Juno`,
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                loginMethods: ['email', 'wallet']
            }}
        >
                    <QueryClientProvider client={queryClient}>
                    {children}
                    </QueryClientProvider>
        </PrivyProvider>
    );
}