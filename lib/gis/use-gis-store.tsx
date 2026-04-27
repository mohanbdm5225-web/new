"use client";

import { useSyncExternalStore } from "react";
import type { GeoJsonObject } from "geojson";
import { GisLayer, GisTool } from "./types";

type GisState = {
  layers: GisLayer[];
  activeTool: GisTool;
  selectedLayerId: string | null;
};

let state: GisState = {
  layers: [],
  activeTool: "select",
  selectedLayerId: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useGIS() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function addLayer(layer: {
    id: string;
    name: string;
    data: GeoJsonObject;
    color?: string;
  }) {
    state = {
      ...state,
      layers: [
        ...state.layers,
        {
          id: layer.id,
          name: layer.name,
          data: layer.data,
          visible: true,
          color: layer.color ?? "#2563eb",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    emit();
  }

  function removeLayer(id: string) {
    state = {
      ...state,
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId:
        state.selectedLayerId === id ? null : state.selectedLayerId,
    };
    emit();
  }

  function toggleLayer(id: string) {
    state = {
      ...state,
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
    };
    emit();
  }

  function updateLayerColor(id: string, color: string) {
    state = {
      ...state,
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, color } : layer
      ),
    };
    emit();
  }

  function setActiveTool(tool: GisTool) {
    state = { ...state, activeTool: tool };
    emit();
  }

  function setSelectedLayerId(id: string | null) {
    state = { ...state, selectedLayerId: id };
    emit();
  }

  function clearAllLayers() {
    state = {
      ...state,
      layers: [],
      selectedLayerId: null,
      activeTool: "select",
    };
    emit();
  }

  return {
    ...current,
    addLayer,
    removeLayer,
    toggleLayer,
    updateLayerColor,
    setActiveTool,
    setSelectedLayerId,
    clearAllLayers,
  };
}