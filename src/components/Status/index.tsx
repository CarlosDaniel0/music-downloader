import { ArrowLeftRight, CircleCheck, TriangleAlert } from "lucide-react";
import { useMemo } from "react";

export default function Status(props: { type: "connected" | "disconnected" | "connecting" }) {
  const { type } = props
  return useMemo(() => {
      switch (type) {
        case "connected":
          return (
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700">
              <CircleCheck className="-ms-1 me-1.5 size-4" />
              <p className="text-sm whitespace-nowrap">Conetado</p>
            </span>
          );
        case "connecting":
          return (
            <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">
              <ArrowLeftRight className="-ms-1 me-1.5 size-4" />
              <p className="text-sm whitespace-nowrap">Conetando...</p>
            </span>
          );
        case "disconnected":
          return (
            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-700">
              <TriangleAlert className="-ms-1 me-1.5 size-4" />
              <p className="text-sm whitespace-nowrap">Desconectado</p>
            </span>
          );
      }
    }, [type]);
}
