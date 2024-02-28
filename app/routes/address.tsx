import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { updateUser } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { prefillRequest } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id, accountId } = await requireUser(request);
  const formData = await request.formData();
  const address = formData.get("address");

  if (typeof address !== "string" || address.length === 0) {
    return json(
      { errors: { address: "Address is required" } },
      { status: 400 },
    );
  }

  await updateUser(id, "address", address);
  await prefillRequest({ accountId });

  return redirect(`/homeowner`);
};

export default function AddressScene() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex direction="column" gap="5">
        <Heading size="7">What’s your home address?</Heading>

        <Flex direction="column" gap="3">
          <TextField.Input
            size="3"
            name="address"
            placeholder="Address, city, state, ZIP"
            aria-invalid={actionData?.errors?.address ? true : undefined}
            aria-errormessage={
              actionData?.errors?.address ? "address-error" : undefined
            }
          />

          {actionData?.errors?.address ? (
            <Text size="1" color="red" trim="start">
              {actionData.errors.address}
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
