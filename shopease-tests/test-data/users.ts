// Seed accounts from BRD §8.1.
export const PASSWORD = 'Shop@123';

export const USERS = {
    alice: { username: 'alice', password: PASSWORD, fullName: 'Alice Johnson' },
    bob: { username: 'bob', password: PASSWORD, fullName: 'Bob Smith' },
    locked: { username: 'locked_user', password: PASSWORD, fullName: 'Locked User' },
} as const;

export type User = (typeof USERS)[keyof typeof USERS];