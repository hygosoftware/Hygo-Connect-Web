"use client"

import { Suspense } from "react"
import FileScreenContent from "./FileScreenContent"

export default function FileScreen() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <FileScreenContent />
    </Suspense>
  )
}