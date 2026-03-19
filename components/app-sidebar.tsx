"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFlame,
  IconGavel,
  IconHelp,
  IconInnerShadowTop,
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
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">ZINC Fusion V16</span>
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
