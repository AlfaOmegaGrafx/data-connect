import { getPlatformPrimaryColor } from "@/lib/platform/ui"
import {
  getConnectSourceEntries,
  getConnectSourceState,
  resolvePlatformForEntry,
} from "@/lib/platform/utils"
import type { Platform, Run } from "@/types"

export interface AvailableSourceCard {
  cardId: string
  iconName: string
  label: string
  stackPrimaryColor: string
  isAvailable: boolean
  isConnecting: boolean
  connectingStatusMessage?: string
  connectingRun?: Run
  onClick?: () => void
  priority: number
  index: number
}

interface BuildAvailableCardsInput {
  connectEntries: ReturnType<typeof getConnectSourceEntries>
  platforms: Platform[]
  connectedPlatformIdSet: Set<string>
  connectingPlatforms: Map<string, Run>
  forceConnectingPreview: boolean
  forcedPlatformId: string
  forcedStatus: string | undefined
  onExport: (platform: Platform) => void
}

export function buildAvailableCards({
  connectEntries,
  platforms,
  connectedPlatformIdSet,
  connectingPlatforms,
  forceConnectingPreview,
  forcedPlatformId,
  forcedStatus,
  onExport,
}: BuildAvailableCardsInput): AvailableSourceCard[] {
  const cards: AvailableSourceCard[] = []

  connectEntries.forEach((entry, index) => {
    const platform = resolvePlatformForEntry(platforms, entry)
    if (platform && connectedPlatformIdSet.has(platform.id)) return

    const state = getConnectSourceState(entry, platform)
    const shouldForceConnectingPreview =
      forceConnectingPreview &&
      (entry.id === forcedPlatformId || platform?.id === forcedPlatformId)

    const baseConnectingRun = platform
      ? connectingPlatforms.get(platform.id)
      : undefined
    const isConnecting = shouldForceConnectingPreview
      ? true
      : Boolean(platform && connectingPlatforms.has(platform.id))

    cards.push({
      cardId: platform?.id ?? entry.id,
      iconName: entry.displayName,
      label: `Connect ${entry.displayName}`,
      stackPrimaryColor: getPlatformPrimaryColor(entry),
      isAvailable: state === "available",
      isConnecting,
      connectingStatusMessage: shouldForceConnectingPreview
        ? forcedStatus
        : baseConnectingRun?.statusMessage,
      connectingRun: shouldForceConnectingPreview ? undefined : baseConnectingRun,
      onClick:
        state === "available" && platform ? () => onExport(platform) : undefined,
      priority: state === "available" ? 0 : 1,
      index,
    })
  })

  cards.sort((a, b) => a.priority - b.priority || a.index - b.index)
  return cards
}
