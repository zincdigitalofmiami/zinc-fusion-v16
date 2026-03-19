import { BackendShell } from "@/components/backend-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegislationPage() {
  return (
    <BackendShell title="Legislation">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Legislation Dashboard</CardTitle>
            <CardDescription>
              Policy and regulatory feed monitoring surface.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Wire this page to `/api/legislation/feed` for daily updates from legislation and executive-action sources.
          </CardContent>
        </Card>
      </div>
    </BackendShell>
  );
}
