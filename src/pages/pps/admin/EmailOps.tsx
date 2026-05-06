import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EmailHealth from "./EmailHealth";
import EmailQueue from "./EmailQueue";
import GitHubSyncHealth from "./GitHubSyncHealth";

export default function EmailOps() {
  return (
    <div className="p-0">
      <Tabs defaultValue="health" className="w-full">
        <div className="px-6 pt-6 max-w-7xl mx-auto">
          <TabsList>
            <TabsTrigger value="health">Health & Send log</TabsTrigger>
            <TabsTrigger value="queue">Queue inspector & mitigation</TabsTrigger>
            <TabsTrigger value="github">GitHub sync</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="health" className="mt-0">
          <EmailHealth />
        </TabsContent>
        <TabsContent value="queue" className="mt-0">
          <EmailQueue />
        </TabsContent>
        <TabsContent value="github" className="mt-0">
          <GitHubSyncHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

