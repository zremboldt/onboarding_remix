import {
  Button,
  Dialog,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { requireUser } from "~/session.server";
import { createRandomVehicle } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { accountId } = await requireUser(request);
  const formData = await request.formData();
  const vin = formData.get("vin");

  if (typeof vin !== "string" || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    return json(
      { errors: { vin: "Please enter a valid VIN" } },
      { status: 400 },
    );
  }

  await createRandomVehicle({ accountId, vin });

  return redirect(`/which-vehicles`);
};

export default function AddVehicleDialog() {
  const actionData = useActionData<typeof action>();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate(-1), 200); // allow time for the dialog to animate before navigating
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title mb="4">What’s the VIN?</Dialog.Title>

        <Form method="post">
          <Flex direction="column" gap="6">
            <Flex gap="2" direction="column">
              <TextField.Input
                size="3"
                name="vin"
                placeholder="VIN"
                onChange={(e) =>
                  (e.target.value = e.target.value.toUpperCase())
                }
              />

              {actionData?.errors?.vin ? (
                <Text size="1" color="red" trim="start">
                  {actionData.errors.vin}
                </Text>
              ) : null}
            </Flex>

            <Flex gap="3" direction="column">
              <Dialog.Description color="gray">
                Don’t have the Vehicle Identification Number (VIN) handy? Here’s
                where to find it.
              </Dialog.Description>
              <Separator size="2" />
              <Flex gap="0" direction="column">
                <Text size="3" weight="bold">
                  Driver side dashboard
                </Text>
                <Text size="2" color="gray">
                  Just look through the windshield.
                </Text>
              </Flex>
              <Separator size="2" />
              <Flex gap="0" direction="column">
                <Text size="3" weight="bold">
                  Driver side door jamb
                </Text>
                <Text size="2" color="gray">
                  Look for a sticker with lots of numbers and letters.
                </Text>
              </Flex>
              <Separator size="2" />
            </Flex>

            <Flex direction="column" gap="3">
              <Button size="3" type="submit">
                Add vehicle
              </Button>
              <Dialog.Close>
                <Button size="2" variant="outline" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
