import type { McpTool, ToolResponse, ToolContext } from 'vite-plugin-mcp-client-tools'
import type { ConsoleInterceptor } from 'vite-plugin-mcp-client-tools/tools/read-console'
import { z } from 'zod'

const inputSchema = { tail: z.number().optional() }

export const readConsoleTool: McpTool = {
  name: 'readConsole',
  description: 'Read recent browser console logs',
  inputSchema,
  // If your toolkit exposes a proper ConsoleInterceptor constructor/mixin, use it:
  // component: consoleInterceptor,
  // otherwise keep it out until you wire the component:
  handler: async (ctx: ToolContext, { tail }: { tail?: number }): Promise<ToolResponse> => {
    const comp = ctx.component as unknown as ConsoleInterceptor | undefined
    if (!comp) {
      return { content: [{ type: 'text', text: 'Console interceptor is not mounted.' }] }
    }
    const logs = await comp.getConsoleLogs({ tail: tail ?? 200 })
    return { content: [{ type: 'json', data: logs }] }
  },
}
