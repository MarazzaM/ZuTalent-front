import type { ParcnetAPI } from "@parcnet-js/app-connector";
import { POD } from "@pcd/pod";
import type { ReactNode } from "react";
import { useParcnetClient } from "./hooks/useParcnetClient";
import { Button } from "@/components/ui/button";
import * as p from "@parcnet-js/podspec";
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import Image from 'next/image';
import ZutalentLogo from "@/../public/zutalent.png";

export function PODSection({ wallet, token }: { wallet: string; token: string }): ReactNode {
  const { z, connected } = useParcnetClient();

  return !connected ? null : (
    <div>
        <InsertPOD z={z} wallet={wallet} token={token} />
    </div>
  );
}

function InsertPOD({ z, wallet, token }: { z: ParcnetAPI; wallet: string; token: string }): ReactNode {
  const [hasTicket, setHasTicket] = useState<boolean | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticketData, setTicketData] = useState<any>(null);
  console.log("ticketData", ticketData);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkExistingTicket();
  }, []);

  const checkExistingTicket = async () => {
    try {
      const query = p.pod({
        entries: {
          issuedBy: {
            type: "string",
            equalsEntry: "ZuTalent"
          },
          zupass_display: {
            type: "string",
            equalsEntry: "ZuTalent"
          },
          zupass_title: {
            type: "string",
            equalsEntry: "ZuTalent"
          },
          zupass_image_url: {
            type: "string",
            equalsEntry: "ZuTalent"
          }
        }
      });
      const existingPods = await z.pod.query(query);
      console.log("existingPods", existingPods);
      if (existingPods.length > 0) {
        setHasTicket(true);
        setTicketData(existingPods[0]);
      } else {
        setHasTicket(false);
        setTicketData(null);
      }
    } catch (error) {
      console.error('Error checking for existing ticket:', error);
      setHasTicket(null);
      setTicketData(null);
    }
  };

  const issueZuTalentTicket = async () => {
    try {
      // Query for existing POD
      const query = p.pod({
        entries: {
          issuedBy: {
            type: "string",
            equalsEntry: "ZuTalent"
          }
        }
      });
      const existingPods = await z.pod.query(query);
      console.log("existingPods", existingPods);
      if (existingPods.length > 0) {
        // User already has a ZuTalent ticket
        await Swal.fire({
          title: 'Already Issued',
          text: 'You already have a ZuTalent ticket!',
          icon: 'info',
        });
        return;
      }

      // Generate new POD
      const owner = (await z.identity.getSemaphoreV4Commitment()).toString();
      const response = await fetch(process.env.NEXT_PUBLIC_JUPITER_API_URL + '/pod/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ owner, wallet })
      });
      const serializedPOD = await response.text();
      const podObject = POD.deserialize(serializedPOD);

      // Save POD to Zupass
      await z.pod.insert(podObject);

      // Update state immediately to display the new ticket
      setHasTicket(true);
      setTicketData(podObject);

      // Show success message
      await Swal.fire({
        title: 'Success',
        text: 'ZuTalent ticket has been issued and saved to your Zupass!',
        icon: 'success',
      });

      // Re-check for existing ticket after successful issuance
      // This is now optional, as we've already updated the state
      await checkExistingTicket();

      // Ignore unused 'error' variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'An error occurred while processing your ZuTalent ticket.',
        icon: 'error',
      });
    }
  };

  const verifySignature: () => Promise<void> = async () => {
    setIsVerifying(true);
    try {
      const isValid = ticketData.verifySignature();
      if (isValid) {
        await Swal.fire({
          title: 'Signature Verified',
          text: 'The ticket signature is valid.',
          icon: 'success',
        });
      } else {
        await Swal.fire({
          title: 'Invalid Signature',
          text: 'The ticket signature could not be verified.',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      await Swal.fire({
        title: 'Verification Error',
        text: 'An error occurred while verifying the signature.',
        icon: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const attestOnBase = async () => {
    setIsAttesting(true);
    try {
      const serializedTicketData = ticketData.serialize();

      const response = await fetch(`${process.env.NEXT_PUBLIC_JUPITER_API_URL}/attestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: serializedTicketData,
      });

      if (response.ok) {
        const result = await response.json();
        let attestationId;

        if (result.message === "New attestation created") {
          attestationId = result.attestationUID;
        } else if (result.message === "Attestation already exists for this nullifier") {
          attestationId = result.existingAttestation.id;
        }

        if (attestationId) {
          const attestationUrl = `https://base-sepolia.easscan.org/attestation/view/${attestationId}`;
          await Swal.fire({
            title: 'Attestation Successful',
            text: 'Your ticket has been attested on Base.',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Go to Attestation',
            cancelButtonText: 'Close',
          }).then((result) => {
            if (result.isConfirmed) {
              window.open(attestationUrl, '_blank');
            }
          });
        } else {
          throw new Error('Attestation ID not found in response');
        }
      } else {
        throw new Error('Attestation failed');
      }
    } catch (error) {
      console.error('Error attesting on Base:', error);
      await Swal.fire({
        title: 'Attestation Error',
        text: 'An error occurred while attesting on Base.',
        icon: 'error',
      });
    } finally {
      setIsAttesting(false);
    }
  };

  if (hasTicket === null) {
    return <div>Error checking ticket status. Please try again.</div>;
  }

  if (hasTicket && ticketData) {
    const entries = ticketData._content._map;
    console.log("Ticket entries:", entries);

    const getEntryValue = (key: string) => {
      const entry = entries.get(key);
      console.log(`Entry for ${key}:`, entry);

      if (!entry) return '';
      
      try {
        if (typeof entry.value === 'string') {
          const parsedValue = JSON.parse(entry.value);
          return parsedValue.value || '';
        } else if (typeof entry.value === 'object' && entry.value !== null) {
          return entry.value.value || '';
        } else {
          return String(entry.value);
        }
      } catch (error) {
        console.error(`Error parsing value for ${key}:`, error);
        return String(entry.value);
      }
    };

    return (
      <CardContainer className="inter-var">
        <CardBody className="bg-gradient-to-br from-primarydark to-accentdark relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-zupass text-center w-full"
          >
            {getEntryValue('zupass_title')}
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-zupass text-sm max-w-sm mt-2 text-center"
          >
            Issued by: {getEntryValue('issuedBy')}
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <Image
              src={ZutalentLogo}
              height={200}
              width={200}
              className="h-60 w-60 object-cover rounded-xl group-hover/card:shadow-xl mx-auto"
              alt="ZuTalent Ticket"
            />
          </CardItem>
          <CardItem
            translateZ="50"
            className="text-zupass text-center text-sm font-normal max-w-xs mx-auto mt-4"
          >
            {getEntryValue('zupass_display')}
          </CardItem>
          <CardItem
            translateZ="50"
            className="text-zupass text-center text-xs font-normal max-w-xs mx-auto mt-2"
          >
            Wallet: {getEntryValue('wallet')}
          </CardItem>
          <CardItem
            translateZ="50"
            className="text-zupass text-center text-xs font-normal max-w-xs mx-auto mt-1"
          >
            Issued: {new Date(parseInt(getEntryValue('timestamp'))).toLocaleString()}
          </CardItem>
          <CardItem
            translateZ="50"
            className="w-full mt-4 flex space-x-2"
          >
            <Button 
              onClick={verifySignature} 
              disabled={isVerifying}
              className="w-1/2 bg-accentdark text-zupass hover:bg-accentdarker transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Verify Signature'}
            </Button>
            <Button 
              onClick={attestOnBase} 
              disabled={isAttesting}
              className="w-1/2 bg-accentdark text-zupass hover:bg-accentdarker transition-colors"
            >
              {isAttesting ? 'Attesting...' : 'Attest on Base'}
            </Button>
          </CardItem>
        </CardBody>
      </CardContainer>
    );
  }

  return (
    <div>
      <Button onClick={issueZuTalentTicket} variant="default">Issue ZuTalent Ticket</Button>
    </div>
  );
}