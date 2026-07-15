"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const categories: { title: string; href: string; description: string }[] = [
  {
    title: "New Arrivals",
    href: "/all-products?category=new_arrivals",
    description: "Latest styles and fresh drops just landed.",
  },
  {
    title: "T-Shirts",
    href: "/all-products?category=t-shirts",
    description: "Graphic tees, polos, and classic crew necks.",
  },
  {
    title: "Shirts",
    href: "/all-products?category=shirts",
    description: "From casual linen to formal button-downs.",
  },
  {
    title: "Pants & Jeans",
    href: "/all-products?category=pants",
    description: "Jeans, chinos, cargos, and tailored trousers.",
  },
  {
    title: "Shorts",
    href: "/all-products?category=shorts",
    description: "Bermuda, chino, athletic, and swim trunks.",
  },
  {
    title: "Outerwear",
    href: "/all-products?category=outerwear",
    description: "Jackets, coats, parkas, and bombers.",
  },
  {
    title: "Hoodies",
    href: "/all-products?category=hoodies",
    description: "Pullovers, zip-ups, and sweatshirts.",
  },
  {
    title: "Activewear",
    href: "/all-products?category=activewear",
    description: "Performance gear for training and beyond.",
  },
];

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <h3 className="text-xl">Shop</h3>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {categories.map((cat) => (
                <Link href={cat.href} key={cat.title}>
                  <ListItem
                    title={cat.title}
                    href={cat.href}
                  >
                    {cat.description}
                  </ListItem>
                </Link>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
