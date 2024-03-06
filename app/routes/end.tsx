import {
  AspectRatio,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

import { updateUser } from "~/models/user.server";
import { requireUser } from "~/session.server";

import devicesImage from "../assets/devices@2x.png";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id } = await requireUser(request);
  const formData = await request.formData();
  const phone = formData.get("phone");

  if (typeof phone !== "string" || phone.length === 0) {
    return json(
      { errors: { phone: "Please enter a valid phone number" } },
      { status: 400 },
    );
  }

  await updateUser(id, "phone", phone);

  return "success";
};

// TODO: Make page responsive

export default function EndScene() {
  const fetcher = useFetcher();
  const data = fetcher.data;
  const success = data === "success";

  useEffect(() => {
    if (success) {
      window.open("raycast://extensions/raycast/raycast/confetti");
    }
  }, [success]);

  return (
    <Flex direction="row">
      <AspectRatio ratio={7 / 4}>
        <img
          src={devicesImage}
          alt="Phones displaying the Root app"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "100%",
          }}
        />
      </AspectRatio>
      <Flex direction="column" gap="5" mt="8">
        <Heading size="7">Download the Root app to continue</Heading>
        <Text color="gray">
          Thanks for completing your profile. Now it’s time to download the app,
          take the test drive, and determine your rate.
        </Text>

        <fetcher.Form method="post">
          <Flex gap="2">
            <Container grow="1">
              <TextField.Input
                name="phone"
                type="tel"
                placeholder="Phone number"
                size="3"
              />
            </Container>
            <Button
              type="submit"
              size="3"
              style={{ minWidth: 130 }}
              disabled={success ? true : false}
            >
              {success ? "Sent!" : "Text me a link"}
            </Button>
          </Flex>

          {data?.errors?.phone ? (
            <Text size="1" color="red">
              {data.errors.phone}
            </Text>
          ) : null}
        </fetcher.Form>
      </Flex>
    </Flex>
  );
}
