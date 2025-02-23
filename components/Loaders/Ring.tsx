"use client";
import React from "react";
interface DotwaveProps {
  size?: number;
  color?: string;
  stroke?: number;
  speed?: number;
}

export default function Ring({
  size = 40,
  color = "black",
  stroke = 2,
  speed = 2,
}: DotwaveProps) {
  return (
    <l-ring size={size} color={color} stroke={stroke} speed={speed}></l-ring>
  );
}
