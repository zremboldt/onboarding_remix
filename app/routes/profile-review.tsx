import { PlusCircledIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { FunctionComponent } from "react";

import { getUsersOnAccount } from "~/models/user.server";
import { getVehicleListItems, updateVehicle } from "~/models/vehicle.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { accountId } = await requireUser(request);
  const vehicles = await getVehicleListItems({ accountId });
  const users = await getUsersOnAccount({ accountId });

  if (!users.length) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ users, vehicles });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const vehicleId = formData.get("vehicleId");
  const includedOnPolicy = formData.get("includedOnPolicy") === "true";

  if (typeof vehicleId !== "string") {
    return json(
      { errors: { vehicleId: "Vehicle ID is required" } },
      { status: 400 },
    );
  }

  return updateVehicle(vehicleId, "includedOnPolicy", includedOnPolicy);
};

export default function ProfileReviewScene() {
  const { users, vehicles } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="5">
      <Heading size="7">How does your profile look?</Heading>

      <Flex direction="column" gap="9">
        <Card size="2">
          <Flex gap="4" align="center">
            <Avatar size="5" radius="full" fallback="T" />
            <Flex direction="column" gap="2">
              <Text
                as="div"
                size="1"
                weight="bold"
                style={{ color: "var(--accent-9)" }}
              >
                GOOD TO KNOW
              </Text>
              <Text as="div" size="3" weight="bold">
                Our app gives drivers like you discounts based on how you drive.
              </Text>
            </Flex>
          </Flex>
        </Card>

        <Flex direction="column" gap="3">
          <Heading size="3">Covered drivers</Heading>
          {users
            .filter(({ includedOnPolicy }) => includedOnPolicy === true)
            .map((user) => (
              <UserCard key={user.id} user={user} />
            ))}

          <Button
            size="2"
            variant="outline"
            onClick={() => navigate(`/which-vehicles/add-vehicle-dialog`)}
          >
            <PlusCircledIcon width="16" height="16" /> Add covered driver
          </Button>
        </Flex>

        <Flex direction="column" gap="3">
          <Heading size="3">Vehicles</Heading>
          {vehicles.length
            ? vehicles
                .filter(({ includedOnPolicy }) => includedOnPolicy === true)
                .map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))
            : null}

          <Button
            size="2"
            variant="outline"
            onClick={() => navigate(`/which-vehicles/add-vehicle-dialog`)}
          >
            <PlusCircledIcon width="16" height="16" /> Add vehicle
          </Button>
        </Flex>

        <Outlet />

        <Button onClick={() => navigate(`/create-login`)} size="3">
          Continue
        </Button>
      </Flex>
    </Flex>
  );
}

const UserCard: FunctionComponent<{
  user: {
    id: string;
    firstName: string;
    lastName: string;
    pni: boolean;
    includedOnPolicy: boolean;
  };
}> = ({ user }) => {
  return (
    <Text key={user.id} as="label">
      <Card size="2">
        <Flex gap="4" align="center" justify="between">
          <Box>
            <Text as="div" weight="bold">
              {user.firstName} {user.lastName}
            </Text>
            <Text as="div" color="gray">
              {user.includedOnPolicy ? "Covered" : "Not covered"}
            </Text>
          </Box>
        </Flex>
      </Card>
    </Text>
  );
};

const VehicleCard: FunctionComponent<{
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    includedOnPolicy: boolean;
  };
}> = ({ vehicle }) => {
  return (
    <Text key={vehicle.id} as="label">
      <Card size="2">
        <Flex gap="4" align="center" justify="between">
          <Box>
            <Text as="div" weight="bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text as="div" color="gray">
              {vehicle.includedOnPolicy ? "Added" : "Not added"}
            </Text>
          </Box>
        </Flex>
      </Card>
    </Text>
  );
};
