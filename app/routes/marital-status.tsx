import {
  Box,
  Button,
  Flex,
  Heading,
  RadioGroup,
  Separator,
  Text,
} from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { updateUser } from "~/models/user.server";
import { getUser, requireUserId } from "~/session.server";
import { useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json(user);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const maritalStatus = formData.get("marital-status");

  if (typeof maritalStatus !== "string") {
    return json(
      { errors: { maritalStatus: "Selection is required" } },
      { status: 400 },
    );
  }

  await updateUser(userId, "maritalStatus", maritalStatus);

  return redirect(`/which-vehicles`);
};

export default function MaritalStatusScene() {
  const { maritalStatus } = useRootLoaderData();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex direction="column" gap="5">
        <Heading size="7">What’s your marital status?</Heading>

        <RadioGroup.Root
          defaultValue={maritalStatus}
          name="marital-status"
          size="3"
        >
          <Separator size="4" />
          {["Single", "Married", "Widowed"].map((status) => (
            <Box key={status}>
              <Text as="label" size="4" key={status}>
                <Box px="4" py="4">
                  <Flex justify="between">
                    {status} <RadioGroup.Item value={status.toLowerCase()} />
                  </Flex>
                </Box>
              </Text>
              <Separator size="4" />
            </Box>
          ))}
        </RadioGroup.Root>

        {actionData?.errors?.data.maritalStatus ? (
          <Text size="1" color="red" trim="start">
            {actionData.errors.data.maritalStatus}
          </Text>
        ) : null}

        <Button type="submit" size="3">
          Continue
        </Button>
      </Flex>
    </Form>
  );
}
