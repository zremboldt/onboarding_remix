import { useLoaderData, useMatches } from "@remix-run/react";
import { useMemo, useState } from "react";

import { createUser, type User } from "~/models/user.server";

import { accountHasVehicles } from "./models/account.server";
import { Vehicle, createVehicle } from "./models/vehicle.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

// Methods for demo purposes below 👇

// This simulates us making our prefill request.
export const prefillRequest = async ({
  accountId,
}: Pick<Vehicle, "accountId">) => {
  const hasVehicles = await accountHasVehicles(accountId);
  if (hasVehicles) {
    return;
  }

  await createVehicle({
    year: 2021,
    make: "Honda",
    model: "Accord",
    vin: "1HGBH41JXMN109186",
    includedOnPolicy: true,
    accountId,
  });
  await createVehicle({
    year: 2020,
    make: "Dodge",
    model: "Grand Caravan",
    vin: "1HGBH41JXMN109187",
    includedOnPolicy: true,
    accountId,
  });
  await createUser({
    firstName: "Mark",
    lastName: "Watney",
    accountId,
    pni: false,
  });
  await createUser({
    firstName: "Beth",
    lastName: "Johanssen",
    accountId,
    pni: false,
  });
};

export const createRandomVehicle = async ({
  accountId,
  vin,
}: Pick<Vehicle, "vin" | "accountId">) => {
  const randomNumber = Math.random();

  if (randomNumber < 0.2) {
    return createVehicle({
      year: 2024,
      make: "Honda",
      model: "Odyssey",
      vin,
      accountId,
      includedOnPolicy: true,
    });
  } else if (randomNumber < 0.4) {
    return createVehicle({
      year: 2023,
      make: "Dodge",
      model: "Challenger",
      vin,
      accountId,
      includedOnPolicy: true,
    });
  } else if (randomNumber < 0.6) {
    return createVehicle({
      year: 2021,
      make: "Honda",
      model: "Civic",
      vin,
      accountId,
      includedOnPolicy: true,
    });
  } else if (randomNumber < 0.8) {
    return createVehicle({
      year: 2020,
      make: "Toyota",
      model: "Camry",
      vin,
      accountId,
      includedOnPolicy: true,
    });
  } else {
    return createVehicle({
      year: 2022,
      make: "Toyota",
      model: "Highlander",
      vin,
      accountId,
      includedOnPolicy: true,
    });
  }
};

export const useRootLoaderData = () => {
  // TODO: I'd like to find a better way but for now this keeps data driven UI elements from dissappearing during the route animation
  const data = useLoaderData();
  const [dataState] = useState(data);
  return data || dataState;
};
