// src/app.d.ts — SvelteKit global type declarations
import type { SessionUser } from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      user: SessionUser | null;
    }
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
}

export {};
