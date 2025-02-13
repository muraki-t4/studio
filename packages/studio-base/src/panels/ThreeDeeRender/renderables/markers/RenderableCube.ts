// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import * as THREE from "three";

import type { Renderer } from "../../Renderer";
import { rgbaEqual } from "../../color";
import { Marker } from "../../ros";
import { RenderableMarker } from "./RenderableMarker";
import { releaseStandardMaterial, standardMaterial } from "./materials";

export class RenderableCube extends RenderableMarker {
  private static geometry: THREE.BoxGeometry | undefined;
  private static edgesGeometry: THREE.EdgesGeometry | undefined;

  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material>;
  outline: THREE.LineSegments | undefined;

  constructor(topic: string, marker: Marker, receiveTime: bigint | undefined, renderer: Renderer) {
    super(topic, marker, receiveTime, renderer);

    // Cube mesh
    this.mesh = new THREE.Mesh(
      RenderableCube.Geometry(),
      standardMaterial(marker.color, renderer.materialCache),
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.add(this.mesh);

    // Cube outline
    this.outline = new THREE.LineSegments(
      RenderableCube.EdgesGeometry(),
      renderer.materialCache.outlineMaterial,
    );
    this.outline.userData.picking = false;
    this.mesh.add(this.outline);

    this.update(marker, receiveTime);
  }

  override dispose(): void {
    releaseStandardMaterial(this.userData.marker.color, this.renderer.materialCache);
  }

  override update(marker: Marker, receiveTime: bigint | undefined): void {
    const prevMarker = this.userData.marker;
    super.update(marker, receiveTime);

    if (!rgbaEqual(marker.color, prevMarker.color)) {
      releaseStandardMaterial(prevMarker.color, this.renderer.materialCache);
      this.mesh.material = standardMaterial(marker.color, this.renderer.materialCache);
    }

    this.scale.set(marker.scale.x, marker.scale.y, marker.scale.z);
  }

  static Geometry(): THREE.BoxGeometry {
    if (!RenderableCube.geometry) {
      RenderableCube.geometry = new THREE.BoxGeometry(1, 1, 1);
      RenderableCube.geometry.computeBoundingSphere();
    }
    return RenderableCube.geometry;
  }

  static EdgesGeometry(): THREE.EdgesGeometry {
    if (!RenderableCube.edgesGeometry) {
      RenderableCube.edgesGeometry = new THREE.EdgesGeometry(RenderableCube.Geometry(), 40);
      RenderableCube.edgesGeometry.computeBoundingSphere();
    }
    return RenderableCube.edgesGeometry;
  }
}
