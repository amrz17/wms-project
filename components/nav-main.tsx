"use client"

import { IconCirclePlusFilled, IconDashboard, IconMail, type Icon } from "@tabler/icons-react"

import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {

            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title} className="flex items-center gap-2">
                  <Link 
                      href={item.url}
                      className={`min-w-8 w-full rounded-md duration-200 ease-linear ${
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                          : "hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <SidebarMenuButton 
                      tooltip={item.title}
                    >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>

              )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
