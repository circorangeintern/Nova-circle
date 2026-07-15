import { ComingSoon } from "@/components/common/ComingSoon";

export default function Dashboard() {
  return (
    <ComingSoon
      title="Public Accountability Dashboard"
      description="Turning thousands of reports into insight KPIs, trends over time, category breakdowns and an LGA response-rate leaderboard. Building next after the MVP review."
      roadmap={[
        "KPI cards",
        "Reports over time",
        "Reports by category",
        "LGA leaderboard",
        "Severity distribution",
      ]}
    />
  );
}
