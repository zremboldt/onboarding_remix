import { InfoCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Switch,
  Text,
} from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useNavigate } from "@remix-run/react";
import { FunctionComponent, useState } from "react";

import { TipCard } from "~/components/cards";
import { getUsersOnAccount, updateUser } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { accountId } = await requireUser(request);
  const users = await getUsersOnAccount({ accountId });
  if (!users.length) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ users });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const userId = formData.get("userId");
  const includedOnPolicy = formData.get("includedOnPolicy") === "true";

  if (typeof userId !== "string") {
    return json({ errors: { userId: "userId is required" } }, { status: 400 });
  }

  return updateUser(userId, "includedOnPolicy", includedOnPolicy);
};

export default function WhichDriversScene() {
  const { users } = useRootLoaderData();
  const navigate = useNavigate();

  return (
    <div className="scene-container">
      <Flex direction="column" gap="7">
        <Flex direction="column" gap="3">
          <Heading size="7">
            Which drivers will be covered on your policy?
          </Heading>

          <TipCard
            eyebrow="ROOT SAVINGS TIP"
            body="To maximize your savings, everyone on your policy must take the test drive."
          />

          <Text color="gray">
            All household members with a valid driver’s license, and other
            regular operators of the insured vehicle(s), must be listed on your
            policy.
          </Text>
          <Text color="gray">
            Household members with a valid driver’s license will only be covered
            if they are listed.
          </Text>
        </Flex>

        <Flex direction="column" gap="3">
          {users.map((user) => (
            <UserToggleCard key={user.id} user={user} />
          ))}

          <Button size="2" variant="outline">
            <PlusCircledIcon width="16" height="16" /> Add driver
          </Button>

          <Button onClick={() => navigate(`/recent-accident`)} size="3">
            Continue
          </Button>
        </Flex>

        <Callout.Root mt="8" color="gray">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            We pulled this information from public records. If there’s
            information that you don’t recognize, you can ignore it–it won’t
            affect your account.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </div>
  );
}

const UserToggleCard: FunctionComponent<{
  user: {
    id: string;
    firstName: string;
    lastName: string;
    pni: boolean;
    includedOnPolicy: boolean;
  };
}> = ({ user }) => {
  const fetcher = useFetcher();

  const includedOnPolicy = fetcher.formData
    ? fetcher.formData.get("includedOnPolicy") === "true"
    : user.includedOnPolicy;

  const [isChecked, setIsChecked] = useState(includedOnPolicy);

  return (
    <Text key={user.id} as="label">
      <Card size="2">
        <Flex gap="4" align="center" justify="between">
          <Box>
            <Text as="div" weight="bold">
              {user.firstName} {user.lastName}
            </Text>
            <Text as="div" color="gray">
              {includedOnPolicy ? "Covered" : "Not covered"}
            </Text>
          </Box>
          {user.pni ? null : (
            <fetcher.Form method="post">
              <input type="hidden" name="userId" value={user.id} />
              <Switch
                type="submit"
                name="includedOnPolicy"
                value={includedOnPolicy ? "false" : "true"}
                checked={isChecked}
                onCheckedChange={() => setIsChecked(!isChecked)}
                radius="full"
                size="3"
              />
            </fetcher.Form>
          )}
        </Flex>
      </Card>
    </Text>
  );
};
