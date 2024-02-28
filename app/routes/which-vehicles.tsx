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
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { FunctionComponent, useState } from "react";

import { getVehicleListItems, updateVehicle } from "~/models/vehicle.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { accountId } = await requireUser(request);
  const vehicles = await getVehicleListItems({ accountId });

  return json({ vehicles });
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

export default function WhichVehiclesScene() {
  const { vehicles } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="5">
      <Flex direction="column" gap="3">
        <Heading size="7">Which vehicles do you want to insure?</Heading>
        <Text color="gray">
          Need to add another vehicle? No worries, you can add more later.
        </Text>
      </Flex>

      <Flex direction="column" gap="3">
        {vehicles.length
          ? vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          : null}

        <Outlet />

        <Button
          size="2"
          variant="outline"
          onClick={() => navigate(`/which-vehicles/add-vehicle-dialog`)}
        >
          <PlusCircledIcon width="16" height="16" /> Add vehicle
        </Button>

        <Button onClick={() => navigate(`/which-drivers`)} size="3">
          Continue
        </Button>
      </Flex>

      <Callout.Root mt="8" color="gray">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          We pulled this information from public records. If there’s information
          that you don’t recognize, you can ignore it–it won’t affect your
          account.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}

const VehicleCard: FunctionComponent<{
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    includedOnPolicy: boolean;
  };
}> = ({ vehicle }) => {
  const fetcher = useFetcher();

  const includedOnPolicy = fetcher.formData
    ? fetcher.formData.get("includedOnPolicy") === "true"
    : vehicle.includedOnPolicy;

  const [isChecked, setIsChecked] = useState(includedOnPolicy);

  return (
    <Text key={vehicle.id} as="label">
      <Card size="2">
        <Flex gap="4" align="center" justify="between">
          <Box>
            <Text as="div" weight="bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text as="div" color="gray">
              {includedOnPolicy ? "Added" : "Not added"}
            </Text>
          </Box>
          <fetcher.Form method="post">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
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
        </Flex>
      </Card>
    </Text>
  );
};
