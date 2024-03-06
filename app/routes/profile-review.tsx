import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button, Flex, Heading } from "@radix-ui/themes";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useNavigate } from "@remix-run/react";

import { TipCard, UserCard, VehicleCard } from "~/components/cards";
import { getUsersOnAccount } from "~/models/user.server";
import { getVehicleListItems, updateVehicle } from "~/models/vehicle.server";
import { requireUser } from "~/session.server";
import { useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const pni = await requireUser(request);
  const vehicles = await getVehicleListItems({ accountId: pni.accountId });
  const users = await getUsersOnAccount({ accountId: pni.accountId });

  if (!users.length) {
    throw new Response("Not Found", { status: 404 });
  }

  const nextRoute = !pni.email ? "/create-login" : "/end";

  return json({ users, vehicles, nextRoute });
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
  const { users, vehicles, nextRoute } = useRootLoaderData();
  const navigate = useNavigate();

  return (
    <div className="scene-container">
      <Flex direction="column" gap="5">
        <Heading size="7">How does your profile look?</Heading>

        <Flex direction="column" gap="9">
          <TipCard
            eyebrow="GOOD TO KNOW"
            body="Our app gives drivers like you discounts based on how you drive."
          />

          <Flex direction="column" gap="3">
            <Heading size="3">Covered drivers</Heading>
            {users
              .filter(({ includedOnPolicy }) => includedOnPolicy === true)
              .map((user) => (
                <UserCard key={user.id} user={user} />
              ))}

            <Button size="2" variant="outline">
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

            <Button size="2" variant="outline">
              <PlusCircledIcon width="16" height="16" /> Add vehicle
            </Button>
          </Flex>

          <Outlet />

          <Button onClick={() => navigate(nextRoute)} size="3">
            Continue
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
