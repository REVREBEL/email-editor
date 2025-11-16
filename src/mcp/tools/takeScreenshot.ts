// src/mcp/tools/takeScreenshot.ts
import type { McpTool, ToolContext, ToolResponse } from 'vite-plugin-mcp-client-tools'
import { takeScreenshotTool as base } from 'vite-plugin-mcp-client-tools/tools/take-screenshot'

// Minimal interface for what we need from the component
interface ScreenShareOverlay {
  captureScreenshot(): Promise<{ dataUrl: string; mimeType: string }>
}

export const takeScreenshot: McpTool = {
  name: 'take-screenshot',
  description: 'Capture a screenshot from the active page and return it as an image',
  // Reuse the package’s component so ctx.component has the right runtime object
  component: base.component,
  // (Optional) re-expose any server helpers the base tool provides
  // server: base.server,

  // Use ctx param instead of `this`, then narrow at runtime
  handler: async (ctx: ToolContext): Promise<ToolResponse> => {
    const comp = ctx.component as unknown as ScreenShareOverlay | undefined
    if (!comp) {
      return { content: [{ type: 'text', text: 'Screenshot component not mounted.' }] }
    }

    const { dataUrl, mimeType } = await comp.captureScreenshot()

    // dataUrl: "data:image/png;base64,...."
    const base64 = dataUrl.split(',')[1] ?? ''
    return {
      content: [
        {
          type: 'image',
          mimeType: mimeType || 'image/png',
          data: base64,
        },
      ],
    }
  },
}
