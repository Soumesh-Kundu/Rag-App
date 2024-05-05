import React from 'react'

export default function Loader({stroke=1.6,color='black',size=20}) {
  return (
    <l-ring stroke={stroke} color={color} size={size}>
    </l-ring>
  )
}
