import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Info() {
  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className="space-y-2 w-screen md:max-w-[450px] px-4">
        <div className="bg-muted px-4 rounded-xl">
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>How it works?</AccordionTrigger>
              <AccordionContent>
                Gasless creates a receiver account that can only be controlled by you so you send your tokens there and then leveraging meta transactions we allow you to swap some for native gas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Why do I need it?</AccordionTrigger>
              <AccordionContent>
                You&apos;re trying to fund a new wallet, someone wants to send you funds in a chain you don&apos;t use yet. In summary you&apos;ll receive tokens and no gas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I avoid the relayer?</AccordionTrigger>
              <AccordionContent>
                Yes. You&apos;re totally free to interact with the forwarder without our relayer, it&apos;s just simpler with it. Just take your forwarder address and find the contract in etherscan. Use the receiver account to call the forwarder without a signature, or assemble the signature to use your own relayer. Only catch is you&apos;ll need native.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
