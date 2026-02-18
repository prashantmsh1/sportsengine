"use client";

import { Badge } from "@/components/ui/badge";
import type { Commentary } from "@/lib/types";
import { formatTime } from "@/lib/date-utils";

const EVENT_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
    goal: { icon: "⚽", color: "text-primary" },
    card: { icon: "🟨", color: "text-chart-3" },
    substitution: { icon: "🔄", color: "text-chart-2" },
    foul: { icon: "⚠️", color: "text-destructive" },
    corner: { icon: "📐", color: "text-chart-4" },
    offside: { icon: "🚩", color: "text-chart-5" },
    penalty: { icon: "🎯", color: "text-destructive" },
    kickoff: { icon: "▶️", color: "text-primary" },
    halftime: { icon: "⏸️", color: "text-chart-3" },
    fulltime: { icon: "🏁", color: "text-muted-foreground" },
    var: { icon: "📺", color: "text-chart-4" },
    general: { icon: "💬", color: "text-muted-foreground" },
};

export function CommentaryItem({
    commentary,
    isNew = false,
}: {
    commentary: Commentary;
    isNew?: boolean;
}) {
    const eventConfig =
        EVENT_TYPE_CONFIG[commentary.eventType || "general"] ?? EVENT_TYPE_CONFIG.general;

    return (
        <div
            className={`group relative flex gap-3.5 rounded-lg border p-3.5 transition-all duration-300 ${
                isNew
                    ? "animate-slide-in border-primary/20 bg-primary/[0.03]"
                    : "border-border/30 bg-transparent hover:border-border/50 hover:bg-card/30"
            }`}>
            {/* Minute badge */}
            <div className="flex flex-col items-center shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 text-xs font-semibold tabular-nums">
                    {commentary.minute !== null ? `${commentary.minute}'` : "—"}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-sm">{eventConfig.icon}</span>
                    {commentary.eventType && (
                        <Badge
                            variant="outline"
                            className={`text-[10px] capitalize px-1.5 py-0 ${eventConfig.color} border-current/15`}>
                            {commentary.eventType}
                        </Badge>
                    )}
                    {commentary.team && (
                        <span className="text-[10px] font-medium text-muted-foreground/70">
                            {commentary.team}
                        </span>
                    )}
                    {commentary.period && (
                        <span className="text-[10px] text-muted-foreground/50 ml-auto">
                            {commentary.period}
                        </span>
                    )}
                </div>

                {commentary.actor && (
                    <p className="text-sm font-medium mb-0.5">{commentary.actor}</p>
                )}

                {commentary.message && (
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                        {commentary.message}
                    </p>
                )}

                {/* Tags */}
                {commentary.tags && commentary.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {commentary.tags.map((tag, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <span className="text-[10px] text-muted-foreground/40 mt-1.5 block">
                    {formatTime(commentary.createdAt)}
                </span>
            </div>
        </div>
    );
}
