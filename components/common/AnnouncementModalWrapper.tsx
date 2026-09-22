"use client";

import dynamic from "next/dynamic";

const AnnouncementModal = dynamic(() => import("./AnnouncementModal"), {
  ssr: false,
  loading: () => null,
});

export default function AnnouncementModalWrapper() {
  return <AnnouncementModal />;
}
