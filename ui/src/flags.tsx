export function isHighLowEnabled(userid: string): boolean {
    return ([
        // 'google-oauth2|113612696937596388912',
    ] as string[]).includes(userid);
}