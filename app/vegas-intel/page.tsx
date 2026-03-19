import { BackendShell } from "@/components/backend-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VegasIntelPage() {
  return (
    <BackendShell title="Vegas Intel">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Vegas Intel Dashboard</CardTitle>
            <CardDescription>
              Operational intelligence for venues, events, and account impact.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Wire this page to `/api/vegas/intel` and vegas schema readers when pipeline adapters are enabled.
          </CardContent>
        </Card>
      </div>
    </BackendShell>
  );
}
