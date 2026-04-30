import { useDraggable } from "@dnd-kit/core";
    import React from "react";
    export function Draggable({
      id,
      children,
    }: {
      id: string;
      children: React.ReactNode;
    }) {
      const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
      });
      const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;
      return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
          {children}
        </div>
      );
    }