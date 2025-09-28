// The callback function type for exportHtml
export type ExportHtmlCallback = (data: { html: string; design: any }) => void;

// The callback function type for saveDesign
export type SaveDesignCallback = (data: any) => void;

// The design object type for loadDesign
export type Design = any;

// Interface for the Unlayer Editor
export interface UnlayerEditor {
  exportHtml: (callback: ExportHtmlCallback) => void;
  saveDesign: (callback: SaveDesignCallback) => void;
  loadDesign: (design: Design) => void;
  addEventListener: (event: string, callback: () => void) => void;
}

// This is the type that the parent component will see.
// It defines the public-facing methods of your child component.
export interface ChildComponentPublicMethods {
  exportHtml: UnlayerEditor['exportHtml'];
  saveDesign: UnlayerEditor['saveDesign'];
  loadDesign: UnlayerEditor['loadDesign'];
  editor: UnlayerEditor | null;
}

// These are the props that your child component will accept.
export interface EmailEditorProps {
  minHeight?: number | string;
  options?: Record<string, any>;
  scriptUrl?: string;
  editorId?: string;
}
