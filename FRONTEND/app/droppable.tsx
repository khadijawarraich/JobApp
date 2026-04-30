 import { useDroppable } from "@dnd-kit/core";
    import React from "react";
    export function Droppable({
      id,
      children,
    }: {
      id: string;
      children: React.ReactNode;
    }) {
      const { isOver, setNodeRef } = useDroppable({
        id: id,
      });
      const style = {
        border: isOver ? "" : "none",
      };
      return (
        <div ref={setNodeRef} style={style}>
          {children}
        </div>
      );
    }