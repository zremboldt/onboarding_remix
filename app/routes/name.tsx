import {
  Flex,
  Text,
  Button,
  TextField,
  Heading,
  Separator,
} from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

import { createAccount } from "~/models/account.server";
import { createUser, updateUser } from "~/models/user.server";
import { createUserSession, getSession, getUser } from "~/session.server";
import { safeRedirect, useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json(user);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request);
  const formData = await request.formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/dob");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (typeof firstName !== "string" || firstName.length === 0) {
    return json(
      { errors: { firstName: "First name is required", lastName: null } },
      { status: 400 },
    );
  }

  if (typeof lastName !== "string" || lastName.length === 0) {
    return json(
      { errors: { firstName: null, lastName: "Last name is required" } },
      { status: 400 },
    );
  }

  // if user already has an active session, update their name instead of creating a new user
  if (session.has("userId")) {
    const id = session.get("userId");
    console.log(id);
    await updateUser(id, "firstName", firstName);
    await updateUser(id, "lastName", lastName);
    return redirect("/dob");
  }

  const account = await createAccount();
  const user = await createUser({
    firstName,
    lastName,
    accountId: account.id,
    pni: true,
  });

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export default function NameScene() {
  const { firstName, lastName } = useRootLoaderData() || {};
  const actionData = useActionData<typeof action>();

  return (
    <div className="scene-container">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Heading size="8">Get a quote in less than 5 minutes</Heading>
          <Separator
            orientation="horizontal"
            size="3"
            my="3"
            style={{
              height: 3,
              backgroundColor: "var(--color-focus-root)",
            }}
          />
          <Heading size="7">Let’s start with your name</Heading>
          <Text color="gray">
            Please make sure it matches the information on your license.
          </Text>
        </Flex>

        <Form method="post">
          <Flex direction="column" gap="3">
            <TextField.Input
              size="3"
              name="firstName"
              defaultValue={firstName}
              placeholder="First name"
              aria-invalid={actionData?.errors?.firstName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.firstName ? "firstName-error" : undefined
              }
            />

            {actionData?.errors?.firstName ? (
              <Text size="1" color="red" trim="start">
                {actionData.errors.firstName}
              </Text>
            ) : null}

            <TextField.Input
              size="3"
              name="lastName"
              defaultValue={lastName}
              placeholder="Last name"
              aria-invalid={actionData?.errors?.lastName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.lastName ? "lastName-error" : undefined
              }
            />

            {actionData?.errors?.lastName ? (
              <Text size="1" color="red" trim="start">
                {actionData.errors.lastName}
              </Text>
            ) : null}

            <Button type="submit" size="3">
              Continue
            </Button>
          </Flex>
        </Form>
        <Text align={"center"} color="gray">
          Been here before?{" "}
          <Link
            to="/sign-in"
            className="rt-Text rt-reset rt-Link rt-underline-auto"
          >
            Finish signing up
          </Link>
        </Text>
      </Flex>
    </div>
  );
}
