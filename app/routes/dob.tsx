import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useRef } from "react";

import { updateUser } from "~/models/user.server";
import { requireUser, requireUserId } from "~/session.server";
import { useRootLoaderData } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { dob } = await requireUser(request);
  if (!dob) {
    return null;
  }

  const date = new Date(dob);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());
  return json({ month, day, year });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const month = formData.get("month");
  const day = formData.get("day");
  const year = formData.get("year");

  if (month && day && year) {
    const dob = new Date(`${year}-${month}-${day}`);

    if (isNaN(dob.getTime())) {
      return json({ errors: { dob: "This date is invalid" } }, { status: 400 });
    }

    // ensure user is at least 18
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    if (dob.getTime() > eighteenYearsAgo.getTime()) {
      return json(
        { errors: { dob: "You must be at least 18 years old" } },
        { status: 400 },
      );
    }

    await updateUser(userId, "dob", dob);
    return redirect(`/address`);
  }
  return json(
    { errors: { dob: "Date of birth is required" }, routeTo: null },
    { status: 400 },
  );
};

export default function DobScene() {
  const { month, day, year } = useRootLoaderData() || {};
  const actionData = useActionData<typeof action>();
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const atMaxLength = input.value.length === input.maxLength;

    // don't allow non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, "");

    if (input === yearRef.current) {
      return;
    }

    if (input === monthRef.current) {
      const atMaxInt = parseInt(input.value) > 1;

      if (atMaxLength || atMaxInt) {
        dayRef.current?.focus();
      }
    }

    if (input === dayRef.current) {
      const atMaxInt = parseInt(input.value) > 3;

      if (atMaxLength || atMaxInt) {
        yearRef.current?.focus();
      }
    }
  };

  return (
    <div className="scene-container">
      <Flex direction="column" gap="5">
        <Heading size="7">When’s your birthday?</Heading>

        <Form method="post">
          <Flex direction="column" gap="3">
            <Flex direction="row" gap="3">
              <TextField.Input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                name="month"
                placeholder="MM"
                ref={monthRef}
                maxLength={2}
                size="3"
                defaultValue={month}
                onChange={handleInputChange}
                autoComplete="off"
              />
              <TextField.Input
                name="day"
                placeholder="DD"
                ref={dayRef}
                maxLength={2}
                size="3"
                defaultValue={day}
                onChange={handleInputChange}
                autoComplete="off"
              />
              <TextField.Input
                name="year"
                placeholder="YYYY"
                ref={yearRef}
                maxLength={4}
                size="3"
                defaultValue={year}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Flex>

            {actionData?.errors?.dob ? (
              <Text size="1" color="red" trim="start">
                {actionData.errors.dob}
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
