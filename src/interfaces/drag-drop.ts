// Draggable interface for draggable items (project item)
export interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

// DragTarget interface for drag areas (project list)
export interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  drageLeaveHandler(event: DragEvent): void;
}
