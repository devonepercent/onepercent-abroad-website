import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackerBoard } from "./TrackerBoard";
import { ProjectOverview } from "./ProjectOverview";

const PROJECT_NAME = "1%agent";

export function ProjectView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">{PROJECT_NAME}</h2>
        <span className="text-xs text-muted-foreground">· Project workspace</span>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverview projectName={PROJECT_NAME} />
        </TabsContent>

        <TabsContent value="board">
          <TrackerBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
