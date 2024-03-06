import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import {
  createUserPassword,
  getUserByEmail,
  updateUser,
} from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { validateEmail } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user with this email already exists",
          password: null,
        },
      },
      { status: 400 },
    );
  }

  const userId = await requireUserId(request);

  await updateUser(userId, "email", email);
  await createUserPassword(userId, password);

  return redirect(`/end`);
};

export default function CreateLoginScene() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="scene-container">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Heading size="7">Create an account to save your progress.</Heading>
          <Text color="gray">We’ll use your account to save your quote.</Text>
        </Flex>

        <Form method="post">
          <Flex direction="column" gap="3">
            <TextField.Input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              size="3"
            />

            {actionData?.errors?.email ? (
              <Text size="1" color="red" trim="start">
                {actionData.errors.email}
              </Text>
            ) : null}

            <TextField.Input
              name="password"
              type="password"
              placeholder="Create a strong password (at least 8 characters)"
              // autoComplete="new-password"
              size="3"
            />

            {actionData?.errors?.password ? (
              <Text size="1" color="red" trim="start">
                {actionData.errors.password}
              </Text>
            ) : null}

            <Button type="submit" size="3">
              Create account
            </Button>
          </Flex>
        </Form>
      </Flex>
    </div>
  );
}
