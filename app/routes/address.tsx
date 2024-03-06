import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { updateUser } from "~/models/user.server";
import { getUser, requireUser } from "~/session.server";
import { prefillRequest, useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json(user);
};

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
  const { address } = useRootLoaderData() || {};
  const actionData = useActionData<typeof action>();

  return (
    <div className="scene-container">
      <Flex direction="column" gap="5">
        <Heading size="7">What’s your home address?</Heading>

        <Form method="post">
          <Flex direction="column" gap="3">
            <TextField.Input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              size="3"
              defaultValue={address}
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
        </Form>
      </Flex>
    </div>
  );
}
