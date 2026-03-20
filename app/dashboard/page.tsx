import { BackendShell } from "@/components/backend-shell"
import { SectionCards } from "@/components/section-cards"
import { ZlCandlestickChart } from "@/components/chart/ZlCandlestickChart"

export default function Page() {
  return (
    <BackendShell title="Dashboard">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ZlCandlestickChart height="70vh" />
      </div>
    </BackendShell>
  )
}
