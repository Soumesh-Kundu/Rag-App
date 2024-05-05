import React from 'react'

export default function Loading() {
  return (
    <div className="space-y-4 max-w-6xl w-full scrollbar px-2 lg:px-0 grid place-items-center">
        <div className="w-1/3 rounded-xl bg-white p-4 shadow-xl pb-0">
          <div className="flex p-10 scrollbar  flex-col items-center w-full  gap-10 overflow-y-auto  text-gray-500 justify-center">
                <l-ring stroke={2} size={40} color=' rgb(107, 114, 128)'></l-ring>
                <span className='font-medium '>
                  Just a min...
                </span>
            </div>
        </div>
    </div>
  )
}
