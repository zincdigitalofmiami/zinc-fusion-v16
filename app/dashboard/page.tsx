import { BackendShell } from "@/components/backend-shell"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <BackendShell title="Dashboard">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Notes</CardTitle>
            <CardDescription>
              Backend UI template is installed and mapped to your core page surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The scaffold cards and chart are now focused on page/dashboard operations instead of product sales metrics.
          </CardContent>
        </Card>
      </div>
    </BackendShell>
  )
}
