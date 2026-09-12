let pendinUid: string | null = null;

export function setPendingUid(uid: string){
    pendinUid = uid;
}

export function getPendingUid(): string | null {
    return pendinUid;
}

export function clearPendingUid() {
    pendinUid = null;
}
