import * as React from "react";
import renderer, { act } from "react-test-renderer";

import { ThemedText } from "@/components/themed-text";

it("renders its children", async () => {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(JSON.stringify(tree.toJSON())).toContain("Snapshot test!");
});
