import { MATCH_STATUS } from "../validation/matches";

interface Match {
    startTime: Date;
    endTime: Date;
    status?: string;
}

export function getMatchStatus(match: Match) {
    const now = new Date();
    const start = new Date(match.startTime);
    const end = new Date(match.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(
    match: Match,
    updateStatus: (status: string) => Promise<void>,
) {
    const nextStatus = getMatchStatus(match);
    if (!nextStatus) {
        return match.status;
    }
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        match.status = nextStatus;
    }
    return match.status;
}
