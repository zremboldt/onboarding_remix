import {
  Box,
  Button,
  Flex,
  Heading,
  RadioGroup,
  Separator,
  Text,
} from "@radix-ui/themes";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { updateUser } from "~/models/user.server";
import { requireUserId } from "~/session.server";

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
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex direction="column" gap="5">
        <Heading size="7">What’s your marital status?</Heading>

        <RadioGroup.Root name="marital-status" size="3">
          <Separator size="4" />
          <Text as="label" size="4">
            <Box px="4" py="4">
              <Flex justify="between">
                Single <RadioGroup.Item value="single" />
              </Flex>
            </Box>
          </Text>
          <Separator size="4" />
          <Text as="label" size="4">
            <Box px="4" py="4">
              <Flex justify="between">
                Married <RadioGroup.Item value="married" />
              </Flex>
            </Box>
          </Text>
          <Separator size="4" />
          <Text as="label" size="4">
            <Box px="4" py="4">
              <Flex justify="between">
                Widowed <RadioGroup.Item value="widowed" />
              </Flex>
            </Box>
          </Text>
          <Separator size="4" />
        </RadioGroup.Root>

        {actionData?.errors?.maritalStatus ? (
          <Text size="1" color="red" trim="start">
            {actionData.errors.maritalStatus}
          </Text>
        ) : null}

        <Button type="submit" size="3">
          Continue
        </Button>
      </Flex>
    </Form>
  );
}
