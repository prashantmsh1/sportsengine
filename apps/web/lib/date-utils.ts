// Simple date utility helpers (no dependencies)

export function format(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDistanceToNow(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const absDiff = Math.abs(diffMs);
    const isPast = diffMs < 0;

    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    let result: string;
    if (minutes < 1) result = "just now";
    else if (minutes < 60) result = `${minutes}m`;
    else if (hours < 24) result = `${hours}h`;
    else result = `${days}d`;

    if (result === "just now") return result;
    return isPast ? `${result} ago` : `in ${result}`;
}

export function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
