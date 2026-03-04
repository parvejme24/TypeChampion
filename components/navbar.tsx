"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated" && !!user;
  const isAdmin = (user as { dbUser?: { role?: string } })?.dbUser?.role === "admin";

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="border-b border-default-200 dark:border-default-100">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <Logo />
            <p className="font-bold text-inherit">TypeChampion</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:font-medium",
                    isActive && "underline underline-offset-4 decoration-2",
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem>
          {isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="outline-none rounded-full">
                  <Avatar
                    isBordered
                    as="span"
                    size="sm"
                    src={user?.image ?? undefined}
                    name={user?.name ?? user?.email ?? "User"}
                    className="cursor-pointer"
                  />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                variant="flat"
                className="w-60"
              >
                <DropdownItem
                  key="user-info"
                  className="h-14 gap-1 flex flex-col items-center justify-center text-center"
                  isReadOnly
                  textValue={user?.email ?? "Signed in user"}
                >
                  {user?.name && (
                    <p className="text-sm font-medium truncate w-full">{user.name}</p>
                  )}
                  <p className="text-xs text-default-500 truncate w-full">
                    {user?.email}
                  </p>
                </DropdownItem>
                <DropdownItem key="profile" as={NextLink} href="/profile" textValue="Profile">
                  Profile
                </DropdownItem>
                <DropdownItem key="practice" as={NextLink} href="/my-typed-list" textValue="My Typed List">
                  My Typed List
                </DropdownItem>
                {isAdmin && (
                  <>
                    <DropdownItem
                      key="admin-users"
                      as={NextLink}
                      href="/admin/users"
                      textValue="Manage User"
                    >
                      Manage User
                    </DropdownItem>
                    <DropdownItem
                      key="admin-paragraphs"
                      as={NextLink}
                      href="/admin/paragraphs"
                      textValue="Manage Paragraphs"
                    >
                      Manage Paragraphs
                    </DropdownItem>
                  </>
                )}
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={() => signOut({ callbackUrl: "/" })}
                  textValue="Logout"
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              as={Link}
              className="text-sm font-normal"
              href="/login"
              variant="flat"
            >
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <NavbarMenuItem key={`${item.href}-${index}`}>
                <Link
                  as={NextLink}
                  className={clsx(
                    isActive && "underline underline-offset-4 decoration-2",
                    !isActive && index === siteConfig.navMenuItems.length - 1 && "text-primary font-medium",
                  )}
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          })}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
