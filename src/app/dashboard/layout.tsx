import PanelShell from "@/components/panel/shell/PanelShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
