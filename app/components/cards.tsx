import { Avatar, Box, Card, Flex, Text } from "@radix-ui/themes";
import { FunctionComponent } from "react";

export const TipCard: FunctionComponent<{ eyebrow: string; body: string }> = ({
  eyebrow,
  body,
}) => (
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
          {eyebrow}
        </Text>
        <Text as="div" size="3" weight="bold">
          {body}
        </Text>
      </Flex>
    </Flex>
  </Card>
);

export const VehicleCard: FunctionComponent<{
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

export const UserCard: FunctionComponent<{
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
