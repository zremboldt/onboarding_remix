import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return redirect(`/end`);
  } else {
    return json(
      { errors: { email: "No user with this email exists" } },
      { status: 400 },
    );
  }
};

export default function SignInScene() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="3">
          <Heading size="7">Welcome back.</Heading>
          <Text color="gray">
            What’s your email address? We’ll pick up where you left off.
          </Text>
        </Flex>

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

          <Button type="submit" size="3">
            Continue
          </Button>
        </Flex>
      </Flex>
    </Form>
  );
}
