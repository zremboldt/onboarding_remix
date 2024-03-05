import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
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
  const hadRecentAccident = formData.get("hadRecentAccident");

  if (!hadRecentAccident) {
    return json(
      { errors: { hadRecentAccident: "Selection is required" } },
      { status: 400 },
    );
  }

  const accidentBoolean = hadRecentAccident === "true" ? true : false;

  await updateUser(userId, "hadRecentAccident", accidentBoolean);

  return redirect(`/profile-review`);
};

export default function RecentAccidentScene() {
  const { hadRecentAccident } = useRootLoaderData() || {};
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex direction="column" gap="5">
        <Heading size="7">
          In the past 3 years, have you or any other drivers on your policy been
          in an accident or gotten a ticket?
        </Heading>

        <RadioGroup.Root
          name="hadRecentAccident"
          defaultValue={hadRecentAccident?.toString()}
          size="3"
        >
          <Separator size="4" />
          <Text as="label" size="4">
            <Box px="4" py="4">
              <Flex justify="between">
                Yes <RadioGroup.Item value="true" />
              </Flex>
            </Box>
          </Text>
          <Separator size="4" />
          <Text as="label" size="4">
            <Box px="4" py="4">
              <Flex justify="between">
                No <RadioGroup.Item value="false" />
              </Flex>
            </Box>
          </Text>
          <Separator size="4" />
        </RadioGroup.Root>

        {actionData?.errors?.hadRecentAccident ? (
          <Text size="1" color="red" trim="start">
            {actionData.errors.hadRecentAccident}
          </Text>
        ) : null}

        <Button type="submit" size="3">
          Continue
        </Button>
      </Flex>
      <Callout.Root mt="8" color="gray">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          We’ll use this information to estimate your quote. Before you buy a
          policy with Root, we’ll verify your driving record.
        </Callout.Text>
      </Callout.Root>
    </Form>
  );
}
