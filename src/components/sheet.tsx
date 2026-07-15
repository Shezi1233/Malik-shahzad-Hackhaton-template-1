"use client";

import { Button } from "@/components/ui/buttons";
import { TiThMenu } from "react-icons/ti";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { NavigationMenuDemo } from "./NavigationMenu";

const SHEET_SIDES = ["left"] as const;

type SheetSide = (typeof SHEET_SIDES)[number];

export function SheetSide() {
  return (
    <div className="grid gap-2">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant={"outline"}>
              <TiThMenu />
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Shop.co</SheetTitle>
            </SheetHeader>
            {/* navbav */}
            <ul className="">
              <li className="grid grid-cols-1 gap-y-4">
                <Link className="ml-3 font-bold text-lg" href={"/all-products?category=new_arrivals"}>
                  New Arrivals
                </Link>
                <Link className="ml-3" href={"/all-products?category=t-shirts"}>
                  T-Shirts
                </Link>
                <Link className="ml-3" href={"/all-products?category=shirts"}>
                  Shirts
                </Link>
                <Link className="ml-3" href={"/all-products?category=pants"}>
                  Pants &amp; Jeans
                </Link>
                <Link className="ml-3" href={"/all-products?category=shorts"}>
                  Shorts
                </Link>
                <Link className="ml-3" href={"/all-products?category=outerwear"}>
                  Outerwear
                </Link>
                <Link className="ml-3" href={"/all-products?category=hoodies"}>
                  Hoodies
                </Link>
                <Link className="ml-3" href={"/all-products?category=activewear"}>
                  Activewear
                </Link>
                <Link className="ml-3" href={"/all-products?category=top_selling"}>
                  Top Selling
                </Link>
                <hr className="my-2" />
                <Link className="ml-3" href={"/casual"}>
                  On Sale
                </Link>
                <Link className="ml-3" href={"/products"}>
                  All Products
                </Link>
              </li>
            </ul>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
