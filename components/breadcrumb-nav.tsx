"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    href?: string;
    dynamic?: boolean;
  };
}

interface DynamicBreadcrumbProps {
  memberName?: string;
  customConfig?: BreadcrumbConfig;
}

const defaultBreadcrumbConfig: BreadcrumbConfig = {
  dashboard: {
    label: "Dashboard",
    href: "/dashboard",
  },
  members: {
    label: "Members",
    href: "/dashboard/members",
  },
  create: {
    label: "Create",
  },
  "registration-success": {
    label: "Registration Success",
  },
  // Add more routes as needed
  projects: {
    label: "Projects",
    href: "/dashboard/projects",
  },
  analytics: {
    label: "Analytics",
    href: "/dashboard/analytics",
  },
  lifecycle: {
    label: "Lifecycle",
    href: "/dashboard/lifecycle",
  },
};

export function DynamicBreadcrumb({
  memberName,
  customConfig = {},
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Merge default config with custom config
  const breadcrumbConfig = { ...defaultBreadcrumbConfig, ...customConfig };

  // Generate breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    // Check if this is a member ID (UUID pattern)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment,
      );

    let label = segment;
    let linkHref = href;

    if (breadcrumbConfig[segment]) {
      label = breadcrumbConfig[segment].label;
      linkHref = breadcrumbConfig[segment].href || href;
    } else if (isUUID && memberName) {
      // If it's a UUID and we have a member name, use the member name
      label = memberName;
    } else {
      // Format segment name (capitalize and replace hyphens with spaces)
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return {
      label,
      href: linkHref,
      isLast,
      segment,
    };
  });

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.segment} className="flex items-center">
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
