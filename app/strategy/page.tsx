import { BackendShell } from "@/components/backend-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StrategyPage() {
  return (
    <BackendShell title="Strategy">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Dashboard</CardTitle>
            <CardDescription>
              Posture, target zones, and execution guidance surface.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Wire this page to `/api/strategy/posture` and `/api/zl/target-zones` once live readers are enabled.
          </CardContent>
        </Card>
      </div>
    </BackendShell>
  );
}
