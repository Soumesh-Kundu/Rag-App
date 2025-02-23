"use client"
import React from "react";

interface DotwaveProps {
  size?: number;
  color?: string;
  speed?: number;
}
export default function Dotwave({ size = 40, color = "black",speed=2 }: DotwaveProps) {
  return (
    <l-dot-wave size={size} color={color} speed={speed}></l-dot-wave>
  );
}
