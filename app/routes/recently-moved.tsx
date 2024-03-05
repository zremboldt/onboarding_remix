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
  const recentlyMoved = formData.get("recentlyMoved");

  if (!recentlyMoved) {
    return json(
      { errors: { recentlyMoved: "Selection is required" } },
      { status: 400 },
    );
  }

  const hasRecentlyMoved = recentlyMoved === "true" ? true : false;

  await updateUser(userId, "recentlyMoved", hasRecentlyMoved);

  return redirect(`/marital-status`);
};

export default function RecentlyMovedScene() {
  const { recentlyMoved } = useRootLoaderData() || {};
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Flex gap="5" direction="column">
        <Heading size="7">Have you moved in the last 6 months?</Heading>

        <RadioGroup.Root
          name="recentlyMoved"
          defaultValue={recentlyMoved?.toString()}
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

        {actionData?.errors?.recentlyMoved ? (
          <Text size="1" color="red" trim="start">
            {actionData.errors.recentlyMoved}
          </Text>
        ) : null}

        <Button type="submit" size="3">
          Continue
        </Button>
      </Flex>
    </Form>
  );
}
