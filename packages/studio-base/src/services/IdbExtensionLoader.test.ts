// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import fs from "fs";
import { openDB } from "idb/with-async-ittr";

import { IdbExtensionLoader } from "./IdbExtensionLoader";

jest.mock("idb/with-async-ittr", () => ({
  openDB: jest.fn(),
}));

const pkgInfo = {
  description: "",
  devDependencies: {
    "@foxglove/fox": "file:../fox",
    "@foxglove/studio": "0.11.0",
    typescript: "4.3.2",
  },
  displayName: "turtlesim",
  id: "foxglove.studio-extension-turtlesim",
  license: "MPL-2.0",
  main: "./dist/extension.js",
  name: "studio-extension-turtlesim",
  publisher: "foxglove",
  scripts: {
    build: "fox build",
    "foxglove:prepublish": "fox build --mode production",
    "local-install": "fox build && fox install",
    package: "fox build --mode production && fox package",
    pretest: "fox pretest",
  },
  version: "0.0.1",
};

describe("IdbExtensionLoader", () => {
  const mockDBPut = jest.fn();

  const mockDBGetAll = jest.fn();

  const mockTransaction = jest.fn().mockReturnValue({ db: { put: mockDBPut } });

  (openDB as jest.Mock).mockReturnValue({
    transaction: mockTransaction,
    getAll: mockDBGetAll,
  });

  describe("loading extensions", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Installs local extensions", async () => {
      const foxe = fs.readFileSync(
        `${__dirname}/../test/fixtures/foxglove.studio-extension-turtlesim-0.0.1.foxe`,
      );

      const expectedInfo = {
        ...pkgInfo,
        namespace: "local",
        qualifiedName: "turtlesim",
      };

      mockDBGetAll.mockReturnValue([expectedInfo]);

      const loader = new IdbExtensionLoader("local");
      await loader.installExtension(foxe);

      expect(mockDBPut).toHaveBeenCalledWith("metadata", expectedInfo);

      expect(mockDBPut).toHaveBeenCalledWith("extensions", { content: foxe, info: expectedInfo });

      expect((await loader.getExtensions())[0]).toBe(expectedInfo);
    });

    it("Installs private extensions", async () => {
      const foxe = fs.readFileSync(
        `${__dirname}/../test/fixtures/foxglove.studio-extension-turtlesim-0.0.1.foxe`,
      );

      const expectedInfo = {
        ...pkgInfo,
        namespace: "private",
        qualifiedName: "private:studio-extension-turtlesim",
      };

      mockDBGetAll.mockReturnValue([expectedInfo]);

      const loader = new IdbExtensionLoader("private");
      await loader.installExtension(foxe);

      expect(mockDBPut).toHaveBeenCalledWith("metadata", expectedInfo);

      expect(mockDBPut).toHaveBeenCalledWith("extensions", {
        content: foxe,
        info: expectedInfo,
      });

      expect((await loader.getExtensions())[0]).toBe(expectedInfo);
    });
  });
});
