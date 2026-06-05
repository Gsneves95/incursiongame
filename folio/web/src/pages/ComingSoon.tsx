import { useTranslation } from "react-i18next";
import { Shell } from "../components/Shell";
import { EmptyState } from "../components/ui/primitives";
import type { IconName } from "../components/Icon";

export function ComingSoon({ crumb, icon }: { crumb: string; icon: IconName }) {
  const { t } = useTranslation();
  return (
    <Shell crumbs={[crumb]}>
      <EmptyState icon={icon} title={`${crumb} — ${t("common.soon")}`} desc={t("common.soonDesc")} />
    </Shell>
  );
}
