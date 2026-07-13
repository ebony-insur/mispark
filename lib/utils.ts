import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/lib/utils/affiliateLinks.ts

// Replace these with your actual affiliate IDs once you get approved
const BOOKSHOP_AFFILIATE_ID = "YOUR_BOOKSHOP_ID"; 
const THRIFTBOOKS_AFFILIATE_ID = "YOUR_THRIFTBOOKS_ID"; // Sometimes passed via a tool like ShareASale

// Add this to the bottom of your existing utils.ts file

export function generateBookSearchLink(title: string, store: "bookshop" | "thriftbooks" = "thriftbooks") {
  const encodedTitle = encodeURIComponent(title);

  if (store === "bookshop") {
    return `https://bookshop.org/search?keywords=${encodedTitle}&affiliate=YOUR_BOOKSHOP_ID`;
  }

  if (store === "thriftbooks") {
    return `https://www.thriftbooks.com/browse/?b.search=${encodedTitle}`;
  }

  return "#";
}
