"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconDashboard,
  IconFlame,
  IconGavel,
  IconHelp,
  IconMoodSmile,
  IconSearch,
  IconTargetArrow,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Authenticated User",
    email: "session@zinc-fusion-v16",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Strategy",
      url: "/strategy",
      icon: IconTargetArrow,
    },
    {
      title: "Legislation",
      url: "/legislation",
      icon: IconGavel,
    },
    {
      title: "Sentiment",
      url: "/sentiment",
      icon: IconMoodSmile,
    },
    {
      title: "Vegas Intel",
      url: "/vegas-intel",
      icon: IconFlame,
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "/",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 data-[slot=sidebar-menu-button]:!h-auto"
            >
              <a href="/dashboard">
                <Image
                  src="/logo-dashboard.svg"
                  alt="ZINC Fusion"
                  width={140}
                  height={32}
                  className="dark:invert-0"
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
