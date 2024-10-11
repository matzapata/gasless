import DepositCard from "@/components/deposit";
import Permit from "@/components/permit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Withdraw from "@/components/withdraw";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div>
      <header className="text-center max-w-md mx-auto py-6 px-4 space-y-2">
        <h1 className="text-xl font-medium">AllForGas</h1>
        <p className="text-muted-foreground text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      </header>
      
      <div className="flex justify-center py-10">
        <Tabs defaultValue="deposit" className="w-[450px]">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              {/* <TabsTrigger value="permit">Permit</TabsTrigger> */}
            </TabsList>
            <button>
              <InformationCircleIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <TabsContent value="deposit">
            <DepositCard />
          </TabsContent>
          <TabsContent value="withdraw">
            <Withdraw />
          </TabsContent>
          <TabsContent value="permit">
            <Permit />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
