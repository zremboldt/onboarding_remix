import { Flex, Heading } from "@radix-ui/themes";
import { useEffect } from "react";

export default function EndScene() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.open("raycast://extensions/raycast/raycast/confetti");
    }
  }, []);

  return (
    <Flex direction="column" gap="5" align="center">
      <Heading size="7">Download the Root app to continue</Heading>
    </Flex>
  );
}
