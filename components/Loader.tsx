import React from 'react'
import Ring from './Loaders/Ring'

export default function Loader({stroke=1.6,color='black',size=20}) {
  return (
    <Ring stroke={stroke} color={color} size={size}>
    </Ring>
  )
}
