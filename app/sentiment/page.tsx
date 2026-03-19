import { BackendShell } from "@/components/backend-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SentimentPage() {
  return (
    <BackendShell title="Sentiment">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Dashboard</CardTitle>
            <CardDescription>
              Market narrative and positioning summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Wire this page to `/api/sentiment/overview` and related CFTC/News contracts.
          </CardContent>
        </Card>
      </div>
    </BackendShell>
  );
}
