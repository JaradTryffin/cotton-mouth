import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicBreadcrumb } from "@/components/breadcrumb-nav";

interface SiteHeaderProps {
  memberName?: string;
  customTitle?: string;
}

export function SiteHeader({ memberName, customTitle }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {customTitle ? (
          <h1 className="text-base font-medium">{customTitle}</h1>
        ) : (
          <DynamicBreadcrumb memberName={memberName} />
        )}
      </div>
    </header>
  );
}
