import type { ParcnetAPI } from "@parcnet-js/app-connector";
import { POD } from "@pcd/pod";
import type { ReactNode } from "react";
import { useParcnetClient } from "./hooks/useParcnetClient";
import { Button } from "@/components/ui/button";
import * as p from "@parcnet-js/podspec";
import Swal from 'sweetalert2';

export function PODSection({ wallet, token }: { wallet: string; token: string }): ReactNode {
  const { z, connected } = useParcnetClient();

  return !connected ? null : (
    <div>
        <InsertPOD z={z} wallet={wallet} token={token} />
    </div>
  );
}

function InsertPOD({ z, wallet, token }: { z: ParcnetAPI; wallet: string; token: string }): ReactNode {
  const issueZuTalentTicket = async () => {
    try {
      // Query for existing POD
      const query = p.pod({
        entries: {
          issuedBy: {
            type: "string",
            equalsEntry: "Jupiter"
          }
        }
      });
      const existingPods = await z.pod.query(query);

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

      // Show success message
      await Swal.fire({
        title: 'Success',
        text: 'ZuTalent ticket has been issued and saved to your Zupass!',
        icon: 'success',
      });

    } catch (error) {
      console.error('Error processing ZuTalent ticket:', error);
      await Swal.fire({
        title: 'Error',
        text: 'An error occurred while processing your ZuTalent ticket.',
        icon: 'error',
      });
    }
  };

  return (
    <div>
      <Button onClick={issueZuTalentTicket} variant="default">Issue ZuTalent Ticket</Button>
    </div>
  );
}
